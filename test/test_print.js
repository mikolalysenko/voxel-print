var argv = require("optimist").argv;

var engine = require("voxel-engine")({ "generate": function(x,y,z) {
  return x*x+y*y+z*z <= 15 ? 1 : 0;
},  controlsDisabled: true });

var lpr = require("../index.js")({
  username: argv.username,
  password: argv.password
});

lpr(engine, function(err, model) {
  if(err) {
    console.log("Error connecting to ShapeWays:", err);
    return;
  }
  console.log("Uploaded a 3D model:", model);
});