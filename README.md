voxel-print
===========
3D print stuff in voxel.js using ShapeWays

Installation
============
Just do:

    npm install voxel-js

Usage
=====
First you need to connect to ShapeWays, which is pretty easy to do:

    var lpr3d = require("voxel-print")({
          username: "Your ShapeWays Username",
          password: "Your ShapeWays Password"
        });

And then you can print stuff by just calling `lpr3d`:

    lpr3d(voxels, function(err, result) {
      if(err) {
        console.log("Error uploading:", err);
        return;
      }
      console.log("Uploaded model:", result.model_id, ", url:", result.url);
    });

And that's it!  Here are some more details.


### `var lpr3d = require("voxel-print")(options);`
`module.exports` opens a connection to ShapeWays web service.  You need to specify the following values in options:

* `username`: The user name of your account at ShapeWays
* `password`: The password for your account
* `application_id`: (Optional) An identifier for your specific ShapeWays application.

This method returns a callable object that you can use to upload voxel models to ShapeWays directly


### `lpr3d(voxels[, options], callback(err, results))`
Once you've created a connection with the above method, you can invoke it by calling it directly.  To do this, you can pass in the following arguments:

* `voxels`: An instance 

