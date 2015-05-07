var _ = require('underscore');
module.exports = {
  getMachineByUUID: function(uuid) {
    return _.find(machines, function(machine) {
      return machine.uuid === uuid;
    });
  },
  removeMachineByUUID: function(uuid) {
    machines = _.reject(machines, function(machine) {
      return machine.uuid === uuid;
    });
  }
};
