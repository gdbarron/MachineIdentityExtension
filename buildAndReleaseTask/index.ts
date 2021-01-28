import path = require('path')
import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        let vcertArgs: string = ''
        let vcertPath: string = 'bin/vcert_'

        var isWin = process.platform === "win32";
        var isLinux = process.platform === "linux";
        var isMac = process.platform === "darwin";

        // let action:string = tl.getInput('action', true)
        let action = tl.getInput('action', true) as string
        let runParams = tl.getInput('runParams', false) as string

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
                vcertArgs = 'enroll'
                break;
            case "pickupAction":
                vcertArgs = 'pickup'
                break;
            case "renewAction":
                vcertArgs = 'renew'
                break;
        }

        console.log(__dirname)

        vcertArgs += ' ' + runParams
        console.log(path.join(__dirname, vcertPath))
        console.log(vcertArgs)

        const { execFile } = require('child_process');
        const child = execFile(path.join(__dirname, vcertPath), [vcertArgs], (error: string, stdout: string, stderr: string) => {
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