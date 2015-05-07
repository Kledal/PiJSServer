function Machine(uuid) {
  this.uuid = uuid;

  this.connected = false;
  this.client_id;
  this.info;
}

Machine.prototype = {
  update: function(client_id, info) {
    this.client_id = client_id;
    this.info = info;
  },
  connected: function() {
    this.connected = true;
  }
};

module.exports = Machine;
