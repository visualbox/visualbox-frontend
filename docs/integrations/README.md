---
sidebar: auto
---

# Integrations

## Environments

### Node

The entrypoint for the Node environment is an `index.js` file in the root folder. A `package.json` file can be used to automatically install additional required dependencies.

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

The `output()` method will try to parse a JavaScript object into a JSON string.

### Python 3

The entrypoint for the Python 3 environment is a `main.py` file in the root folder. A `requirements.txt` file can be used to automatically install additional required dependencies.

You must import the globally accessible `visualbox` module to access the [configuration model](/configmodel/) as well as send data back to VisualBox dashboard:

``` python
import visualbox
```

The [configuration model](/configmodel/) is accessible through the `visualbox.MODEL` variable:

``` python
# visualbox.MODEL.<name>
myVariable = visualbox.MODEL.myVariable
```

To send data back to VisualBox dashboard, use the `visualbox.output()` method:

``` python
visualbox.output(myVariable)
# or: visualbox.output("a string")
```

The `output()` method will try to parse a Python dictionary into a JSON string.

### Go

The entrypoint for the Go environment is a `main.go` file in the root folder. A `glide.yaml` file can be used to automatically install additional required dependencies.

You must import the globally accessible `visualbox` package to access the [configuration model](/configmodel/) as well as send data back to VisualBox dashboard:

``` go
import "visualbox"
```

The [configuration model](/configmodel/) is accessible through the `visualbox.MODEL` interface:

``` go
// visualbox.MODEL[<name>]
myVariable = visualbox.MODEL["myVariable"]
```

To send data back to VisualBox dashboard, use the `visualbox.Output()` method (with a capital "O"):

``` go
visualbox.Output(myVariable)
// or: visualbox.Output("a string")
```

The `Output()` method will try to parse a Go map into a JSON string.
