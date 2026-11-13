# Template

A starting point for a new custom agent. Copy this folder, rename it, and work through the checklist below. The state file deploys as it stands, so you can check your CLI and tenant setup before you change anything.

## Start a new agent

```bash
cp -r template my-new-agent
mv my-new-agent/my-agent.custom-agent.json my-new-agent/my-new-agent.custom-agent.json
```

## Checklist

Edit the state file:

- [ ] `name`: lower-case and hyphenated, matching the file name. It is the agent's ID: renaming it later deploys a new agent rather than updating this one.
- [ ] `displayName`: what schedulers see in the inbox and the chat.
- [ ] `template`: `scheduler` for an agent that works with jobs and allocations, `generalist` for one that mostly reads and reports.
- [ ] `instructions.role`: one sentence on what the agent is for. Tempo routes requests by it.
- [ ] `instructions.scope`: which records and which time window.
- [ ] `instructions.guidance`: a few lines on which tools to use, in what order, and how to shape the answer.
- [ ] `instructions.negativeBoundaries`: only what the agent must refuse. Leave it out if the tool allowlist already covers it.
- [ ] `tools`: the fewest tools that do the job. The allowlist is what the platform enforces. See the [Agent tools reference](https://developer.skedulo.com/agent-tools/) for every tool and whether it reads or writes.
- [ ] `allowedDomains`: only if `tools` includes `external_api`. Put any API key in a `ConfigVariable` artifact, as in [external-api-agent](../external-api-agent/).

Then write the README, replacing this one: the purpose, prerequisites, the deploy command, three prompts to try, and what Tempo should do with each. [dispatch-assistant](../dispatch-assistant/) is a short one to copy.

## Deploy

```bash
sked artifacts custom-agent upsert -f my-new-agent/my-new-agent.custom-agent.json -a <alias>
```

The deploying user needs the `skedulo.tenant.ai.agent.admin` permission. If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.

To add the agent to the one-command deploy, copy the state file into [package/src/custom-agents/](../package/src/custom-agents/).

## Remove

```bash
sked artifacts custom-agent delete --name my-new-agent -a <alias>
```
