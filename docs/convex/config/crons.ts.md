# crons.ts

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

`convex/crons.ts` allows you to define [**cron jobs**](/scheduling/cron-jobs.md), which run your Convex functions on a recurring schedule. They are useful for cleanup tasks, periodic reports, or syncing with external services.

convex/crons.ts

```
import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";



const crons = cronJobs();



// Runs every minute

crons.interval(

  "clear messages table",

  { minutes: 1 },

  internal.messages.clearAll,

);



// Runs daily at 17:00 UTC. Convex picks the minute to spread

// the load away from the top of the hour.

crons.daily("send reminder", { hourUTC: 17 }, internal.emails.send);



// Runs on the first day of every month at 16:00 UTC,

// passing an argument to the function

crons.monthly(

  "payment reminder",

  { day: 1, hourUTC: 16 },

  internal.payments.sendPaymentEmail,

  { email: "my_email@gmail.com" },

);



export default crons;
```

## Learn More[​](#learn-more "Direct link to Learn More")

* [Cron Jobs](/scheduling/cron-jobs.md)
* [Scheduled Functions](/scheduling/scheduled-functions.md)
* [`Crons` API reference](/api/classes/server.Crons.md)
