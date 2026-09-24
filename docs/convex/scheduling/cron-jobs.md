# Cron Jobs

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

Convex allows you to schedule functions to run on a recurring basis. For example, cron jobs can be used to clean up data at a regular interval, send a reminder email at the same time every month, or schedule a backup every Saturday.

**Example:** [Cron Jobs](https://github.com/get-convex/convex-demos/tree/main/cron-jobs)

## Defining your cron jobs[​](#defining-your-cron-jobs "Direct link to Defining your cron jobs")

Cron jobs are defined in a `crons.ts` file in your `convex/` directory and look like:

convex/crons.ts

```
import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";



const crons = cronJobs();



crons.interval(

  "clear messages table",

  { minutes: 1 }, // every minute

  internal.messages.clearAll,

);



crons.monthly(

  "payment reminder",

  { day: 1, hourUTC: 16 }, // Convex chooses the minute within the 16:00 UTC hour

  internal.payments.sendPaymentEmail,

  { email: "my_email@gmail.com" }, // argument to sendPaymentEmail

);



export default crons;
```

The first argument is a unique identifier for the cron job.

The second argument is the schedule at which the function should run, see [Supported schedules](/scheduling/cron-jobs.md#supported-schedules) below.

The third argument is the name of the public function or [internal function](/functions/internal-functions.md), either a [mutation](/functions/mutation-functions.md) or an [action](/functions/actions.md).

## Supported schedules[​](#supported-schedules "Direct link to Supported schedules")

* [`crons.interval()`](/api/classes/server.Crons.md#interval) runs a function every specified number of `seconds`, `minutes`, or `hours`. The first run occurs when the cron job is first deployed to Convex. Unlike traditional crons, this option allows you to have seconds-level granularity.
* [`crons.cron()`](/api/classes/server.Crons.md#cron) the traditional way of specifying cron jobs by a string with five fields separated by spaces (e.g. `"* * * * *"`). Times in cron syntax are in the UTC timezone. [Crontab Guru](https://crontab.guru/) is a helpful resource for understanding and creating schedules in this format.
* [`crons.hourly()`](/api/classes/server.Crons.md#cron), [`crons.daily()`](/api/classes/server.Crons.md#daily), [`crons.weekly()`](/api/classes/server.Crons.md#weekly), [`crons.monthly()`](/api/classes/server.Crons.md#monthly) provide an alternative syntax for common cron schedules with explicitly named arguments. The `minuteUTC` argument is optional. Leave it out and Convex picks a minute for you, spreading runs across the hour.

Avoid scheduling on the exact top of the hour

The top of the hour (minute `0`) is the busiest time on the clock. Apps receive the most inbound traffic, webhooks, and scheduled work right at `:00`. Scheduling recurring work away from the top of the hour keeps it away from your busiest moments and makes it less likely to compete for your app's resources.

The easiest way is to leave `minuteUTC` out and let Convex pick a minute for you, spreading runs across the hour. You can also set a specific off-peak minute if you need a predictable time.

```
// ❌ Runs at the busiest moment of the hour:

crons.daily(

  "send reminder",

  { hourUTC: 17, minuteUTC: 0 },

  internal.emails.send,

);



// ✅ Let Convex pick and spread the minute:

crons.daily("send reminder", { hourUTC: 17 }, internal.emails.send);



// ✅ Or choose a specific off-peak minute:

crons.daily(

  "send reminder",

  { hourUTC: 17, minuteUTC: 23 },

  internal.emails.send,

);
```

The [`@convex-dev/no-top-of-hour-crons`](/eslint.md#no-top-of-hour-crons) ESLint rule flags schedules pinned to the top of the hour.

## Viewing your cron jobs[​](#viewing-your-cron-jobs "Direct link to Viewing your cron jobs")

You can view all your cron jobs in the [Convex dashboard cron jobs view](/dashboard/deployments/schedules.md#cron-jobs-ui). You can view added, updated, and deleted cron jobs in the logs and history view. Results of previously executed runs of the cron jobs are also available in the logs view.

## Error handling[​](#error-handling "Direct link to Error handling")

Mutations and actions have the same guarantees that are described in [Error handling](/scheduling/scheduled-functions.md#error-handling) for scheduled functions.

At most one run of each cron job can be executing at any moment. If the function scheduled by the cron job takes too long to run, following runs of the cron job may be skipped to avoid execution from falling behind. Skipping a scheduled run of a cron job due to the previous run still executing logs a message visible in the logs view of the dashboard.
