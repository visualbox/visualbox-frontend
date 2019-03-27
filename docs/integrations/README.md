---
sidebar: auto
---

# Integrations

## Environments

### Node

The entrypoint for the Node environment is an `index.js` file in the root folder. A `package.json` file can be used to install additional required dependencies.

You must import the globally accessible `visualbox` module to access the [configuration model](/configmodel/) as well as send data back to VisualBox dashboard:

``` js
const visualbox = require('visualbox')
```

The [configuration model](/configmodel/) is accessible through the `visualbox.MODEL` variable:

``` js
// visualbox.MODEL.<name>
const myVariable = visualbox.MODEL.myVariable
// or: const { myVariable } = visualbox.MODEL
```

To send data back to VisualBox dashboard, use the `visualbox.output()` method:

``` js
visualbox.output({ myVariable })
// or: visualbox.output('a string')
```
