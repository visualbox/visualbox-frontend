# Configuration Types
---

## Text
```
{
  "type": "text",
  "name": String (required),
  "label": String (required),
  "default": String (optional)
}
```

## Password
```
{
  "type": "password",
  "name": String (required),
  "label": String (required),
  "default": String (optional)
}
```

## Switch
```
{
  "type": "switch",
  "name": String (required),
  "label": String (required),
  "default": Boolean (optional)
}
```

## Slider
```
{
  "type": "slider",
  "name": String (required),
  "label": String (required),
  "min": Number (required),
  "max": Number (required),
  "default": Number (optional)
}
```

## Select
```
{
  "type": "select",
  "name": String (required),
  "label": String (required),
  "options": Array (required),
  "default": String (optional)
}
```

Options array entry:
```
{
  "label": String (required),
  "value": String (required)
}
```
