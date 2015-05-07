var _ = require('underscore');
module.exports = {
  getMachineByUUID: function(machines, uuid) {
    return _.find(machines, function(machine) {
      return machine.uuid === uuid;
    });
  },
  removeMachineByUUID: function(machines, uuid) {
    return _.reject(machines, function(machine) {
      return machine.uuid === uuid;
    });
  },

  removeMachinesByClientId: function(machines, client_id) {
    return _.reject(machines, function(machine) {
      return machine.client_id === client_id;
    });
  }
};
