var _ = require('underscore');
var misc = require('./helpers.js');
var Machine = require('./machine.js');
var Camera = require('./camera.js');
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require("url")
var Redis = require('ioredis');

var sub = new Redis('redis://:JPFhQpvwxzSwsnJwfIHaoPgMxZJxFKO@10.29.0.67:6379');
var redis = new Redis('redis://:JPFhQpvwxzSwsnJwfIHaoPgMxZJxFKO@10.29.0.67:6379');

sub.subscribe('commands', function (err, count) {});

sub.on('message', function (channel, message) {
  console.log('Receive message %s from channel %s', message, channel);

  var command = JSON.parse(message);
  if (command.info.uuid === undefined) return;

  var machine = misc.getMachineByUUID(machines, command.info.uuid);

  switch (command.name) {
    case "cancel_print":
      machine.cancel_print(clients);
    break;

    case "start_booking":
      machine.start_print(clients, command.info.booking_id, command.info.file);

    break;
  }

});

var machines_connected = {};
var clients = [];

var machines = [];
var cameras = [];

var server = http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    var params = url.parse(request.url, true).query;

    switch(uri) {
      case '/':
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(machines));
        response.end();
      break;
      case '/cams':
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(cameras));
        response.end();
      break;

      default:
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("Not found");
        response.end();
      break;
    }


});
server.listen(3000, function() { console.log("Server is listning") });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var x3g_settings = {
  'x_max_feedrate': "18000",
  'x_home_feedrate': "2500",
  'x_steps_per_mm': "88.573186",
  'x_endstop_is_max': 'true',

  'y_max_feedrate': "18000",
  'y_home_feedrate': "2500",
  'y_steps_per_mm': "88.573186",
  'y_endstop_is_max': 'true',

  'z_max_feedrate': "1170",
  'z_home_feedrate': "1100",
  'z_steps_per_mm': "400",
  'z_endstop_is_max': 'false',

  'e_max_feedrate': "1600",
  'e_steps_per_mm': "96.27520187033366",
  'e_motor_steps': '3200',

  'has_heated_bed': 'true'
};

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;
    var camera = new Camera(index);
    var camera_index = cameras.push(camera) - 1;

    console.log("Connection accepted");
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        var msg = JSON.parse(message.utf8Data);
        var header = msg[0];
        var payload = msg[1].data;

        if (header != 'server.update_data') {
          console.log("Msg header: " + header);
        }

        switch(header) {
          case "server.camera_frame":
            var frame = payload.frame;
            console.log("Received a frame from client: " + index);
            camera.save_frame(frame);

            redis.set('cams', JSON.stringify(cameras));

          break;
          case "server.machine_connected":
            var uuid = payload.uuid;
            var machine = misc.getMachineByUUID(machines, uuid);
            if (machine === undefined) { return; }
            console.log("Machine " + uuid + " is now connected");
            machine.connected();
          break;

          case "server.machine_disconnected":
            var uuid = payload.uuid;
            var machine = misc.getMachineByUUID(machines, uuid);
            if (machine === undefined) { return; }
            machines = misc.removeMachineByUUID(machines, machine.uuid);
          break;

          case "server.update_data":
            var machine_uuid_connected = payload.uuid_map;
            var serial_map = payload.iserial_map;

            var uuids = _.keys(serial_map);

            var machines_not_connected = {};
            _.each(uuids, function(uuid) {
              var exists = misc.getMachineByUUID(machines, uuid) !== undefined;
              if (!exists) {
                machines_not_connected[uuid] = {
                  protocol: JSON.stringify({protocol: 'x3g', x3g_settings: x3g_settings}),
                  uuid: uuid, baud: "115200"
                }

                console.log("Machine " + uuid + " is not created.");
                machines.push(new Machine(uuid));
              }
            });

            if (_.size(machines_not_connected) > 0) {
              connection.sendUTF( JSON.stringify([ ["connect_machines", { data: machines_not_connected }] ]) );
            }

            _.each(payload.machines, function(machine, uuid) {
              camera.uuid = uuid;
              var machine = misc.getMachineByUUID(machines, uuid).update(index, machine);

              camera.request_frame(clients);
            });

            redis.set('machines', JSON.stringify(machines));
          break;
          default:
            console.log(payload);
          break;
        }
      }
    });

    connection.on('close', function(connection) {
      machines = misc.removeMachinesByClientId(machines, index);
      console.log("Connection closed");
      clients.splice(index, 1);
      cameras.splice(camera_index, 1);
    });
});
