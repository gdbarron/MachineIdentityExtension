## v1.3
- Fix task input grouping error, [[#8](https://github.com/gdbarron/MachineIdentityExtension/issues/8)
- Update vcert to 4.24
- Fix incorrect command line for some cloud actions
- Updated Venafi logo

## v1.2
- Add workaround for ADO bug where fields were marked as required when they shouldn't be with yaml pipelines

## v1.1
- Add revoke token action
- Better error handling to ensure we always fail when vcert reports an issue

## v1.0
- Update vcert to 4.15.1
- Add scope and application id options to get token action, [#2](https://github.com/gdbarron/MachineIdentityExtension/issues/2)
- Add 'Additional Parameters' in advanced section to provide any additional command line options
- Update 'Test Mode' to ensure it's only available in request, retrieve, and renew actions

## v0.2
- No longer in preview