"use strict";
// AZURE-PIPELINES-TASK-LIB TYPESCRIPT API
// https://github.com/microsoft/azure-pipelines-task-lib/blob/master/node/docs/azure-pipelines-task-lib.md
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log('Token: ' + (tl.getVariable('getcredToken')))
            // console.log(tl.getVariables())
            // tl.setVariable('getcredToken', 'TokenTest')
            var pickupIdEnvVarName = 'VCERT_PICKUPID';
            var certEnvVarName = 'VCERT_CERT';
            let vcertArgs = [];
            let vcertPath = path.join(__dirname, 'bin/vcert_');
            // pickup file will be placed here
            // const tempPath = process.env['AGENT_TEMPDIRECTORY']
            // const tempPath = tl.getVariable('AGENT_TEMPDIRECTORY')
            const enrollIdFilePath = path.join(__dirname, 'pickupid');
            var isWin = process.platform === "win32";
            var isLinux = process.platform === "linux";
            var isMac = process.platform === "darwin";
            let action = tl.getInput('action', true);
            let serverType = tl.getInput('serverType', true);
            let runParams = tl.getInput('runParams', false);
            let serverUrlTpp = tl.getInput('serverUrlTpp', (serverType === 'tpp'));
            let authTypeTpp = tl.getInput('authTypeTpp', (serverType === 'tpp'));
            let authTokenTpp = tl.getInput('authTokenTpp', (serverType === 'tpp' && authTypeTpp === 'token'));
            let authUsernameTpp = tl.getInput('authUsernameTpp', (serverType === 'tpp' && authTypeTpp === 'username'));
            let authPasswordTpp = tl.getInput('authPasswordTpp', (serverType === 'tpp' && authTypeTpp === 'username'));
            let apiKeyCloud = tl.getInput('apiKeyCloud', (serverType === 'cloud'));
            // enroll
            let enrollZoneCloud = tl.getInput('enrollZoneCloud', (serverType === 'cloud'));
            let enrollCommonName = tl.getInput('enrollCommonName', (action === 'enrollAction'));
            let enrollNicknameTpp = tl.getInput('enrollNicknameTpp', false);
            let enrollZoneTpp = tl.getInput('enrollZoneTpp', (serverType === 'tpp'));
            let enrollKeyPassword = tl.getInput('enrollKeyPassword', false);
            let enrollFormat = tl.getInput('enrollFormat', true);
            let enrollChain = tl.getInput('enrollChain', true);
            let enrollSanDns = tl.getDelimitedInput('enrollSanDns', ',', false);
            let enrollSanEmailTpp = tl.getDelimitedInput('enrollSanEmailTpp', ',', false);
            let enrollSanIpTpp = tl.getDelimitedInput('enrollSanIpTpp', ',', false);
            let enrollCustomFieldsTpp = tl.getInput('enrollCustomFieldsTpp', false);
            let enrollCsrTpp = tl.getInput('enrollCsrTpp', false);
            let enrollCsrCloud = tl.getInput('enrollCsrCloud', false);
            let enrollCsrFile = tl.getInput('enrollCsrFile', false);
            let enrollNoPickup = tl.getBoolInput('enrollNoPickup', false);
            // pickup
            let pickupFormat = tl.getInput('pickupFormat', true);
            let pickupIdFrom = tl.getInput('pickupIdFrom', action === 'pickupAction');
            let pickupId = tl.getInput('pickupId', pickupIdFrom === 'pickupIdFromId');
            let pickupFile = tl.getPathInput('pickupFile', pickupIdFrom === 'pickupIdFromFile');
            // output
            let outputType = tl.getInput('outputType', action === 'enrollAction');
            let outputFile = tl.getPathInput('outputFile', outputType === 'outputFile' || enrollFormat === 'pkcs12' || enrollFormat === 'jks' || pickupFormat === 'pkcs12' || pickupFormat === 'jks');
            // advanced
            let verbose = tl.getBoolInput('verbose', false);
            vcertPath += process.platform;
            switch (process.platform) {
                case 'win32':
                    break;
                case 'linux':
                case 'darwin':
                    // need to make vcert executable
                    fs.chmodSync(vcertPath, 0o111);
                    break;
                default:
                    throw 'Unsupported platform.  Only windows, linux, and mac.';
                    break;
            }
            switch (action) {
                case "enrollAction":
                    vcertArgs.push('enroll');
                    vcertArgs.push('-z');
                    if (serverType === 'cloud') {
                        vcertArgs.push(enrollZoneCloud);
                    }
                    else {
                        vcertArgs.push(enrollZoneTpp);
                    }
                    vcertArgs.push('--cn');
                    vcertArgs.push(enrollCommonName);
                    vcertArgs.push('--format');
                    vcertArgs.push(enrollFormat);
                    vcertArgs.push('--chain');
                    vcertArgs.push(enrollChain);
                    vcertArgs.push('--csr');
                    if (serverType === 'cloud') {
                        if (enrollCsrCloud === 'file') {
                            vcertArgs.push('file:' + enrollCsrFile);
                        }
                        else {
                            vcertArgs.push(enrollCsrCloud);
                        }
                    }
                    else {
                        if (enrollCsrCloud === 'file') {
                            vcertArgs.push('file:' + enrollCsrFile);
                        }
                        else {
                            vcertArgs.push(enrollCsrTpp);
                        }
                    }
                    if (enrollSanDns) {
                        // var sanDns = enrollSanDns.split(",")
                        enrollSanDns.forEach(element => {
                            vcertArgs.push('--san-dns');
                            vcertArgs.push(element);
                        });
                    }
                    if (enrollKeyPassword) {
                        vcertArgs.push('--key-password');
                        vcertArgs.push(enrollKeyPassword);
                    }
                    else {
                        vcertArgs.push('--no-prompt');
                    }
                    if (outputType === 'file' || enrollFormat === 'pkcs12' || enrollFormat === 'jks') {
                        vcertArgs.push('--file');
                        vcertArgs.push(outputFile);
                    }
                    if (enrollNoPickup) {
                        vcertArgs.push('--no-pickup');
                    }
                    // tpp specific params, not supported on cloud
                    if (serverType === 'tpp') {
                        if (enrollNicknameTpp) {
                            vcertArgs.push('--nickname');
                            vcertArgs.push(enrollNicknameTpp);
                        }
                        if (enrollSanEmailTpp) {
                            // var sanEmail = enrollSanEmailTpp.split(",")
                            enrollSanEmailTpp.forEach(element => {
                                vcertArgs.push('--san-email');
                                vcertArgs.push(element);
                            });
                        }
                        if (enrollSanIpTpp) {
                            // var sanIp = enrollSanIpTpp.split(",")
                            enrollSanIpTpp.forEach(element => {
                                vcertArgs.push('--san-ip');
                                vcertArgs.push(element);
                            });
                        }
                        if (enrollCustomFieldsTpp) {
                            const customFields = JSON.parse(enrollCustomFieldsTpp);
                            for (var key in customFields) {
                                vcertArgs.push('--field');
                                vcertArgs.push(key + '=' + customFields[key]);
                            }
                        }
                    }
                    // always redirect pickup id to a file
                    // without this it will go to stdout and cause issues
                    // as both the cert and this go to stdout
                    vcertArgs.push('--pickup-id-file');
                    vcertArgs.push(enrollIdFilePath);
                    break;
                case "pickupAction":
                    vcertArgs.push('pickup');
                    switch (pickupIdFrom) {
                        case 'pickIdFromEnvVar':
                            var thisId = tl.getVariable(pickupIdEnvVarName);
                            if (thisId) {
                                vcertArgs.push('--pickup-id');
                                vcertArgs.push(thisId);
                            }
                            else {
                                throw 'No pickup ID was found at environment variable ' + pickupIdEnvVarName;
                            }
                            break;
                        case 'pickIdFromID':
                            vcertArgs.push('--pickup-id');
                            vcertArgs.push(pickupId);
                            break;
                        case 'pickIdFromEnvVar':
                            vcertArgs.push('--pickup-id-file');
                            vcertArgs.push(pickupFile);
                            break;
                        default:
                            throw 'Unknown pickup type ' + pickupIdFrom;
                            break;
                    }
                    break;
                case "renewAction":
                    vcertArgs.push('renew');
                    break;
                case "getcredAction":
                    vcertArgs.push('getcred');
                    break;
            }
            // needed for all cloud/tpp actions
            if (serverType === 'cloud' && action !== 'getcredAction') {
                vcertArgs.push('-k');
                vcertArgs.push(apiKeyCloud);
            }
            else {
                // tpp specific
                vcertArgs.push('-u');
                vcertArgs.push('https://' + serverUrlTpp);
                if (authTypeTpp === 'token' && action !== 'getcredAction') {
                    vcertArgs.push('-t');
                    vcertArgs.push(authTokenTpp);
                }
                else {
                    vcertArgs.push('--username');
                    vcertArgs.push(authUsernameTpp);
                    vcertArgs.push('--password');
                    vcertArgs.push(authPasswordTpp);
                }
            }
            if (verbose) {
                vcertArgs.push('--verbose');
                console.log('vcert path: ' + vcertPath);
                console.log('vcert args: ' + vcertArgs);
            }
            // const { execFile } = require('child_process');
            var child_process = require('child_process');
            // run with version switch first
            var childVersion = child_process.spawnSync(vcertPath, ['--version'], { encoding: 'utf8' });
            console.log(childVersion.stdout);
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
            console.log(child.stderr);
            switch (action) {
                case 'enrollAction':
                    if (!enrollNoPickup) {
                        if (outputType === 'outputEnvVar' && (enrollFormat === 'pem' || enrollFormat === 'json')) {
                            // certOut = certOut.replace(/\n/g, '');
                            // console.log(certOut)
                            tl.setVariable(certEnvVarName, child.stdout);
                            console.log('Contents of certificate, with ' + enrollFormat + ' format, saved to environment variable ' + certEnvVarName);
                        }
                        else {
                            console.log('Contents of certificate, with ' + enrollFormat + ' format, saved to ' + outputFile);
                        }
                    }
                    // write pickup id to env var
                    var enrollPickupId = fs.readFileSync(enrollIdFilePath, 'utf8');
                    tl.setVariable(pickupIdEnvVarName, enrollPickupId);
                    console.log('Pickup ID saved to environment variable ' + pickupIdEnvVarName);
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
    });
}
// use --no-prompt
run();
