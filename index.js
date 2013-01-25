var shapeways = require("shapeways")
  , voxel     = require("voxel");

//Creates a promise
function makePromise(input_cb) {
  var completed = false
    , err       = null
    , result    = null
    , pending   = [];
  
  input_cb(function(nerr, nresult) {
    completed = true;
    err       = nerr;
    result    = nresult;
    for(var i=0; i<pending.length; ++i) {
      pending[i](err, result);
    }
    pending.length = 0;
    input_cb       = null;
  });

  return function(output_cb) {
    if(completed) {
      process.nextTick(function() {
        output_cb(err, result);
      });
      return;
    }
    pending.push(output_cb);
  }
}


function assembleMesh(voxels) {
  var positions   = [];
  var faces       = [];
  var face_colors = [];
  
  for(var id in voxels.chunks) {
    var chunk       = voxels.chunks[id]
    var chunk_coord = id.split("|");
    var shift       = new Array(3);
    for(var i=0; i<3; ++i) {
      shift[i]      = (chunk_coord[i] | 0) * voxels.chunkSize[i];
    }
    var mesh          = voxel.meshers.greedy(chunk, voxels.chunkSize);
    var vertex_offset = positions.length;
    for(var i=0; i<mesh.vertices.length; ++i) {
      var tmp = mesh.vertices[i];
      for(var j=0; j<3; ++j) {
        tmp[j] += shift[j];
      }
      positions.push(tmp);
    }
    for(var i=0; i<mesh.faces.length; ++i) {
      var f = mesh.faces[i];
      faces.push([
        f[0]+vertex_offset,
        f[1]+vertex_offset,
        f[2]+vertex_offset,
        f[3]+vertex_offset]);
      face_colors.push(f[4]);
    }
  }
  
  return {
    positions:    positions,
    faces:        faces,
    face_colors:  face_colors
  };
}

//3D prints a collection of voxels
function print(connection_promise, voxels, options, cb) {
  //Pull out options
  if(!cb) {
    cb      = options;
    options = {};
  }
  
  //Unpack voxel struct
  if(voxels.voxels) {
    voxels = voxels.voxels;
  }
  
  //Build parameters
  var params = { };
  for(var id in options) {
    params[id] = options[id];
  }
  params.model_json = assembleMesh(voxels);
  
  //Connect and upload mesh
  connection_promise(function(err, conn) {
    if(err) {
      cb(err);
      return;
    }
    conn.upload(params, function(err, model_id) {
      if(err) {
        cb(err);
        return;
      }
      cb(null, {
        model_id: model_id,
        url:      "http://www.shapeways.com/model/" + model_id
      });
    });
  });
}

//Creates a 3D printer function
module.exports = function(username, password, application_id) {
  if(!password) {
    params = username;
    username = params.username;
    password = params.password;
    if("application_id" in params) {
      application_id = params.application_id;
    }
  }
  
  var args = {
    username: username,
    password: password
  };
  if(application_id) {
    args.application_id = application_id;
  }
  
  var connection_promise = makePromise(shapeways.connect.bind(shapeways, args));
  
  return print.bind(null, connection_promise);
}
