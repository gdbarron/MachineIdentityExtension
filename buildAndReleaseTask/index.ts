import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        let vcertArgs: string = ''

        // let action:string = tl.getInput('action', true)
        let action = tl.getInput('action', true) as string

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
        console.log(vcertArgs)
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

// use --no-prompt
run();