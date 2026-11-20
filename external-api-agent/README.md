# External API Agent

An agent that checks a parts supplier's stock before a job is confirmed. It shows the `external_api` tool, the `allowedDomains` list that restricts which hosts the agent may call, and the `ConfigVariable` artifact that holds the supplier's API key.

Two artifacts:

| File | What it is |
| --- | --- |
| `PARTS_SUPPLIER_API_KEY.config-variable.json` | A `secret` configuration variable, deployed unset. Set its value in the web app after deploying. |
| `parts-availability.custom-agent.json` | The agent. `external_api` is on its allowlist and `allowedDomains` names the one host it may call, `parts.example.com`. |

`parts.example.com` is a placeholder. Replace it with your supplier's host before deploying for real.

## Prerequisites

* Tempo enabled for the tenant. See [Enable Tempo in a tenant](https://docs.skedulo.com/developer-guides/tempo/enable-tempo/).
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.
* The deploying user needs the `skedulo.tenant.ai.agent.admin` permission.

## Deploy

The configuration variable first, then the agent:

```bash
sked artifacts config-variable upsert -f PARTS_SUPPLIER_API_KEY.config-variable.json -a <alias>
sked artifacts custom-agent upsert -f parts-availability.custom-agent.json -a <alias>
```

Inside a [package](../package/), the CLI applies the same order for you: configuration variables deploy before custom agents, so the secret exists by the time the agent is published.

## Pairing the secret with the host

An `allowedDomains` entry can list the configuration variable keys the agent may send to that host as `{{secret:KEY}}` in a header or query parameter. The agent never sees the value.

```json
"allowedDomains": [
  {
    "domain": "parts.example.com",
    "secrets": ["PARTS_SUPPLIER_API_KEY"]
  }
]
```

A host that carries a secret must first be approved by Skedulo, or publishing fails with `allowed_domain_not_curated`. The committed agent omits `secrets` so that it deploys as-is. Contact your Skedulo Customer Success Manager with your supplier's host name, then add the `secrets` entry and redeploy.

## Prompts to try

The replies below are the agent's own, which you get when you [call it directly](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly). In the Tempo chat, Tempo decides whether to pass a request to this agent or to answer with its own tools, so either may reply.

1. **"Is everything JOB-0001 needs in stock with the supplier?"**
   The agent reads the job. With the placeholder host it has nothing to look up, so it reports what it found on the job and says it sent nothing to any host. With a real supplier host it proposes the `external_api` call and pauses: in the inbox and the chat, every external call, including a read, waits for your approval because it sends data outside Skedulo. A [direct call](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly) does not pause.

2. **"Move JOB-0001 to next Monday."**
   The agent declines. Moving jobs is outside its boundaries, and `move_job_time` is not on its allowlist. In the chat, Tempo may take the request itself and propose the move for your approval.

3. **"Which jobs in the next seven days should I check parts for?"**
   The agent asks which region you mean, then lists the jobs in that window.

Use a real job name from your tenant in place of `JOB-0001`.

## Remove

```bash
sked artifacts custom-agent delete --name parts-availability -a <alias>
```

The configuration variable is left in place; delete it from the web app if you no longer need it.
