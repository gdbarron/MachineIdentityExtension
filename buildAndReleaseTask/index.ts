// AZURE-PIPELINES-TASK-LIB TYPESCRIPT API
// https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md

import path = require('path')
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs');

async function run() {
    try {

        // console.log('Token: ' + (tl.getVariable('getcredToken')))
        // console.log(tl.getVariables())
        // tl.setVariable('getcredToken', 'TokenTest')

        let vcertArgs: string[] = []
        let vcertPath: string = path.join(__dirname, 'bin/vcert_')

        var isWin = process.platform === "win32";
        var isLinux = process.platform === "linux";
        var isMac = process.platform === "darwin";

        let action = tl.getInput('action', true) as string
        let serverType = tl.getInput('serverType', true) as string
        let runParams = tl.getInput('runParams', false) as string
        let serverUrlTpp = tl.getInput('serverUrlTpp', (serverType === 'tpp')) as string
        let authTypeTpp = tl.getInput('authTypeTpp', (serverType === 'tpp')) as string
        let authTokenTpp = tl.getInput('authTokenTpp', (serverType === 'tpp' && authTypeTpp === 'token')) as string
        let authUsernameTpp = tl.getInput('authUsernameTpp', (serverType === 'tpp' && authTypeTpp === 'username')) as string
        let authPasswordTpp = tl.getInput('authPasswordTpp', (serverType === 'tpp' && authTypeTpp === 'username')) as string
        let apiKeyCloud = tl.getInput('apiKeyCloud', (serverType === 'cloud')) as string

        // enroll
        let enrollZoneCloud = tl.getInput('enrollZoneCloud', (serverType === 'cloud')) as string
        let enrollCommonName = tl.getInput('enrollCommonName', (action === 'enrollAction')) as string
        let enrollNicknameTpp = tl.getInput('enrollNicknameTpp', false) as string
        let enrollZoneTpp = tl.getInput('enrollZoneTpp', (serverType === 'tpp')) as string
        let enrollKeyPassword = tl.getInput('enrollKeyPassword', false) as string
        let enrollFormat = tl.getInput('enrollFormat', false) as string
        let enrollChain = tl.getInput('enrollChain', false) as string
        let enrollSanDns = tl.getDelimitedInput('enrollSanDns', ',', false) as string[]
        let enrollSanEmailTpp = tl.getDelimitedInput('enrollSanEmailTpp', ',', false) as string[]
        let enrollSanIpTpp = tl.getDelimitedInput('enrollSanIpTpp', ',', false) as string[]
        let enrollCustomFieldsTpp = tl.getInput('enrollCustomFieldsTpp', false) as string
        let enrollCsrTpp = tl.getInput('enrollCsrTpp', false) as string
        let enrollCsrCloud = tl.getInput('enrollCsrCloud', false) as string
        let enrollCsrFile = tl.getInput('enrollCsrFile', false) as string

        // advanced
        let verbose = tl.getBoolInput('verbose', false) as boolean

        switch (process.platform) {
            case 'win32':
                vcertPath += 'windows.exe'
                break;

            case 'linux':
                vcertPath += 'linux'
                // need to make vcert executable
                fs.chmodSync(vcertPath, 0o111)
                break;

            case 'darwin':
                vcertPath += 'darwin'
                // need to make vcert executable
                fs.chmodSync(vcertPath, 0o111)
                break;

            default:
                throw 'Unsupported platform.  Only windows, linux, and mac.'
                break;
        }

        switch (action) {
            case "enrollAction":
                vcertArgs.push('enroll')

                vcertArgs.push('-z')
                if (serverType === 'cloud') {
                    vcertArgs.push(enrollZoneCloud)
                } else {
                    vcertArgs.push(enrollZoneTpp)
                }

                vcertArgs.push('--cn')
                vcertArgs.push(enrollCommonName)
                vcertArgs.push('--format')
                vcertArgs.push(enrollFormat)
                vcertArgs.push('--chain')
                vcertArgs.push(enrollChain)
                vcertArgs.push('--csr')
                if (serverType === 'cloud') {
                    if (enrollCsrCloud === 'file') {
                        vcertArgs.push('file:' + enrollCsrFile)
                    } else {
                        vcertArgs.push(enrollCsrCloud)
                    }
                } else {
                    if (enrollCsrCloud === 'file') {
                        vcertArgs.push('file:' + enrollCsrFile)
                    } else {
                        vcertArgs.push(enrollCsrTpp)
                    }
                }

                if (enrollSanDns) {
                    // var sanDns = enrollSanDns.split(",")
                    enrollSanDns.forEach(element => {
                        vcertArgs.push('--san-dns')
                        vcertArgs.push(element)
                    });
                }

                if (enrollKeyPassword) {
                    vcertArgs.push('--key-password')
                    vcertArgs.push(enrollKeyPassword)
                } else {
                    vcertArgs.push('--no-prompt')
                }

                // tpp specific params
                if (serverType === 'tpp') {
                    if (enrollNicknameTpp) {
                        vcertArgs.push('--nickname')
                        vcertArgs.push(enrollNicknameTpp)
                    }

                    if (enrollSanEmailTpp) {
                        // var sanEmail = enrollSanEmailTpp.split(",")
                        enrollSanEmailTpp.forEach(element => {
                            vcertArgs.push('--san-email')
                            vcertArgs.push(element)
                        });
                    }

                    if (enrollSanIpTpp) {
                        // var sanIp = enrollSanIpTpp.split(",")
                        enrollSanIpTpp.forEach(element => {
                            vcertArgs.push('--san-ip')
                            vcertArgs.push(element)
                        });
                    }

                    console.log(enrollCustomFieldsTpp)
                    // for (var item of enrollCustomFieldsTpp) {
                    //     console.log('item: ', [item.firstname, ...]);
                    // }
                }

                break;
            case "pickupAction":
                vcertArgs.push('pickup')
                break;
            case "renewAction":
                vcertArgs.push('renew')
                break;
            case "getcredAction":
                vcertArgs.push('getcred')
                break;
        }

        // needed for all cloud/tpp actions
        if (serverType === 'cloud' && action !== 'getcredAction') {
            vcertArgs.push('-k')
            vcertArgs.push(apiKeyCloud)
        } else {
            // tpp specific
            vcertArgs.push('-u')
            vcertArgs.push('https://' + serverUrlTpp)
            if (authTypeTpp === 'token' && action !== 'getcredAction') {
                vcertArgs.push('-t')
                vcertArgs.push(authTokenTpp)
            } else {
                vcertArgs.push('--username')
                vcertArgs.push(authUsernameTpp)
                vcertArgs.push('--password')
                vcertArgs.push(authPasswordTpp)
            }
        }

        if (verbose) {
            vcertArgs.push('--verbose')
        }

        console.log(vcertPath)
        console.log(vcertArgs)

        const { execFile } = require('child_process');

        // run with version switch first
        const childVersion = execFile(vcertPath, ['--version'], (error: string, stdout: string, stderr: string) => {
            if (error) {
                throw error;
            }
            console.log(stdout);
        });

        const child = execFile(vcertPath, vcertArgs, (error: string, stdout: string, stderr: string) => {
            if (error) {
                throw error;
            }
            console.log(stdout);
        });

        if (action === 'getcredAction') {
            // tl.setVariable('VCertToken', '', true)
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

// use --no-prompt
run();