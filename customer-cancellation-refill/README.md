# Customer Cancellation Refill

An automation on a job that a customer cancels. It creates a Tempo task with the job attached, asks Tempo to fill the freed slot with pending work, then branches on what Tempo came back with: a plan waiting for approval stays in the inbox, and a run that found nothing to move resolves the task so the inbox stays clean.

Alongside [Sick Leave Cover](../sick-leave-cover/), this shows a second trigger shape (an `Update` that compares `current` with `previous`), a `Choice` step on an action's output, and the `resolve-tempo-task` action. The `update-tempo-task` action is covered [below](#updating-the-task-instead).

## How it works

| Step | What it does |
| --- | --- |
| Trigger | A **Record modified** trigger on `Jobs` for the `Update` operation. The filter `current.JobStatus == 'Cancelled' AND previous.JobStatus != 'Cancelled' AND current.AbortReason == 'Cancelled by customer'` fires once, on the change into Cancelled, and only for customer cancellations. |
| `CreateTempoTask` | `create-tempo-task` with the job as the `subject` context record and a brief that asks Tempo to find work for the freed slot. |
| `RunTempoTask` | `run-tempo-task` on the new task. Its output has a `status` of either `awaiting_approval` (Tempo proposed changes and paused) or `completed` (Tempo finished with a summary and no plan). |
| `DidTempoFinishWithoutAPlan` | A `Choice` step on `$runTempoTask.result.data.status`. |
| `ResolveTempoTask` | When the status is `completed`: `resolve-tempo-task` with a `resolutionNote` that carries Tempo's summary, so the audit trail says why the task was closed. The note is cut to 2,000 characters, the most `resolutionNote` accepts. |
| `LeaveForApproval` | Otherwise: a `Pass` step. The task stays in the inbox with Tempo's proposed plan, and the scheduler approves or rejects it there. |

The Choice tests for `completed` rather than for `awaiting_approval`, so that anything unexpected leaves the task in the inbox rather than resolving it.

## Prerequisites

* Tempo enabled for the tenant, and the automations beta switched on for your team. See [Before you start](https://docs.skedulo.com/developer-guides/tempo/create-tasks-from-automations/#before-you-start).
* The API user that runs automations needs the `skedulo.tenant.ai.agent.automation` permission.
* The Skedulo CLI authenticated against the tenant under an alias (`<alias>` below). If `sked artifacts automation` is missing, run `sked artifacts update-descriptors`.

## Deploy

```bash
sked artifacts automation upsert -f customer-cancellation-refill.automation.json -a <alias>
```

## Try it

Pick a scheduled job with a resource allocated, ideally in a region that also has unscheduled or pending work.

1. Open the job, cancel it, and choose **Cancelled by customer** as the reason.
2. Open the Tempo inbox. If Tempo found work for the slot, the task **Job cancelled: refill the slot for JOB-0001** is there with the plan ready to approve. If it found nothing, the task is already resolved and has moved to **History**, with Tempo's summary as the resolution note.

Three things to try in the task's chat when there is a plan:

1. **"What else could go in that slot?"**
   Tempo lists the other candidates it considered and why it ranked them lower.

2. **"Only move jobs that are already overdue."**
   Tempo narrows the plan and shows the revised preview. Nothing has changed yet.

3. **Click Use this plan.**
   Tempo moves the work into the slot and notifies the resources.

## Updating the task instead

The `update-tempo-task` action changes a task's title, description, priority, or attached records after it was created. A natural use here is to raise the priority and retitle the task when Tempo has a plan waiting, so that it stands out in the inbox. Replace the `LeaveForApproval` step with:

```json
"FlagForApproval": {
  "Type": "Task",
  "Resource": "action:update-tempo-task",
  "Arguments": {
    "taskId": "{% $createTempoTask.result.data.taskId %}",
    "title": "{% 'Approve the refill plan for ' & $trigger.current.Name %}",
    "priority": "high"
  },
  "End": true
}
```

and point the Choice's `Default` at it. The committed file uses the `Pass` step because **Update Tempo Task** is not yet available on every tenant; if the deploy reports `Some fields failed to validate`, your tenant does not have it yet.

## Adapting the trigger

The filter matches the default job cancellation reason, `Cancelled by customer`. If your tenant has customised the cancellation reasons, use your own value, or drop the `AbortReason` condition to raise a task for every cancellation.

## Remove

```bash
sked artifacts automation delete --name customer-cancellation-refill -a <alias>
```
