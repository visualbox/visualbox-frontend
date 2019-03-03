---
sidebar: auto
---

# Integrations

## Environments

### Node

The entrypoint for the Node environment is a `index.js` file in the root folder. A `package.json` file can be used to install required dependencies.

The [configuration model](/configmodel/) is accessible through the `process.env.MODEL` variable.

``` js
// process.env.MODEL.<name>
const myVariable = process.env.MODEL.myVariable
```
