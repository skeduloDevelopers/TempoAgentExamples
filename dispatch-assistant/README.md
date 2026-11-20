# Dispatch Assistant

The simplest custom agent, and the one the [Custom agents](https://docs.skedulo.com/developer-guides/tempo/custom-agents/) guide uses. Start here if you have not deployed a custom agent before.

It starts from the `scheduler` persona and narrows it to one job: keeping today's and tomorrow's schedule healthy. The tool allowlist is read-mostly (`search_jobs`, `suggest_resources`, `get_current_time`) plus one write, `allocate_job`. A `negativeBoundaries` instruction stops it cancelling jobs, and because `cancel_job` is not on the allowlist, it could not cancel one even if asked.

## Prerequisites

* Tempo enabled for the tenant. See [Enable Tempo in a tenant](https://docs.skedulo.com/developer-guides/tempo/enable-tempo/).
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.
* The deploying user needs the `skedulo.tenant.ai.agent.admin` permission.

## Deploy

```bash
sked artifacts custom-agent upsert -f dispatch-assistant.custom-agent.json -a <alias>
```

The CLI validates the profile and publishes it in one step. It is live for the whole tenant straight away: Tempo routes matching requests to it in the inbox and the chat, and it can be [called directly](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly) by name. A direct call also needs the `skedulo.tenant.ai.agent.automation` permission.

## Prompts to try

Ask these in the Tempo chat. Tempo decides whether to pass a request to this agent or to answer with its own tools, so either may reply.

1. **"Which jobs this week have no one allocated?"**
   Tempo searches the jobs in the window and lists the ones with no active allocation, grouped by region, with their local times. Nothing changes.

2. **"Who could take JOB-0001 on Wednesday? Suggest someone, but do not allocate yet."**
   Tempo reads the job and asks the scheduling engine for candidates. It lists them with travel time and capacity and offers to allocate one. Still nothing changes.

3. **"Cancel JOB-0001."**
   [Called directly](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly), the agent declines: cancelling is outside what it is set up to do. It offers what it can do instead, such as allocating or checking the job's status. In the chat, Tempo may take the request itself and propose the cancellation for your approval.

Use a real job name from your tenant in place of `JOB-0001`. If you accept the allocation in prompt 2, Tempo proposes it and pauses; nothing is written to Skedulo until you approve it in the chat.

## What to look at

* `instructions.role` is one sentence. Tempo uses it to decide when a request belongs to this agent, so keep it a description of what the agent is for.
* `instructions.negativeBoundaries` and the `tools` allowlist say the same thing two ways. The boundary shapes how the agent answers; the allowlist is what the platform enforces.
* The profile has no `guardrails` key. Whether a write pauses for approval is managed by the platform, and by an administrator in [Tempo's settings](https://docs.skedulo.com/user-guides/tempo/settings-memory-and-feedback/#how-much-tempo-does). It is not something a profile can change. A direct call is the exception: nothing pauses, so `allocate_job` writes as soon as the agent calls it.

## Remove

```bash
sked artifacts custom-agent delete --name dispatch-assistant -a <alias>
```

This archives the agent: Tempo stops routing to it immediately and its version history is kept.
