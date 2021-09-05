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

        var certIdEnvVarName: string = 'VENAFI_ID'
        var certEnvVarName: string = 'VENAFI_CERT'
        var tppTokenEnvVarName: string = 'VENAFI_TPP_TOKEN'
        let vcertArgs: string[] = []
        let vcertPath: string = path.join(__dirname, 'bin/vcert_')

        // pickup file will be placed here
        // const tempPath = process.env['AGENT_TEMPDIRECTORY']

        // const tempPath = tl.getVariable('AGENT_TEMPDIRECTORY')
        const requestIdFilePath = path.join(__dirname, 'certid')

        var isWin = (process.platform === "win32")
        var isLinux = (process.platform === "linux")
        var isMac = (process.platform === "darwin")

        let action = tl.getInput('action', true) as string
        let serverType = tl.getInput('serverType', true) as string
        // let runParams = tl.getInput('runParams', false) as string
        let serverUrlTpp = tl.getInput('serverUrlTpp', (serverType === 'tpp')) as string
        let authTokenFrom = tl.getInput('authTokenFrom', serverType === 'tpp' && action !== 'getToken') as string
        let authToken = tl.getInput('authToken', serverType === 'tpp' && authTokenFrom === 'inline' && action !== 'getToken') as string
        let apiKey = tl.getInput('apiKey', (serverType === 'cloud')) as string

        // request/enroll
        let requestDestination = tl.getInput('requestDestination', action === 'request') as string
        let requestCommonName = tl.getInput('requestCommonName', action === 'request') as string
        let requestNicknameTpp = tl.getInput('requestNicknameTpp', false) as string
        let requestKeyPassword = tl.getInput('requestKeyPassword', false) as string
        let requestFormat = tl.getInput('requestFormat', action === 'request') as string
        let requestChain = tl.getInput('requestChain', action === 'request') as string
        let requestSanDns = tl.getDelimitedInput('requestSanDns', ',', false) as string[]
        let requestSanEmailTpp = tl.getDelimitedInput('requestSanEmailTpp', ',', false) as string[]
        let requestSanIpTpp = tl.getDelimitedInput('requestSanIpTpp', ',', false) as string[]
        let requestCustomFieldsTpp = tl.getInput('requestCustomFieldsTpp', false) as string
        let requestCsrTpp = tl.getInput('requestCsrTpp', false) as string
        let requestCsrCloud = tl.getInput('requestCsrCloud', false) as string
        let requestCsrFile = tl.getInput('requestCsrFile', false) as string
        let requestNoRetrieval = tl.getBoolInput('requestNoRetrieval', false) as boolean
        let requestOutputType = tl.getInput('requestOutputType', requestNoRetrieval === false && (requestFormat === 'pem' || requestFormat === 'json')) as string
        let requestOutputFile = tl.getPathInput('requestOutputFile', requestOutputType === 'file' || requestFormat === 'pkcs12.file' || requestFormat === 'jks.file') as string

        // retrieve/pickup
        let retrieveFormat = tl.getInput('retrieveFormat', action === 'retrieve') as string
        let retrieveIdFrom = tl.getInput('retrieveIdFrom', action === 'retrieve') as string
        let retrieveId = tl.getInput('retrieveId', retrieveIdFrom === 'id') as string
        let retrieveFile = tl.getPathInput('retrieveFile', retrieveIdFrom === 'file') as string
        let retrieveOutputType = tl.getInput('retrieveOutputType', retrieveFormat === 'pem' || retrieveFormat === 'json') as string
        let retrieveOutputFile = tl.getPathInput('retrieveOutputFile', retrieveOutputType === 'file' || retrieveFormat === 'pkcs12' || retrieveFormat === 'jks') as string

        // renew
        let renewIdFrom = tl.getInput('renewIdFrom', action === 'renew') as string
        let renewId = tl.getInput('renewId', renewIdFrom === 'id') as string
        let renewFile = tl.getPathInput('renewFile', renewIdFrom === 'file') as string

        // getToken
        let getTokenUsername = tl.getInput('getTokenUsername', (serverType === 'tpp' && action === 'getToken')) as string
        let getTokenPassword = tl.getInput('getTokenPassword', (serverType === 'tpp' && action === 'getToken')) as string
        let getTokenClientId = tl.getInput('getTokenClientId', false) as string
        let getTokenScope = tl.getInput('getTokenScope', false) as string

        // advanced
        let verbose = tl.getBoolInput('verbose', false) as boolean
        let testMode = tl.getBoolInput('testMode', false) as boolean

        vcertPath += process.platform
        switch (process.platform) {
            case 'win32':
                break;

            case 'linux':
            case 'darwin':
                // need to make vcert executable for linux and mac
                fs.chmodSync(vcertPath, 0o111)
                break;

            default:
                throw 'Unsupported platform.  Only windows, linux, and mac.'
                break;
        }

        switch (action) {
            case "request":
                vcertArgs.push('enroll')
                vcertArgs.push('--app-info')
                vcertArgs.push('Machine Identity Extension for Azure DevOps')

                vcertArgs.push('-z')
                vcertArgs.push(requestDestination)

                vcertArgs.push('--cn')
                vcertArgs.push(requestCommonName)

                vcertArgs.push('--format')
                vcertArgs.push(requestFormat.replace('.file', ''))

                vcertArgs.push('--chain')
                vcertArgs.push(requestChain)

                vcertArgs.push('--csr')
                if (serverType === 'cloud') {
                    if (requestCsrCloud === 'file') {
                        vcertArgs.push('file:' + requestCsrFile)
                    } else {
                        vcertArgs.push(requestCsrCloud)
                    }
                } else {
                    if (requestCsrCloud === 'file') {
                        vcertArgs.push('file:' + requestCsrFile)
                    } else {
                        vcertArgs.push(requestCsrTpp)
                    }
                }

                if (requestSanDns) {
                    // var sanDns = requestSanDns.split(",")
                    requestSanDns.forEach(element => {
                        vcertArgs.push('--san-dns')
                        vcertArgs.push(element)
                    });
                }

                if (requestKeyPassword) {
                    vcertArgs.push('--key-password')
                    vcertArgs.push(requestKeyPassword)
                } else {
                    vcertArgs.push('--no-prompt')
                }

                if (requestNoRetrieval) {
                    vcertArgs.push('--no-pickup')
                } else {
                    if (requestOutputType === 'file') {
                        vcertArgs.push('--file')
                        vcertArgs.push(requestOutputFile)
                    }
                }

                // tpp specific params, not supported on cloud
                if (serverType === 'tpp') {
                    if (requestNicknameTpp) {
                        vcertArgs.push('--nickname')
                        vcertArgs.push(requestNicknameTpp)
                    }

                    if (requestSanEmailTpp) {
                        // var sanEmail = requestSanEmailTpp.split(",")
                        requestSanEmailTpp.forEach(element => {
                            vcertArgs.push('--san-email')
                            vcertArgs.push(element)
                        });
                    }

                    if (requestSanIpTpp) {
                        // var sanIp = requestSanIpTpp.split(",")
                        requestSanIpTpp.forEach(element => {
                            vcertArgs.push('--san-ip')
                            vcertArgs.push(element)
                        });
                    }

                    if (requestCustomFieldsTpp) {
                        const customFields = JSON.parse(requestCustomFieldsTpp)
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
                vcertArgs.push(requestIdFilePath)

                break;

            case "retrieve":

                vcertArgs.push('pickup')

                switch (retrieveIdFrom) {
                    case 'priorRequest':
                        var thisId = tl.getVariable(certIdEnvVarName)
                        if (thisId) {
                            // thisId = thisId.trim()
                            vcertArgs.push('--pickup-id')
                            vcertArgs.push('\\ved\\policy\\' + thisId)
                        } else {
                            throw 'No certificate ID was found at environment variable ' + certIdEnvVarName + '.  Ensure your prior request was successful.'
                        }
                        break;

                    case 'id':
                        vcertArgs.push('--pickup-id')
                        vcertArgs.push('\\ved\\policy\\' + retrieveId)
                        break;

                    case 'file':
                        vcertArgs.push('--pickup-id-file')
                        var retrieveIdFromFile = fs.readFileSync(retrieveFile, 'utf8')
                        vcertArgs.push('\\ved\\policy\\' + retrieveIdFromFile)
                        // vcertArgs.push(retrieveFile)
                        break;

                    default:
                        throw 'Unknown retrieve type ' + retrieveIdFrom
                        break;
                }

                break;

            case "renew":

                vcertArgs.push('renew')

                switch (renewIdFrom) {
                    case 'envVar':
                        var thisId = tl.getVariable(certIdEnvVarName)
                        if (thisId) {
                            // thisId = thisId.trim()
                            vcertArgs.push('--id')
                            vcertArgs.push('\\ved\\policy\\' + thisId)
                        } else {
                            throw 'No certificate ID was found at environment variable ' + certIdEnvVarName + '.  Ensure your prior request was successful.'
                        }
                        break;

                    case 'id':
                        vcertArgs.push('--id')
                        vcertArgs.push('\\ved\\policy\\' + renewId)
                        break;

                    case 'file':
                        vcertArgs.push('--id')
                        var renewIdFromFile = fs.readFileSync(renewFile, 'utf8')
                        vcertArgs.push('\\ved\\policy\\' + renewIdFromFile)
                        // vcertArgs.push('file:' + renewFile)
                        break;

                    default:
                        throw 'Unknown renew from ' + renewIdFrom
                        break;
                }

                break;

            case "getToken":

                vcertArgs.push('getcred')
                vcertArgs.push('--username')
                vcertArgs.push(getTokenUsername)
                vcertArgs.push('--password')
                vcertArgs.push(getTokenPassword)
                vcertArgs.push('--format')
                vcertArgs.push('json')

                if (getTokenClientId) {
                    vcertArgs.push('--client-id')
                    vcertArgs.push(getTokenClientId)
                }

                if (getTokenScope) {
                    vcertArgs.push('--scope')
                    vcertArgs.push(getTokenScope)
                }

                break;
        }

        // needed for all cloud/tpp actions
        if (serverType === 'cloud') {
            vcertArgs.push('-k')
            vcertArgs.push(apiKey)
        } else {
            // tpp specific
            vcertArgs.push('-u')
            vcertArgs.push('https://' + serverUrlTpp)

            if (action !== 'getToken') {
                vcertArgs.push('-t')
                if (authTokenFrom === 'inline') {
                    vcertArgs.push(authToken)
                } else {
                    var thisToken = tl.getVariable(tppTokenEnvVarName)
                    if (thisToken) {
                        vcertArgs.push(thisToken)
                    } else {
                        throw 'No token was found at environment variable ' + tppTokenEnvVarName + '.  Do you have a Get Token action task earlier in the pipeline?'
                    }
                }
            }
            // if (authTypeTpp === 'token' && action !== 'getToken') {
            // } else {
            //     vcertArgs.push('--tpp-user')
            //     vcertArgs.push(authUsernameTpp)
            //     vcertArgs.push('--tpp-password')
            //     vcertArgs.push(authPasswordTpp)
            // }
        }

        if (verbose) {
            vcertArgs.push('--verbose')
            console.log('vcert path: ' + vcertPath)
            console.log('vcert args: ' + vcertArgs)
        }

        if (testMode) {
            vcertArgs.push('--test-mode')
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
            case 'request':
                if (!requestNoRetrieval) {
                    if (requestOutputType === 'envVar' && (requestFormat === 'pem' || requestFormat === 'json')) {
                        // certOut = certOut.replace(/\n/g, '');
                        // console.log(certOut)
                        tl.setVariable(certEnvVarName, child.stdout.replace(/(\r\n|\n|\r)/gm, '\\n'), true)
                        console.log('Contents of certificate, with ' + requestFormat + ' format, saved to environment variable ' + certEnvVarName)
                    } else {
                        console.log('Contents of certificate, with ' + requestFormat + ' format, saved to ' + requestOutputFile)
                    }
                }

                // write pickup id to env var
                var requestPickupId = fs.readFileSync(requestIdFilePath, 'utf8')
                // there's a crlf on the pickup id so we need to trim it
                tl.setVariable(certIdEnvVarName, requestPickupId.trim())
                console.log('Certificate ID saved to environment variable ' + certIdEnvVarName)

                break;

            case 'retrieve':

                if (retrieveOutputType === 'envVar' && (retrieveFormat === 'pem' || retrieveFormat === 'json')) {
                    tl.setVariable(certEnvVarName, child.stdout.replace(/(\r\n|\n|\r)/gm, '\\n'), true)
                    console.log('Contents of certificate, with ' + retrieveFormat + ' format, saved to environment variable ' + certEnvVarName)
                } else {
                    console.log('Contents of certificate, with ' + retrieveFormat + ' format, saved to ' + retrieveOutputFile)
                }

                break;

            case 'getToken':

                var fullToken = JSON.parse(child.stdout)
                tl.setVariable(tppTokenEnvVarName, fullToken.access_token, true)
                console.log('Token saved to environment variable ' + tppTokenEnvVarName)

                break;

            default:
                break;
        }
        if (action === 'getToken') {
            // tl.setVariable('VCertToken', '', true)
        }
    }
    catch (err) {
        console.log(err)
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

// use --no-prompt
run();