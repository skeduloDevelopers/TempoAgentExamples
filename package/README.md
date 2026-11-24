# Package

A local package that deploys every example in this repository in one command. The state files are copies of the ones in the example folders.

```text
package/
├── skeduloPackage.json
└── src/
    ├── functions/
    │   ├── parts-stock.function.json
    │   └── parts-stock/
    ├── automations/
    │   ├── sick-leave-find-cover.automation.json
    │   └── customer-cancellation-refill.automation.json
    └── custom-agents/
        ├── dispatch-assistant.custom-agent.json
        ├── skedulo-api-assistant.custom-agent.json
        ├── parts-availability.custom-agent.json
        ├── weather-check.custom-agent.json
        └── slot-refill.custom-agent.json
```

## Deploy order

A package deploys its artifacts in dependency order, whatever folders they are in. For these artifact types the order is:

1. Functions and automations
2. Custom agents, last

So the `parts-stock` function is deployed before `parts-availability`, the agent that calls it, is published. Keeping each type in its own folder is a convention, not a requirement, but it makes the order easy to see.

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

When you change an example, copy its state file into the matching `src/` folder here. For the function, copy the `parts-stock` folder as well as `parts-stock.function.json`. The CLI reads this folder, not the example folders.
