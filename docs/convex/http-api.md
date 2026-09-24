# Convex HTTP API

> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

The public functions that define a deployment are exposed at public HTTP endpoints.

## Convex value format[​](#convex-value-format "Direct link to Convex value format")

Each of the HTTP APIs take a `format` query param that describes how documents are formatted. Currently the only supported value is `json`. See our [types page](/database/types.md#convex-values) for details. Note that for simplicity, the `json` format does not support all Convex data types as input, and uses overlapping representation for several data types in output. We plan to add a new format with support for all Convex data types in the future.

## API authentication[​](#api-authentication "Direct link to API authentication")

The Functions API can be optionally authenticated as a user via a bearer token in a `Authorization` header. The value is `Bearer <access_key>` where the key is a token from your auth provider. See the [under the hood](/auth/clerk.md#under-the-hood) portion of the Clerk docs for details on how this works with Clerk.

Streaming export and streaming import requests require deployment admin authorization via the HTTP header `Authorization`. The value is `Convex <access_key>` where the access key comes from "Deploy key" on the Convex dashboard and gives full read and write access to your Convex data.

## Functions API[​](#functions-api "Direct link to Functions API")

### POST `/api/query`, `/api/mutation`, `/api/action`[​](#post-apiquery-apimutation-apiaction "Direct link to post-apiquery-apimutation-apiaction")

These HTTP endpoints allow you to call Convex functions and get the result as a value.

You can find your backend deployment URL on the dashboard [Settings](/dashboard/deployments/deployment-settings.md) page, then the API URL will be `<CONVEX_URL>/api/query` etc., for example:

* Shell
* NodeJS
* Python

```
curl https://acoustic-panther-728.convex.cloud/api/query \

   -d '{"path": "messages:list", "args": {}, "format": "json"}' \

   -H "Content-Type: application/json"
```

```
const url = "https://acoustic-panther-728.convex.cloud/api/query";

const request = { path: "messages:list", args: {}, format: "json" };



const response = fetch(url, {

  method: "POST",

  headers: {

    "Content-Type": "application/json",

  },

  body: JSON.stringify(request),

});
```

```
import requests



url = "https://acoustic-panther-728.convex.cloud/api/query"

headers = {"accept": "application/json"}

body = {"path": "messages:list", "args": {}, "format": "json"}



response = requests.post(url, headers=headers, json=body)
```

**JSON Body parameters**

| Name   | Type   | Required | Description                                                                                                     |
| ------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| path   | string | y        | Path to the Convex function formatted as a string as defined [here](/functions/query-functions.md#query-names). |
| args   | object | y        | Named argument object to pass to the Convex function.                                                           |
| format | string | n        | Output format for values. Valid values: \[`json`]                                                               |

**Result JSON on success**

| Field Name | Type          | Description                                            |
| ---------- | ------------- | ------------------------------------------------------ |
| status     | string        | "success"                                              |
| value      | object        | Result of the Convex function in the requested format. |
| logLines   | list\[string] | Log lines printed out during the function execution.   |

**Result JSON on error**

| Field Name   | Type          | Description                                                                                                 |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------- |
| status       | string        | "error"                                                                                                     |
| errorMessage | string        | The error message.                                                                                          |
| errorData    | object        | Error data within an [application error](/functions/error-handling/application-errors.md) if it was thrown. |
| logLines     | list\[string] | Log lines printed out during the function execution.                                                        |

### POST `/api/run/{functionIdentifier}`[​](#post-apirunfunctionidentifier "Direct link to post-apirunfunctionidentifier")

This HTTP endpoint allows you to call arbitrary Convex function types with the path in the request URL and get the result as a value. The function identifier is formatted as a string as defined [here](/functions/query-functions.md#query-names) with a `/` replacing the `:`.

You can find your backend deployment URL on the dashboard [Settings](/dashboard/deployments/deployment-settings.md) page, then the API URL will be `<CONVEX_URL>/api/run/{functionIdentifier}` etc., for example:

* Shell
* NodeJS
* Python

```
curl https://acoustic-panther-728.convex.cloud/api/run/messages/list \

   -d '{"args": {}, "format": "json"}' \

   -H "Content-Type: application/json"
```

```
const url = "https://acoustic-panther-728.convex.cloud/api/run/messages/list";

const request = { args: {}, format: "json" };



const response = fetch(url, {

  method: "POST",

  headers: {

    "Content-Type": "application/json",

  },

  body: JSON.stringify(request),

});
```

```
import requests



url = "https://acoustic-panther-728.convex.cloud/api/run/messages/list"

headers = {"accept": "application/json"}

body = {"args": {}, "format": "json"}



response = requests.get(url, headers=headers, body=json)
```

**JSON Body parameters**

| Name   | Type   | Required | Description                                                           |
| ------ | ------ | -------- | --------------------------------------------------------------------- |
| args   | object | y        | Named argument object to pass to the Convex function.                 |
| format | string | n        | Output format for values. Defaults to `json`. Valid values: \[`json`] |

**Result JSON on success**

| Field Name | Type          | Description                                            |
| ---------- | ------------- | ------------------------------------------------------ |
| status     | string        | "success"                                              |
| value      | object        | Result of the Convex function in the requested format. |
| logLines   | list\[string] | Log lines printed out during the function execution.   |

**Result JSON on error**

| Field Name   | Type          | Description                                                                                                 |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------- |
| status       | string        | "error"                                                                                                     |
| errorMessage | string        | The error message.                                                                                          |
| errorData    | object        | Error data within an [application error](/functions/error-handling/application-errors.md) if it was thrown. |
| logLines     | list\[string] | Log lines printed out during the function execution.                                                        |
