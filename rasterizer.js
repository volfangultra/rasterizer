var canvas = document.getElementById("canvas");
var canvas_context = canvas.getContext("2d");
var canvas_buffer = canvas_context.getImageData(0, 0, canvas.width, canvas.height);
var canvas_pitch = canvas_buffer.width * 4;
var viewport_size = 1;
var projection_plane_z = 1;
var camera_position = [0, 0, 0];
var background_color = [255, 255, 255];
var camera_rotation = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
var background_color = [0, 0, 0];


function put_pixel(x, y, color) {
  x = canvas.width/2 + x;
  y = canvas.height/2 - y - 1;

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  var offset = 4*x + canvas_pitch*y;
  canvas_buffer.data[offset++] = color.r;
  canvas_buffer.data[offset++] = color.g;
  canvas_buffer.data[offset++] = color.b;
  canvas_buffer.data[offset++] = 255 // Alpha = 255 (full opacity)
}

function update_canvas() {
  canvas_context.putImageData(canvas_buffer, 0, 0);
}

function canvas_to_viewport(p2d) {
  return new Pt(
    p2d.x * viewport_size / canvas.width,
    p2d.y * viewport_size / canvas.height);
}


function viewport_to_canvas(p2d) {
  return new Pt(
    p2d.x * canvas.width / viewport_size | 0,
    p2d.y * canvas.height / viewport_size | 0);
}

let depth_buffer = Array();
depth_buffer.length = canvas.width * canvas.height;

function update_buffer_if_closer(x, y, inv_z) {
  x = canvas.width/2 + (x | 0);
  y = canvas.height/2 - (y | 0) - 1;

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return false;
  }

  let offset = x + canvas.width*y;
  if (depth_buffer[offset] == undefined || depth_buffer[offset] < inv_z) {
    depth_buffer[offset] = inv_z;
    return true;
  }
  return false;
}

function clear_all() {
  canvas.width = canvas.width;
  depth_buffer = Array();
  depth_buffer.length = canvas.width * canvas.height;
}
  

