function Machine(uuid) {
  this.uuid = uuid;

  this.client_id;
  this.info;
}

Machine.prototype = {
  update: function(client_id, info) {
    this.client_id = client_id;
    this.info = info;
  }
};

module.exports = Machine;
