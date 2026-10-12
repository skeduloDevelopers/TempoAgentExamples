# Package

A local package that deploys every example in this repository in one command. The state files are copies of the ones in the example folders.

```text
package/
├── skeduloPackage.json
└── src/
    ├── config-variables/
    │   └── PARTS_SUPPLIER_API_KEY.config-variable.json
    ├── automations/
    │   ├── sick-leave-find-cover.automation.json
    │   └── customer-cancellation-refill.automation.json
    └── custom-agents/
        ├── dispatch-assistant.custom-agent.json
        ├── skedulo-api-assistant.custom-agent.json
        └── parts-availability.custom-agent.json
```

## Deploy order

A package deploys its artifacts in dependency order, whatever folders they are in. For these artifact types the order is:

1. Configuration variables
2. Automations
3. Custom agents, last

So `PARTS_SUPPLIER_API_KEY` exists before `parts-availability` is published, which matters once the agent's `allowedDomains` entry names it in `secrets`. Keeping each type in its own folder is a convention, not a requirement, but it makes the order easy to see.

## Deploy

From the root of this repository:

```bash
sked package deploy local -p package -a <alias>
```

Add `--dryRun` to validate the package against the tenant without changing anything:

```bash
sked package deploy local -p package -a <alias> --dryRun
```

Redeploy the same way after changing a file. See [Work with packages](https://docs.skedulo.com/developer-guides/cli/working-with-packages/) for registering a package so that it can be deployed to production tenants.

## Keeping the copies in sync

When you change an example, copy its state file into the matching `src/` folder here. The CLI reads this folder, not the example folders.
