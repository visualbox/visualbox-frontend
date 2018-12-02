# Widgets
---

Widgets are composed of three files; **README**, **source** and **config**.

## README
The README of a widget is written in [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). The README should explain what it does, how it's configured and what the output looks like.

## Source
The source file is where the integration code is written. The code is executen in an [IFrame](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).

### Source injection: CONFIG
A **CONFIG** variable is injected into the IFrame. This **CONFIG** variable is an object containing the values for the configuration definition to be used by the widget. Each property on this object is its name counterpart of the configuration definition. This allows the user to input configuration to be used by the widget.

As an example, take the following configuration definition:

```
[
  {
    "type": "text",
    "name": "title",
    "label": "Widget Title"
  }
]
```
The injected **CONFIG** variable will be:
```
{
  title: null
}
```

### Source injection: DATA
In addition to **CONFIG** a **DATA** variable is also injected. **DATA** is pointing to the selected data source from an integration output.

### Source injection: onMessage(event)
The **onMessage(event)** function is called whenever updated data is provided to the widget.

The event argument takes the following form:

```
{
  type: 'CONFIG_CHANGED'|'DATA_CHANGED',
  value: <new data>
}
```
Whenever **onMessage()** is called, **CONFIG** and **DATA** are automatically updated.

## Config
The widget configuration is a JSON array containing configuration objects. The configuratioin will be parsed and accessible in the widget source code through the injected **CONFIG** variable.

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
