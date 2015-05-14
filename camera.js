function Camera(client_id) {
  this.client_id = client_id;
  this.uuid = null;
  this.lastFrame;
  this.requestTime = 5;
  this.next_update = new Date().getTime() + this.requestTime;
}

Camera.prototype = {
  save_frame: function(frame) {
    this.lastFrame = frame;
  },
  request_frame: function(connections) {
    if (new Date().getTime() > this.next_update) {
      connections[this.client_id].sendUTF( JSON.stringify([ ["ready_for_next_frame", { data: {} }] ]) );
      this.next_update = new Date().getTime() + this.requestTime;
    }
  }
};

module.exports = Camera;
