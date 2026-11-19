# Skedulo API Assistant

A `generalist` agent that answers reporting questions about the schedule, such as "how many jobs are unallocated per region this week", and nothing else.

The only data tool on its allowlist is `skedulo_api`, the integrations tool that can call any Skedulo API endpoint as the user. The rest of the allowlist is date arithmetic: `get_current_time`, `get_local_day_window`, and `format_date_time`. The `scope` and `negativeBoundaries` keep the agent to reads: it uses GET requests, and it says so when a question would need the schedule to change.

`skedulo_api` is a write-capable tool, so why is this read-only? Two reasons. GET requests through `skedulo_api` run without asking for approval; in the inbox and the chat, a POST, PUT, PATCH, or DELETE pauses for the user to approve it, so the agent cannot change anything quietly. And the instructions tell the agent to reply, not to act, so it does not try. Together they give you a reporting agent that is safe to publish to every scheduler.

A [direct call](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly) is different: nothing pauses, so only the instructions keep the agent to reads. That is why a direct call needs the `skedulo.tenant.ai.agent.automation` permission, which using the agent in the inbox or the chat does not.

## Prerequisites

* Tempo enabled for the tenant. See [Enable Tempo in a tenant](https://docs.skedulo.com/developer-guides/tempo/enable-tempo/).
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.
* The deploying user needs the `skedulo.tenant.ai.agent.admin` permission.

## Deploy

```bash
sked artifacts custom-agent upsert -f skedulo-api-assistant.custom-agent.json -a <alias>
```

## Prompts to try

1. **"How many jobs are unallocated per region this week?"**
   The agent works out the week's boundaries, reads the jobs in that window, and replies with a count per region and a total. It states the time window and the filters it applied, and ends with "I changed nothing".

2. **"Which regions does this tenant have, and what timezone is each in?"**
   A two-column table of regions and timezones.

3. **"Allocate the unallocated jobs in Paris to whoever is free."**
   The agent explains that it only reports and does not change the schedule, and offers the counts instead.

## What to look at

* `template` is `generalist`. The scheduler persona carries scheduling opinions this agent does not need; the generalist persona is a better fit for questions that are really about data.
* The Tempo supervisor may hand part of the work to a sub-agent. The sub-agent works within the same allowlist, so the agent stays read-only.
* `skedulo_api` takes an `extract` argument, a jq expression applied to a GET response before it is returned. The `guidance` tells the agent to use it, so that a large response is reduced to the fields the answer needs.

## Remove

```bash
sked artifacts custom-agent delete --name skedulo-api-assistant -a <alias>
```
