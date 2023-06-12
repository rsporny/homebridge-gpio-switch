var rpio = require("rpio");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-gpio-switch", "Switch", SwitchAccessory);
}

function SwitchAccessory(log, config) {
  this.log = log;
  this.name = config['name'];
  this.pin = config['pin'];
  this.invert = config['invert'];

  this.service = new Service.Switch(this.name);

  this.infoService = new Service.AccessoryInformation();
  this.infoService
    .setCharacteristic(Characteristic.Manufacturer, "Radoslaw Sporny")
    .setCharacteristic(Characteristic.Model, "RaspberryPi GPIO Switch")
    .setCharacteristic(Characteristic.SerialNumber, "Version 1.1.0");

  // use gpio pin numbering
  rpio.init({
    mapping: 'gpio'
  });
  rpio.open(this.pin, rpio.OUTPUT, rpio.HIGH);

  this.service
    .getCharacteristic(Characteristic.On)
    .on('set', this.setPowerState.bind(this));
}

SwitchAccessory.prototype.setPowerState = function(value, callback) {
  this.log("Setting switch to %s", value);
  if (this.invert) value = !value;
  rpio.write(this.pin, (value ? rpio.LOW : rpio.HIGH));
  callback();
}

SwitchAccessory.prototype.getServices = function() {
  return [this.infoService, this.service];
}

