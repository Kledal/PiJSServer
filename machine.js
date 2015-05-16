function Machine(uuid) {
  this.uuid = uuid;

  this.isConnected = false;
  this.client_id;
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
  cancel_print: function(clients) {
    var output = JSON.stringify([ ["cancel_print", { data: { uuid: uuid, } }] ]);
    clients[this.client_id].sendUTF( output );
  }
};

module.exports = Machine;
