# homebridge-gpio-switch
Homebridge plugin to control relay switch via Raspberry Pi GPIO pins.

## Configuration
Sample accessory:
```
"accessories": [
    {
      "accessory": "Switch",
      "name": "Bedside lamp",
      "pin": 18,
      "invert": false
    }
]
```

Fields:

- `accessory` must always be *Switch*
- `name` accessory name, e.g. *Bedside lamp*
- `pin` control pin (use *gpio numbering*, not *physical*)
- `invert` false: relay activated by low state (0), true: relay activated by high state (1), affects *pin*

## Troubleshooting
- check platform: [Homebridge](https://github.com/nfarina/homebridge)
- check plugin dependency: [rpio](https://www.npmjs.com/package/rpio)
- or create issue
