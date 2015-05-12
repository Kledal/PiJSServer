function Camera(client_id) {
  this.client_id = client_id;
  this.uuid = null;
  this.lastFrame;
}

Camera.prototype = {
  save_frame: function(frame) {
    this.lastFrame = frame;
  },
  request_frame: function(connections) {
    connections[this.client_id].sendUTF( JSON.stringify([ ["ready_for_next_frame", { data: {} }] ]) );
  }
};

module.exports = Camera;
