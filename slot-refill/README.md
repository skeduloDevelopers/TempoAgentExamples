# Slot Refill

A custom agent that works the tasks raised by one of Tempo's playbooks. The **Job cancelled** playbook raises a task for every cancelled job, and this agent carries the rules for which waiting job may be offered the freed slot. It shows a playbook and a custom agent used together: the playbook decides when Tempo starts work, and the agent decides how the work is done.

A playbook is not an artifact. You turn it on in Tempo's settings, and Tempo creates and maintains the automation behind it. So the only file here is the agent. See [Choose between a playbook, an automation, and a custom agent](https://docs.skedulo.com/developer-guides/tempo/#choose-between-a-playbook-an-automation-and-a-custom-agent) for when to use each.

## What the agent adds

Left to itself, Tempo offers the freed slot to any waiting job that fits. The agent's `guidance` narrows that to house rules:

* Only a job in Pending Allocation or Queued.
* Only a job with the same Type as the cancelled job.
* Only a job that is no longer than the freed slot.
* If several qualify, the one that has waited longest.

Its `negativeBoundaries` stop it cancelling jobs, moving a job that already has a resource, or contacting the customer. Change the rules in `guidance` to your own; they are the point of the example.

## Prerequisites

* Tempo enabled for the tenant, with the Tempo inbox, which playbooks need. See [Enable Tempo in a tenant](https://docs.skedulo.com/developer-guides/tempo/enable-tempo/).
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts custom-agent` is missing, run `sked artifacts update-descriptors`.
* The deploying user needs the `skedulo.tenant.ai.agent.admin` permission.

## Deploy the agent

```bash
sked artifacts custom-agent upsert -f slot-refill.custom-agent.json -a <alias>
```

## Turn on the playbook

1. In Tempo's settings, open **Playbooks** and click **New playbook**. See [Playbooks](https://docs.skedulo.com/user-guides/tempo/settings-memory-and-feedback/#playbooks).
2. Choose **Job cancelled**.
3. For what Tempo should check, enter:

   ```text
   This job was just cancelled. Delegate refilling the freed time to the slot-refill agent, and report what it proposes.
   ```

4. Save the playbook and leave it active.

The wording matters. That text becomes the task's brief, and Tempo decides from it whether to pass the work to an agent or to do it with its own tools. When we tried four wordings on a production tenant:

| What Tempo should check | Handed to the agent? |
| --- | --- |
| The playbook's default text | No |
| "Ask the Slot Refill agent to refill the freed time." | No |
| "Use the slot-refill agent to refill the freed time." | No |
| "Delegate refilling the freed time to the slot-refill agent, and report what it proposes." | Yes, four times out of four |

So name the agent by its `name`, not its display name, and tell Tempo to delegate.

## Try it

Pick a job that has a resource allocated, in a region that also has an unallocated job of the same type.

1. Cancel the job.
2. Open the Tempo inbox. A high-priority task titled **Job cancelled: JOB-0001** is there, and Tempo has already worked it.

The task recommends moving the waiting job into the freed slot and allocating the resource who was on the cancelled job. The agent chose the job by its rules. Tempo then checked the resource's availability and put the plan on the task. Nothing changes until you click **Use this plan**.

Two more things to try:

1. **In the chat, "JOB-0001 was cancelled. Refill the freed slot."**
   Tempo decides whether to pass a request to this agent or to answer with its own tools. When it passes this one on, the reply names the job that qualifies and the jobs the rules passed over, and asks before changing anything.

2. **"Cancel JOB-0001."**
   [Called directly](https://docs.skedulo.com/developer-guides/tempo/custom-agents/#call-a-published-agent-directly), the agent declines: it only works on jobs that are already cancelled. In the chat, Tempo may take the request itself and propose the cancellation for your approval.

Use a real job name from your tenant in place of `JOB-0001`.

## If you also use Customer Cancellation Refill

[Customer Cancellation Refill](../customer-cancellation-refill/) is an automation that also raises a task when a customer cancels a job, so with both switched on a customer cancellation raises two tasks. Use one of them:

* This pairing, when the playbook's task is enough and your rules belong in an agent.
* The automation, when you need its filter on the cancellation reason or its steps after Tempo's run.

## Remove

```bash
sked artifacts custom-agent delete --name slot-refill -a <alias>
```

Pause or delete the playbook in Tempo's settings.
