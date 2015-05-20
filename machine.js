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
    var output = JSON.stringify([ ["cancel_print", { data: { uuid: this.uuid, } }] ]);
    clients[this.client_id].sendUTF( output );
  },
  start_print: function(clients, job_id, file_path) {
    console.log("Starting print: " + job_id + ", file_path: " + file_path);
    var output = JSON.stringify([ ["run_job",
      {
        data: {
            uuid: this.uuid,
            job_id: job_id,
            gcode_url: file_path
        }
      }] ]);
      clients[this.client_id].sendUTF( output );
  }
};

module.exports = Machine;
