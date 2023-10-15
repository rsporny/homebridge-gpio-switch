var rpio = require("rpio");
var Service, Characteristic, User;
var storage = require("node-persist");
const stateKey = "homebridge-gpio-switch.state";

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  User = homebridge.user;

  homebridge.registerAccessory("homebridge-gpio-switch", "Switch", SwitchAccessory);
}

function SwitchAccessory(log, config) {
  this.log = log;
  this.name = config['name'];
  this.pin = config['pin'];
  this.invert = config['invert'];
  this.storage = storage.create();
  const cacheDir = User.persistPath();
  this.storage.initSync({dir: cacheDir, forgiveParseErrors: true});

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
  rpio.open(this.pin, rpio.OUTPUT);
  value = this.storage.getItemSync(stateKey);
  this.log("Persisted state: " + value);
  this.setPowerState(value, e => {});
  this.service.getCharacteristic(Characteristic.On).updateValue(value);

  this.service
    .getCharacteristic(Characteristic.On)
    .on('set', this.setPowerState.bind(this));
}

SwitchAccessory.prototype.setPowerState = function(value, callback) {
  this.log("Setting switch to %s", value);
  if (this.invert) value = !value;
  rpio.write(this.pin, (value ? rpio.LOW : rpio.HIGH));
  this.storage.setItemSync(stateKey, value);
  callback();
}

SwitchAccessory.prototype.getServices = function() {
  return [this.infoService, this.service];
}
