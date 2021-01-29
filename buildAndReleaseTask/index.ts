import path = require('path')
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs');

async function run() {
    try {
        let vcertArgs: string[] = []
        let vcertPath: string = path.join(__dirname, 'bin/vcert_')

        var isWin = process.platform === "win32";
        var isLinux = process.platform === "linux";
        var isMac = process.platform === "darwin";

        // let action:string = tl.getInput('action', true)
        let action = tl.getInput('action', true) as string
        let serverType = tl.getInput('serverType', true) as string
        let runParams = tl.getInput('runParams', false) as string
        let tppServerUrl = tl.getInput('tppServerUrl', (serverType === 'tpp')) as string
        let tppAuthToken = tl.getInput('tppAuthToken', (serverType === 'tpp')) as string
        let cloudApiKey = tl.getInput('cloudApiKey', (serverType === 'cloud')) as string
        let cloudZone = tl.getInput('cloudZone', (serverType === 'cloud')) as string

        // enroll
        let enrollCommonName = tl.getInput('enrollCommonName', (action === 'enrollAction')) as string
        let enrollZoneTpp = tl.getInput('enrollZoneTpp', (serverType === 'tpp')) as string
        let enrollKeyPassword = tl.getInput('enrollKeyPassword', false) as string
        let enrollFormat = tl.getInput('enrollFormat', false) as string
        let enrollChain = tl.getInput('enrollChain', false) as string
        let enrollSanDns = tl.getInput('enrollSanDns', false) as string
        let enrollSanEmail = tl.getInput('enrollSanEmail', false) as string
        let enrollSanIp = tl.getInput('enrollSanIp', false) as string

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
                    vcertArgs.push(cloudZone)
                } else {
                    vcertArgs.push(enrollZoneTpp)
                }

                vcertArgs.push('--cn')
                vcertArgs.push(enrollCommonName)
                vcertArgs.push('--format')
                vcertArgs.push(enrollFormat)
                vcertArgs.push('--chain')
                vcertArgs.push(enrollChain)

                if (enrollSanDns) {
                    var sanDns = enrollSanDns.split(",")
                    sanDns.forEach(element => {
                        vcertArgs.push('--san-dns')
                        vcertArgs.push(element)
                    });
                }

                if (enrollSanEmail) {
                    var sanEmail = enrollSanEmail.split(",")
                    sanEmail.forEach(element => {
                        vcertArgs.push('--san-email')
                        vcertArgs.push(element)
                    });
                }

                if (enrollSanIp) {
                    var sanIp = enrollSanIp.split(",")
                    sanIp.forEach(element => {
                        vcertArgs.push('--san-ip')
                        vcertArgs.push(element)
                    });
                }

                if (enrollKeyPassword) {
                    vcertArgs.push('--key-password')
                    vcertArgs.push(enrollKeyPassword)
                } else {
                    vcertArgs.push('--no-prompt')
                }
                break;
            case "pickupAction":
                vcertArgs.push('pickup')
                break;
            case "renewAction":
                vcertArgs.push('renew')
                break;
        }

        // needed for all cloud/tpp actions
        if (serverType === 'cloud') {
            vcertArgs.push('-k')
            vcertArgs.push(cloudApiKey)
        } else {
            vcertArgs.push('-u')
            vcertArgs.push('https://' + tppServerUrl)
            vcertArgs.push('-t')
            vcertArgs.push(tppAuthToken)
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
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

// use --no-prompt
run();