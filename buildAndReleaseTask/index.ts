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

        var pickupIdEnvVarName: string = 'VCERT_PICKUPID'
        var certEnvVarName: string = 'VCERT_CERT'
        let vcertArgs: string[] = []
        let vcertPath: string = path.join(__dirname, 'bin/vcert_')

        // pickup file will be placed here
        // const tempPath = process.env['AGENT_TEMPDIRECTORY']

        // const tempPath = tl.getVariable('AGENT_TEMPDIRECTORY')
        const enrollIdFilePath = path.join(__dirname, 'pickupid')

        var isWin = (process.platform === "win32")
        var isLinux = (process.platform === "linux")
        var isMac = (process.platform === "darwin")

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
        let enrollFormat = tl.getInput('enrollFormat', true) as string
        let enrollChain = tl.getInput('enrollChain', true) as string
        let enrollSanDns = tl.getDelimitedInput('enrollSanDns', ',', false) as string[]
        let enrollSanEmailTpp = tl.getDelimitedInput('enrollSanEmailTpp', ',', false) as string[]
        let enrollSanIpTpp = tl.getDelimitedInput('enrollSanIpTpp', ',', false) as string[]
        let enrollCustomFieldsTpp = tl.getInput('enrollCustomFieldsTpp', false) as string
        let enrollCsrTpp = tl.getInput('enrollCsrTpp', false) as string
        let enrollCsrCloud = tl.getInput('enrollCsrCloud', false) as string
        let enrollCsrFile = tl.getInput('enrollCsrFile', false) as string
        let enrollNoPickup = tl.getBoolInput('enrollNoPickup', false) as boolean
        let enrollOutputType = tl.getInput('enrollOutputType', enrollNoPickup === false && (enrollFormat === 'pem' || enrollFormat === 'json')) as string
        let enrollOutputFile = tl.getPathInput('enrollOutputFile', enrollOutputType === 'outputFile' || enrollFormat === 'pkcs12.file' || enrollFormat === 'jks.file') as string

        // pickup
        let pickupFormat = tl.getInput('pickupFormat', true) as string
        let pickupIdFrom = tl.getInput('pickupIdFrom', action === 'pickupAction') as string
        let pickupId = tl.getInput('pickupId', pickupIdFrom === 'pickupIdFromId') as string
        let pickupFile = tl.getPathInput('pickupFile', pickupIdFrom === 'pickupIdFromFile') as string
        let pickupOutputType = tl.getInput('pickupOutputType', pickupFormat === 'pem' || pickupFormat === 'json') as string
        let pickupOutputFile = tl.getPathInput('pickupOutputFile', pickupOutputType === 'outputFile' || pickupFormat === 'pkcs12' || pickupFormat === 'jks') as string

        // advanced
        let verbose = tl.getBoolInput('verbose', false) as boolean

        vcertPath += process.platform
        switch (process.platform) {
            case 'win32':
                break;

            case 'linux':
            case 'darwin':
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
                vcertArgs.push(enrollFormat.replace('.file', ''))

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

                if (enrollNoPickup) {
                    vcertArgs.push('--no-pickup')
                } else {
                    if (enrollOutputFile) {
                        vcertArgs.push('--file')
                        vcertArgs.push(enrollOutputFile)
                    }
                }

                // tpp specific params, not supported on cloud
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

                    if (enrollCustomFieldsTpp) {
                        const customFields = JSON.parse(enrollCustomFieldsTpp)
                        for (var key in customFields) {
                            vcertArgs.push('--field')
                            vcertArgs.push(key + '=' + customFields[key])
                        }
                    }
                }

                // always redirect pickup id to a file
                // without this it will go to stdout and cause issues
                // as both the cert and this go to stdout
                vcertArgs.push('--pickup-id-file')
                vcertArgs.push(enrollIdFilePath)

                break;

            case "pickupAction":

                vcertArgs.push('pickup')

                switch (pickupIdFrom) {
                    case 'pickupIdFromEnvVar':
                        var thisId = tl.getVariable(pickupIdEnvVarName)
                        if (thisId) {
                            thisId = thisId.trim()
                            vcertArgs.push('--pickup-id')
                            vcertArgs.push(thisId)
                        } else {
                            throw 'No pickup ID was found at environment variable ' + pickupIdEnvVarName
                        }
                        break;

                    case 'pickupIdFromId':
                        vcertArgs.push('--pickup-id')
                        vcertArgs.push(pickupId)
                        break;

                    case 'pickupIdFromFile':
                        vcertArgs.push('--pickup-id-file')
                        vcertArgs.push(pickupFile)
                        break;

                    default:
                        throw 'Unknown pickup type ' + pickupIdFrom
                        break;
                }

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
            console.log('vcert path: ' + vcertPath)
            console.log('vcert args: ' + vcertArgs)
        }


        // const { execFile } = require('child_process');
        var child_process = require('child_process');

        // run with version switch first
        var childVersion = child_process.spawnSync(vcertPath, ['--version'], { encoding: 'utf8' });
        console.log(childVersion.stdout)
        // const childVersion = child_process(vcertPath, ['--version'], (error: string, stdout: string, stderr: string) => {
        //     if (error) {
        //         throw error;
        //     }
        //     console.log(stdout);
        // });

        // const child = execFile(vcertPath, vcertArgs, (error: string, stdout: string, stderr: string) => {
        //     if (error) {
        //         throw error;
        //     }
        //     console.log(stdout);
        //     certOut = stdout
        // });

        var child = child_process.spawnSync(vcertPath, vcertArgs, { encoding: 'utf8' });

        if (child.error) {
            throw child.error;
        }
        // tl.debug("stdout: " + child.stdout);
        // tl.debug("stderr: " + child.stderr);
        tl.debug("exit code: " + child.status);
        console.log(child.stderr)

        switch (action) {
            case 'enrollAction':
                if (!enrollNoPickup) {
                    if (enrollOutputType === 'outputEnvVar' && (enrollFormat === 'pem' || enrollFormat === 'json')) {
                        // certOut = certOut.replace(/\n/g, '');
                        // console.log(certOut)
                        tl.setVariable(certEnvVarName, child.stdout)
                        console.log('Contents of certificate, with ' + enrollFormat + ' format, saved to environment variable ' + certEnvVarName)
                    } else {
                        console.log('Contents of certificate, with ' + enrollFormat + ' format, saved to ' + enrollOutputFile)
                    }
                }

                // write pickup id to env var
                var enrollPickupId = fs.readFileSync(enrollIdFilePath, 'utf8')
                tl.setVariable(pickupIdEnvVarName, enrollPickupId)
                console.log('Pickup ID saved to environment variable ' + pickupIdEnvVarName)

                break;

            case 'pickupAction':

                if (pickupOutputType === 'outputEnvVar' && (pickupFormat === 'pem' || pickupFormat === 'json')) {
                    tl.setVariable(certEnvVarName, child.stdout)
                    console.log('Contents of certificate, with ' + pickupFormat + ' format, saved to environment variable ' + certEnvVarName)
                } else {
                    console.log('Contents of certificate, with ' + pickupFormat + ' format, saved to ' + pickupOutputFile)
                }

                break;

            case 'getcredAction':

                break;

            default:
                break;
        }
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