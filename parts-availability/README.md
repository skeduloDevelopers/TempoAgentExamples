# Parts Availability

An agent that checks a parts supplier's stock before a job is confirmed, by calling a Skedulo function. It shows how an agent calls a function: the `skedulo_api` tool, the function's path, and the instructions that keep the tool to that one call.

The function stands in for a supplier's stock system and is deliberately trivial. It returns the same example parts every time, whatever job it is asked about. Replace its one route with a real lookup when you build your own.

Two artifacts:

| File | What it is |
| --- | --- |
| `parts-stock.function.json` and `parts-stock/` | The function. It has one route, `GET /stock`, in `parts-stock/src/routes.ts`. |
| `parts-availability.custom-agent.json` | The agent. `skedulo_api` is the only tool on its allowlist, and its `guidance` names the function's path. |

## Prerequisites

* Tempo enabled for the tenant. See [Enable Tempo in a tenant](https://docs.skedulo.com/developer-guides/tempo/enable-tempo/).
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.
* The deploying user needs the `skedulo.tenant.ai.agent.admin` permission.

## Deploy

The function first, then the agent:

```bash
sked artifacts function upsert -f parts-stock.function.json -a <alias>
sked artifacts custom-agent upsert -f parts-availability.custom-agent.json -a <alias>
```

The CLI uploads the `parts-stock` folder and the platform builds it, so there is nothing to install or compile first. Inside a [package](../package/), the function deploys before the custom agents.

## How the agent calls the function

`skedulo_api` calls any Skedulo API path as the signed-in user, and a tenant's functions are among those paths. The path is relative to the API host and has the form `function/<function name>/<function name>/<route>`, so this one is `function/parts-stock/parts-stock/stock`. To see the base URL of every function on a tenant, run `sked artifacts function list -a <alias>`.

The agent's `guidance` gives it the method, the path, and what the response holds:

```json
{
  "supplier": "Example Parts Co",
  "parts": [
    { "partNumber": "HWS-250", "name": "250 L hot water cylinder", "quantityNeeded": 1, "quantityInStock": 4 },
    { "partNumber": "PRV-15", "name": "15 mm pressure relief valve", "quantityNeeded": 1, "quantityInStock": 12 },
    { "partNumber": "THM-EL2", "name": "Element thermostat", "quantityNeeded": 1, "quantityInStock": 0, "backOrderDays": 5 }
  ]
}
```

Things to notice:

* The agent sends the job's name as a `job` query parameter. This function ignores it; a real one would use it to look up the job's parts.
* A GET through `skedulo_api` runs without asking for approval, so the stock check does not pause. A POST, PUT, PATCH, or DELETE pauses for approval in the inbox and the chat.
* The allowlist cannot limit `skedulo_api` to one path, because the tool reaches the whole API. The `negativeBoundaries` do that, and they are instructions, not enforcement. A [direct call](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly) does not pause for anything, so there only the instructions keep the agent to the function.

## Prompts to try

Ask these in the Tempo chat. Tempo decides whether to pass a request to this agent or to answer with its own tools, so either may reply.

1. **"Is everything JOB-0001 needs in stock with the supplier?"**
   The agent calls the function and replies with a table of the three parts: two in stock, and the element thermostat out of stock on a five-day back order. Nothing pauses for approval.

2. **"Which parts for JOB-0001 are on back order with the supplier, and for how long?"**
   The element thermostat, for five days. Tempo may offer to reschedule the job around it.

3. **"Move JOB-0001 to next Monday."**
   [Called directly](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly), the agent declines: it only checks parts stock. In the chat, Tempo may take the request itself and propose the move for your approval.

The function returns the same parts for every job, so the answer does not depend on the job you name.

## Calling an API outside Skedulo

For a supplier's own API the tool is `external_api`, with an `allowedDomains` list that names the hosts the agent may call. [Weather Check](../weather-check/) shows it. Unlike a GET to a function, every `external_api` call waits for approval in the inbox and the chat, because it sends data outside Skedulo.

## Remove

```bash
sked artifacts custom-agent delete --name parts-availability -a <alias>
sked artifacts function delete --name parts-stock -a <alias>
```
