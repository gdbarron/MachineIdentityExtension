# Machine Identity Extension for Azure DevOps

## Background
Simplify key generation and enrollment of machine identities (also known as SSL/TLS certificates and keys) that comply with enterprise security policy by using the [Venafi Trust Protection Platform](https://www.venafi.com/platform/trust-protection-platform)(TPP) or [Venafi as a Service](https://www.venafi.com/venaficloud).  You can request, retrieve, and renew certificates.

This extension takes advantage of the [VCert](https://github.com/Venafi/vcert) CLI.  Basic usage can be found below and in the extension help itself; please see the VCert site for additional parameter details.

Supported on Windows, Linux, and Mac.

## Prerequisites
Ensure the following prerequisites are met prior to using this extension:
- [Venafi as a Service](https://github.com/Venafi/vcert/blob/master/README-CLI-CLOUD.md#prerequisites)
- [Trust Protection Platform](https://github.com/Venafi/vcert/blob/master/README-CLI-PLATFORM.md#prerequisites)
## Usage
There are different authentication mechanisms depending on if you use TPP or Venafi as a Service, see below.  After providing authentication, fill in the action specific fields and you are ready to go!
### Venafi as a Service
Venafi as a Service uses an API Key found in your user preferences.  Go to the API Keys section of your user preferences and 'Generate New Key' if one doesn't already exist.  You can provide this directly or as a secure variable.
![Cloud server - Main](https://raw.githubusercontent.com/gdbarron/MachineIdentityExtension/master/extension/images/CloudMain.jpg)

### Trust Protection Platform
TPP requires a token which can either be precreated and provided with the 'Inline' option or obtained via a prior Machine Identity Extension task with a 'Get Token' action.

![TPP server - Main](https://raw.githubusercontent.com/gdbarron/MachineIdentityExtension/master/extension/images/TppMain.jpg)

### YAML example - Get token and Request
![yaml example](https://raw.githubusercontent.com/gdbarron/MachineIdentityExtension/master/extension/images/yaml.jpg)
