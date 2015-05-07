var _ = require('underscore');
var misc = require('./helpers.js');

var Machine = require('./machine.js');
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require("url")
var Redis = require('ioredis');

var sub = new Redis('redis://:JPFhQpvwxzSwsnJwfIHaoPgMxZJxFKO@10.29.0.67:6379');
var redis = new Redis('redis://:JPFhQpvwxzSwsnJwfIHaoPgMxZJxFKO@10.29.0.67:6379');

sub.subscribe('commands', function (err, count) {});

redis.on('message', function (channel, message) {
  console.log('Receive message %s from channel %s', message, channel);
});

var machines_connected = {};
var clients = [];

var machines = [];

var server = http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    var params = url.parse(request.url, true).query;

    switch(uri) {
      case '/':
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(JSON.stringify(machines));
        response.end();
      break;

      case '/send_cmd':
        var uuid = "55330343434351D072C1";
        var machine = machines_connected[uuid];
        var c_id = machine.client_id;
        var c_connection = clients[c_id];
      break;

      case '/cancel_print':
        var uuid = "55330343434351D072C1";
        var machine = machines_connected[uuid];
        var c_id = machine.client_id;
        var c_connection = clients[c_id];
        var output = JSON.stringify([ ["cancel_print",
          {
            data: {
                uuid: uuid,
            }
          }] ]);
          c_connection.sendUTF( output );

          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(JSON.stringify(machines_connected));
          response.end();
      break;

      case '/start_print':
        var uuid = "55330343434351D072C1";
        var path = params['url'] || "http://data01.gratisupload.dk/f/8rge1r24h9.gcode";
        var machine = machines_connected[uuid];
        var c_id = machine.client_id;
        var c_connection = clients[c_id];

        var output = JSON.stringify([ ["run_job",
          {
            data: {
                uuid: uuid,
                job_id: 1,
                gcode_url: path
            }
          }] ]);
          c_connection.sendUTF( output );

          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(JSON.stringify(machines_connected));
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
          case "server.machine_connected":
            var uuid = payload.uuid;
            var machine = misc.getMachineByUUID(machines, uuid);
            if (machine === undefined) { return; }
            console.log("Machine " + uuid + " is now connected");
            machine.connected = true;
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
              var machine = misc.getMachineByUUID(machines, uuid).update(index, machine);
            });

            redis.set('machines', JSON.stringify(machines_connected));
          break;
          default:
            console.log(payload);
          break;
        }
      }
    });

    connection.on('close', function(connection) {
      console.log("Connection closed");
      machines_connected = {};
      clients.splice(index, 1);
    });
});
