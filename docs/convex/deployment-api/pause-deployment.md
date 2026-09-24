> For AI agents: see [llms.txt](/llms.txt) for the complete documentation index. Markdown versions are available by adding .md to a page URL or requesting Accept: text/markdown.

# Pause deployment

```
POST 
/pause_deployment
```

Disables a deployment without deleting any data. The deployment will not operate until it is unpaused. While a deployment is paused, new functions calls will return an error, scheduled jobs will queue and run when the deployment is resumed, and cron jobs will be skipped. This means that no function calls or bandwidth usage will be charged while the deployment is paused, but storage costs will still apply.

## Responses[​](#responses "Direct link to Responses")

* 200
