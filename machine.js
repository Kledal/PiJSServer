function Machine(uuid) {
  this.uuid = uuid;

  this.isConnected = false;
  this.client_id;
  this.info;
  this.lastSeen = new Date();
  this.frame;
}

Machine.prototype = {
  update: function(client_id, info) {
    this.client_id = client_id;
    this.info = info;
    this.lastSeen = new Date();
  },
  connected: function() {
    this.isConnected = true;
  },
  printFile: function() {

  },
  frame: function(frame) {
    this.frame = frame;
  }
};

module.exports = Machine;
