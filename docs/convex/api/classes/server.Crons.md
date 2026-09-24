# Class: Crons

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

[server](/api/modules/server.md).Crons

A class for scheduling cron jobs.

To learn more see the documentation at <https://docs.convex.dev/scheduling/cron-jobs>

## Constructors[​](#constructors "Direct link to Constructors")

### constructor[​](#constructor "Direct link to constructor")

• **new Crons**()

#### Defined in[​](#defined-in "Direct link to Defined in")

[server/cron.ts:284](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L284)

## Properties[​](#properties "Direct link to Properties")

### crons[​](#crons "Direct link to crons")

• **crons**: `Record`<`string`, [`CronJob`](/api/interfaces/server.CronJob.md)>

#### Defined in[​](#defined-in-1 "Direct link to Defined in")

[server/cron.ts:282](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L282)

***

### isCrons[​](#iscrons "Direct link to isCrons")

• **isCrons**: `true`

#### Defined in[​](#defined-in-2 "Direct link to Defined in")

[server/cron.ts:283](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L283)

## Methods[​](#methods "Direct link to Methods")

### interval[​](#interval "Direct link to interval")

▸ **interval**<`FuncRef`>(`cronIdentifier`, `schedule`, `functionReference`, `...args`): `void`

Schedule a mutation or action to run at some interval.

```
crons.interval("Clear presence data", {seconds: 30}, api.presence.clear);
```

#### Type parameters[​](#type-parameters "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cronIdentifier`    | `string`                                                                 | -                                                                                                                                                                             |
| `schedule`          | `Interval`                                                               | The time between runs for this scheduled job.                                                                                                                                 |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | The arguments to the function.                                                                                                                                                |

#### Returns[​](#returns "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-3 "Direct link to Defined in")

[server/cron.ts:321](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L321)

***

### hourly[​](#hourly "Direct link to hourly")

▸ **hourly**<`FuncRef`>(`cronIdentifier`, `functionReference`, `...args`): `void`

Schedule a mutation or action to run on an hourly basis.

```
crons.hourly(

  "Reset high scores",

  {

    minuteUTC: 30,

  },

  api.scores.reset

)
```

#### Type parameters[​](#type-parameters-1 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-1 "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cronIdentifier`    | `string`                                                                 | A unique name for this scheduled job.                                                                                                                                         |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | The arguments to the function.                                                                                                                                                |

#### Returns[​](#returns-1 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-4 "Direct link to Defined in")

[server/cron.ts:370](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L370)

▸ **hourly**<`FuncRef`>(`cronIdentifier`, `schedule`, `functionReference`, `...args`): `void`

#### Type parameters[​](#type-parameters-2 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-2 "Direct link to Parameters")

| Name                | Type                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `cronIdentifier`    | `string`                                                                 |
| `schedule`          | `Hourly`                                                                 |
| `functionReference` | `FuncRef`                                                                |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> |

#### Returns[​](#returns-2 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-5 "Direct link to Defined in")

[server/cron.ts:375](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L375)

***

### daily[​](#daily "Direct link to daily")

▸ **daily**<`FuncRef`>(`cronIdentifier`, `schedule`, `functionReference`, `...args`): `void`

Schedule a mutation or action to run on a daily basis.

```
crons.daily(

  "Reset high scores",

  {

    hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)

    minuteUTC: 30,

  },

  api.scores.reset

)
```

#### Type parameters[​](#type-parameters-3 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-3 "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cronIdentifier`    | `string`                                                                 | A unique name for this scheduled job.                                                                                                                                         |
| `schedule`          | `Daily`                                                                  | What time (UTC) each day to run this function.                                                                                                                                |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | The arguments to the function.                                                                                                                                                |

#### Returns[​](#returns-3 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-6 "Direct link to Defined in")

[server/cron.ts:431](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L431)

***

### weekly[​](#weekly "Direct link to weekly")

▸ **weekly**<`FuncRef`>(`cronIdentifier`, `schedule`, `functionReference`, `...args`): `void`

Schedule a mutation or action to run on a weekly basis.

```
crons.weekly(

  "Weekly re-engagement email",

  {

    dayOfWeek: "Tuesday",

    hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)

    minuteUTC: 30,

  },

  api.emails.send

)
```

#### Type parameters[​](#type-parameters-4 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-4 "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cronIdentifier`    | `string`                                                                 | A unique name for this scheduled job.                                                                                                                                         |
| `schedule`          | `Weekly`                                                                 | What day and time (UTC) each week to run this function.                                                                                                                       |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | -                                                                                                                                                                             |

#### Returns[​](#returns-4 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-7 "Direct link to Defined in")

[server/cron.ts:469](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L469)

***

### monthly[​](#monthly "Direct link to monthly")

▸ **monthly**<`FuncRef`>(`cronIdentifier`, `schedule`, `functionReference`, `...args`): `void`

Schedule a mutation or action to run on a monthly basis.

Note that some months have fewer days than others, so e.g. a function scheduled to run on the 30th will not run in February.

```
crons.monthly(

  "Bill customers at ",

  {

    hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)

    minuteUTC: 30,

    day: 1,

  },

  api.billing.billCustomers

)
```

#### Type parameters[​](#type-parameters-5 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-5 "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cronIdentifier`    | `string`                                                                 | A unique name for this scheduled job.                                                                                                                                         |
| `schedule`          | `Monthly`                                                                | What day and time (UTC) each month to run this function.                                                                                                                      |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | The arguments to the function.                                                                                                                                                |

#### Returns[​](#returns-5 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-8 "Direct link to Defined in")

[server/cron.ts:512](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L512)

***

### cron[​](#cron "Direct link to cron")

▸ **cron**<`FuncRef`>(`cronIdentifier`, `cron`, `functionReference`, `...args`): `void`

Schedule a mutation or action to run on a recurring basis.

Like the unix command `cron`, Sunday is 0, Monday is 1, etc.

```
 ┌─ minute (0 - 59)

 │ ┌─ hour (0 - 23)

 │ │ ┌─ day of the month (1 - 31)

 │ │ │ ┌─ month (1 - 12)

 │ │ │ │ ┌─ day of the week (0 - 6) (Sunday to Saturday)

"* * * * *"
```

#### Type parameters[​](#type-parameters-6 "Direct link to Type parameters")

| Name      | Type                                         |
| --------- | -------------------------------------------- |
| `FuncRef` | extends `SchedulableFunctionReferenceCompat` |

#### Parameters[​](#parameters-6 "Direct link to Parameters")

| Name                | Type                                                                     | Description                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cronIdentifier`    | `string`                                                                 | A unique name for this scheduled job.                                                                                                                                         |
| `cron`              | `string`                                                                 | Cron string like `"15 7 * * *"` (Every day at 7:15 UTC)                                                                                                                       |
| `functionReference` | `FuncRef`                                                                | A [FunctionReference](/api/modules/server.md#functionreference) or [FunctionReference\_future](/api/modules/server.md#functionreference_future) for the function to schedule. |
| `...args`           | [`OptionalRestArgs`](/api/modules/server.md#optionalrestargs)<`FuncRef`> | The arguments to the function.                                                                                                                                                |

#### Returns[​](#returns-6 "Direct link to Returns")

`void`

#### Defined in[​](#defined-in-9 "Direct link to Defined in")

[server/cron.ts:551](https://github.com/get-convex/convex-js/blob/main/src/server/cron.ts#L551)
