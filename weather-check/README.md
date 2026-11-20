# Weather Check

An agent that checks the weather forecast for a job and, when rain is likely, proposes moving the job to a drier day. It shows the `external_api` tool and the `allowedDomains` list that restricts which hosts the agent may call.

The forecast comes from [Open-Meteo](https://open-meteo.com/), a weather API that needs no API key, so the example works as soon as it is deployed. Open-Meteo's free API is for non-commercial use; see its [terms](https://open-meteo.com/en/terms) before using it for anything else.

## Prerequisites

* Tempo enabled for the tenant. See [Enable Tempo in a tenant](https://docs.skedulo.com/developer-guides/tempo/enable-tempo/).
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.
* The deploying user needs the `skedulo.tenant.ai.agent.admin` permission.
* A job that starts within the next seven days and has an address, so that it has a latitude and longitude.

## Deploy

```bash
sked artifacts custom-agent upsert -f weather-check.custom-agent.json -a <alias>
```

## How the agent calls the API

`external_api` sends an HTTPS request to a host outside Skedulo. Three things in the profile control it:

* `tools` includes `external_api`.
* `allowedDomains` names the one host the agent may call, `api.open-meteo.com`. A request to any other host is refused, whatever the instructions say.
* The `guidance` gives the method, the URL, and the query parameters, so the agent does not have to guess how the API works.

The agent reads the job with `get_job_by_name`, sends the job's latitude and longitude to the forecast endpoint, and reads the chance of rain for each of the next seven days from the response. The `negativeBoundaries` keep everything else about the job inside Skedulo.

Things to notice:

* Every `external_api` call waits for your approval in the inbox and the chat, including a read, because it sends data outside Skedulo. The approval card shows the URL and the names of the query parameters.
* Moving the job is a second approval. The agent proposes `move_job_time` and pauses; nothing changes until you approve it.
* A [direct call](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly) pauses for neither, so there the forecast request is sent and the job is moved straight away.
* 50% is the threshold in the `guidance`. Change the number there to make the agent more or less cautious.

## Prompts to try

Ask these in the Tempo chat. Tempo decides whether to pass a request to this agent or to answer with its own tools, so either may reply.

1. **"Will rain affect JOB-0001?"**
   The agent reads the job and asks to call `api.open-meteo.com`. Approve the request. It replies with the chance of rain on the job's day and on the days after it. If the job's day is at 50% or more, it names the first later day below 50% and offers to move the job there.

2. **"Yes, move it."**
   Tempo may first ask which of the drier days you want. It then proposes the move to the same time on that day and pauses. Approve it and the job moves; reject it and nothing changes.

3. **"Cancel JOB-0001 because of the rain."**
   [Called directly](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly), the agent declines: it moves jobs, it does not cancel them, and `cancel_job` is not on its allowlist. In the chat, Tempo may take the request itself and propose the cancellation for your approval.

Use a real job name from your tenant in place of `JOB-0001`.

## Sending a secret

An API that needs a key takes one more step: an `allowedDomains` entry can list the configuration variable keys the agent may send to that host as `{{secret:KEY}}` in a header or query parameter. The agent never sees the value.

```json
"allowedDomains": [
  {
    "domain": "api.example.com",
    "secrets": ["WEATHER_API_KEY"]
  }
]
```

Deploy the key as a `ConfigVariable` artifact of type `secret` before the agent; [SkeduloCLIExamples](https://github.com/skeduloDevelopers/SkeduloCLIExamples/tree/main/config-variables) has one. A host that carries a secret must first be approved by Skedulo, or publishing fails with `allowed_domain_not_curated`. Contact your Skedulo Customer Success Manager with the host name.

## Remove

```bash
sked artifacts custom-agent delete --name weather-check -a <alias>
```
