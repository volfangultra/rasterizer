function make_oy_rotation_matrix(degrees) {
  let cos = Math.cos(degrees*Math.PI/180.0);
  let sin = Math.sin(degrees*Math.PI/180.0);

  return new Mat4x4([[cos, 0, -sin, 0],
                     [  0, 1,    0, 0],
                     [sin, 0,  cos, 0],
                     [  0, 0,    0, 1]])
}


function make_translation_matrix(translation) {
  return new Mat4x4([[1, 0, 0, translation.x],
                     [0, 1, 0, translation.y],
                     [0, 0, 1, translation.z],
                     [0, 0, 0,             1]]);
}


function make_scaling_matrix(scale) {
  return new Mat4x4([[scale,     0,     0, 0],
                     [    0, scale,     0, 0],
                     [    0,     0, scale, 0],
                     [    0,     0,     0, 1]]);
}


function matrix_times_vector(mat4x4, vec4) {
  let result = [0, 0, 0, 0];
  let vec = [vec4.x, vec4.y, vec4.z, vec4.w];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i] += mat4x4.data[i][j]*vec[j];
    }
  }

  return new Vertex4(result[0], result[1], result[2], result[3]);
}


function matrix_times_matrix(matA, matB) {
  let result = new Mat4x4([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result.data[i][j] += matA.data[i][k]*matB.data[k][j];
      }
    }
  }

  return result;
}


function transpose(mat) {
  let result = new Mat4x4([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result.data[i][j] = mat.data[j][i];
    }
  }
  return result;
}