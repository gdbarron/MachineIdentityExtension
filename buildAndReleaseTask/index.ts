import path = require('path')
import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        let vcertArgs: string[] = []
        let vcertPath: string = 'bin/vcert_'

        var isWin = process.platform === "win32";
        var isLinux = process.platform === "linux";
        var isMac = process.platform === "darwin";

        // let action:string = tl.getInput('action', true)
        let action = tl.getInput('action', true) as string
        let serverType = tl.getInput('serverType', true) as string
        let runParams = tl.getInput('runParams', false) as string
        let cloudApiKey = tl.getInput('cloudApiKey', (serverType === 'cloud')) as string
        let cloudZone = tl.getInput('cloudZone', (serverType === 'cloud')) as string
        let enrollCommonName = tl.getInput('cloudZone', (action === 'enrollAction')) as string

        switch (process.platform) {
            case 'win32':
                vcertPath += 'windows.exe'
                break;

            case 'linux':
                vcertPath += 'linux'
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
                vcertArgs.push('--cn')
                vcertArgs.push(enrollCommonName)
                break;
            case "pickupAction":
                vcertArgs.push('pickup')
                break;
            case "renewAction":
                vcertArgs.push('renew')
                break;
        }

        if (serverType === 'cloud') {
            vcertArgs.push('-k')
            vcertArgs.push(cloudApiKey)
            vcertArgs.push('-z')
            vcertArgs.push(cloudZone)
        }

        console.log(path.join(__dirname, vcertPath))
        console.log(vcertArgs)

        const { execFile } = require('child_process');
        const child = execFile(path.join(__dirname, vcertPath), vcertArgs, (error: string, stdout: string, stderr: string) => {
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