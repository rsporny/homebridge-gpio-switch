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

  this.service = new Service.Switch(this.name);

  this.infoService = new Service.AccessoryInformation();
  this.infoService
    .setCharacteristic(Characteristic.Manufacturer, "Radoslaw Sporny")
    .setCharacteristic(Characteristic.Model, "RaspberryPi GPIO Switch")
    .setCharacteristic(Characteristic.SerialNumber, "Version 1.2.1");
  this.service.getCharacteristic(Characteristic.On)
    .on('set', this.setPowerState.bind(this));

  // use gpio pin numbering
  rpio.init({
    mapping: 'gpio'
  });
  rpio.open(this.pin, rpio.OUTPUT, this.invert ? rpio.LOW : rpio.HIGH);
  this.storage.init({dir: cacheDir, forgiveParseErrors: true}).then(
    () => {
      return this.storage.getItem(stateKey);
    }).then(
      value => {
        this.log("Persisted state: " + value);
        this.setPowerState(value, e => {});
        this.service.getCharacteristic(Characteristic.On).updateValue(value);
    });
}

SwitchAccessory.prototype.setPowerState = function(value, callback) {
  this.log("Setting switch to %s", value);
  if (this.invert) value = !value;
  rpio.write(this.pin, (value ? rpio.LOW : rpio.HIGH));
  this.storage.setItem(stateKey, value).then(() => {callback();});
}

SwitchAccessory.prototype.getServices = function() {
  return [this.infoService, this.service];
}
