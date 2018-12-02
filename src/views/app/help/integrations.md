# Integrations
---

Integrations are composed of three files; **README**, **source** and **config**.

## README
The README of an integration is written in [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). The README should explain what it does, how it's configured and what the output looks like.

## Source
The source file is where the integration code is written. The code is executed in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

### Source injection: CONFIG
A **CONFIG** variable is injected into the Web Worker. This **CONFIG** variable is an object containing the values for the configuration definition to be used by the integration. Each property on this object is its name counterpart of the configuration definition. This allows the user to input configuration to be used by the integration.

As an example, take the following configuration definition:

```
[
  {
    "type": "text",
    "name": "pollMs",
    "label": "Update interval (ms)",
    "default": "30000"
  }
]
```
The injected **CONFIG** variable will be:
```
{
  pollMs: 30000
}
```

### Source injection: postMessate()
When an integration produces data it needs to send it back to VisualBox. To do so, the **postMessage()** function is used. The specified argument will be send back to VisualBox and be accessible in a dashboard.

Example:
```
const myData = {
  text: 'Hello from Integration!'
}
postMessage(myData)
```

## Config
The integration configuration is a JSON array containing configuration objects. The configuratioin will be parsed and accessible in the integration source code through the injected **CONFIG** variable.

Object configuration:
```
[
  {
    "type": String (required),
    "name": String (required),
    "label": String (required),
    "default": String
  },
  { ... }
]
```
You can read more about [available configuration types here](/app/h/config-types).
