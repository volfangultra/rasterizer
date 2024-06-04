var canvas = document.getElementById("canvas");
var canvas_context = canvas.getContext("2d");
var canvas_buffer = canvas_context.getImageData(0, 0, canvas.width, canvas.height);
var canvas_pitch = canvas_buffer.width * 4;
var viewport_size = 1;
var projection_plane_z = 1;
var camera_position = [0, 0, 0];
var background_color = [255, 255, 255];


function put_pixel(x, y, color) {
  x = canvas.width/2 + x;
  y = canvas.height/2 - y - 1;
  console.log(x,y, color)

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  var offset = 4*x + canvas_pitch*y;
  canvas_buffer.data[offset++] = color[0];
  canvas_buffer.data[offset++] = color[1];
  canvas_buffer.data[offset++] = color[2];
  canvas_buffer.data[offset++] = 255; // Alpha = 255 (full opacity)
}

function update_canvas() {
  canvas_context.putImageData(canvas_buffer, 0, 0);
}

function canvas_to_viewport(p2d) {
    return [p2d[0] * viewport_size / canvas.width,
        p2d[1] * viewport_size / canvas.height,
        projection_plane_z];
}
  

