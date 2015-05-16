function Machine(uuid) {
  this.uuid = uuid;

  this.isConnected = false;
  this.client_id;
  this.connection;
  this.info;
  this.lastSeen = new Date();
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
  cancel_print: function() {
    var output = JSON.stringify([ ["cancel_print", { data: { uuid: uuid, } }] ]);
    this.connection.sendUTF( output );
  }
};

module.exports = Machine;
