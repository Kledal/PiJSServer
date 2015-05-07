var _ = require('underscore');
module.exports = {
  getMachineByUUID: function(machines, uuid) {
    return _.find(machines, function(machine) {
      return machine.uuid === uuid;
    });
  },
  removeMachineByUUID: function(machines, uuid) {
    machines = _.reject(machines, function(machine) {
      return machine.uuid === uuid;
    });
  }
};
