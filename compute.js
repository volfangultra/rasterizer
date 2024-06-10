const SM_FLAT = 0;
const SM_GOURAUD = 1;
const SM_PHONG = 2;
  
let SHADING_MODEL = SM_PHONG;
let USE_VERTEX_NORMALS = true;
let USE_PERSPECTIVE_CORRECT_DEPTH = true;

function interpolate(i0, d0, i1, d1) {
    if (i0 == i1) {
      return [d0];
    }
  
    let values = [];
    let a = (d1 - d0) / (i1 - i0);
    let d = d0;
    for (let i = i0; i <= i1; i++) {
      values.push(d);
      d += a;
    }
  
    return values;
}
  
  
function draw_line(p0, p1, color) {
    let dx = p1.x - p0.x, dy = p1.y - p0.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) { let swap = p0; p0 = p1; p1 = swap; }

        let ys = Interpolate(p0.x, p0.y, p1.x, p1.y);
        for (let x = p0.x; x <= p1.x; x++) {
            put_pixel(x, ys[(x - p0.x) | 0], color);
        }
    } else {
        if (dy < 0) { let swap = p0; p0 = p1; p1 = swap; }

        let xs = interpolate(p0.y, p0.x, p1.y, p1.x);
        for (let y = p0.y; y <= p1.y; y++) {
            put_pixel(xs[(y - p0.y) | 0], y, color);
        }
    }
}
  
  
function draw_wireframe_triangle(p0, p1, p2, color) {
    draw_line(p0, p1, color);
    draw_line(p1, p2, color);
    draw_line(p0, p2, color);
}
  
  
function project_vertex(v) {
    return viewport_to_canvas(new Pt(
        v.x * projection_plane_z / v.z,
        v.y * projection_plane_z / v.z));
}
  
  
function unproject_vertex(x, y, inv_z) {
    let oz = 1.0 / inv_z;
    let ux = x*oz / projection_plane_z;
    let uy = y*oz / projection_plane_z;
    let p2d = canvas_to_viewport(Pt(ux, uy));
    return new Vertex(p2d.x, p2d.y, oz);
}
  
  
function sorted_vertex_indexes(vertex_indexes, projected) {
    let indexes = [0, 1, 2];

    if (projected[vertex_indexes[indexes[1]]].y < projected[vertex_indexes[indexes[0]]].y) { let swap = indexes[0]; indexes[0] = indexes[1]; indexes[1] = swap; }
    if (projected[vertex_indexes[indexes[2]]].y < projected[vertex_indexes[indexes[0]]].y) { let swap = indexes[0]; indexes[0] = indexes[2]; indexes[2] = swap; }
    if (projected[vertex_indexes[indexes[2]]].y < projected[vertex_indexes[indexes[1]]].y) { let swap = indexes[1]; indexes[1] = indexes[2]; indexes[2] = swap; }

    return indexes;
}
  
  
function compute_triangle_normal(v0, v1, v2) {
    let v0v1 = v1.sub(v0);
    let v0v2 = v2.sub(v0);
    return v0v1.cross(v0v2);
}
  
  
function compute_ilumination(vertex, normal, camera, lights) {
    let illumination = 0;
    for (let l = 0; l < lights.length; l++) {
        let light = lights[l];
        if (light.type == LIGHT_AMBIENT) {
            illumination += light.intensity;
            continue;
        }

        let vl;
        if (light.type == LIGHT_DIRECTIONAL) {
            let camera_matrix = transpose(camera.orientation);
            let rotated_light = matrix_times_vector(camera_matrix, new Vertex4(light.vector));
            vl = rotated_light;
        } else if (light.type == LIGHT_POINT) {
            let camera_matrix = matrix_times_matrix(transpose(camera.orientation), make_translation_matrix(camera.position.mul(-1)));
            let transformed_light = matrix_times_vector(camera_matrix, new Vertex4(light.vector));
            vl = vertex.mul(-1).add(transformed_light);
        }

        // Diffuse
        let cos_alpha = vl.dot(normal) / (vl.length() * normal.length());
        if (cos_alpha > 0) {
            illumination += cos_alpha * light.intensity;
        }

        // Specular
        let reflected = normal.mul(2*normal.dot(vl)).sub(vl);
        let view = camera.position.sub(vertex);

        let cos_beta = reflected.dot(view) / (reflected.length() * view.length());
        if (cos_beta > 0) {
            let specular = 50;
            illumination += Math.pow(cos_beta, specular) * light.intensity;
        }
    }
    return illumination;
}
  
function edge_interpolate(y0, v0, y1, v1, y2, v2) {
    let v01 = interpolate(y0, v0, y1, v1);
    let v12 = interpolate(y1, v1, y2, v2);
    let v02 = interpolate(y0, v0, y2, v2);
    v01.pop();
    let v012 = v01.concat(v12);
    return [v02, v012];
}
  
  
function render_triangle(triangle, vertices, projected, camera, lights, orientation) {
    // Compute triangle normal. Use the unsorted vertices, otherwise the winding of the points may change.
    let normal = triangle.normals
    if(normal == null || normal == undefined){
        normal = compute_triangle_normal(vertices[triangle.indexes[0]], vertices[triangle.indexes[1]], vertices[triangle.indexes[2]]);
        triangle.normals = [normal.x, normal.y, normal.z]
    }

    // Backface culling.
    let vertex_to_camera = vertices[triangle.indexes[0]].mul(-1);
    if (vertex_to_camera.dot(normal) <= 0) 
        return;
    

    // Sort by projected point Y.
    let indexes = sorted_vertex_indexes(triangle.indexes, projected);
    var [i0, i1, i2] = indexes;
    var [v0, v1, v2] = [ vertices[triangle.indexes[i0]], vertices[triangle.indexes[i1]], vertices[triangle.indexes[i2]] ];

    // Get attribute values (X, 1/Z) at the vertices.
    let p0 = projected[triangle.indexes[i0]];
    let p1 = projected[triangle.indexes[i1]];
    let p2 = projected[triangle.indexes[i2]];

    // Compute attribute values at the edges.
    var [x02, x012] = edge_interpolate(p0.y, p0.x, p1.y, p1.x, p2.y, p2.x);
    var [iz02, iz012] = edge_interpolate(p0.y, 1.0/v0.z, p1.y, 1.0/v1.z, p2.y, 1.0/v2.z);
    if (triangle.texture) {
        if (USE_PERSPECTIVE_CORRECT_DEPTH) {
        var [uz02, uz012] = edge_interpolate(p0.y, triangle.uvs[i0].x / v0.z,
                                            p1.y, triangle.uvs[i1].x / v1.z,
                                            p2.y, triangle.uvs[i2].x / v2.z);
        var [vz02, vz012] = edge_interpolate(p0.y, triangle.uvs[i0].y / v0.z,
                                            p1.y, triangle.uvs[i1].y / v1.z,
                                            p2.y, triangle.uvs[i2].y / v2.z);
        } else {
        var [uz02, uz012] = edge_interpolate(p0.y, triangle.uvs[i0].x,
                                            p1.y, triangle.uvs[i1].x,
                                            p2.y, triangle.uvs[i2].x);
        var [vz02, vz012] = edge_interpolate(p0.y, triangle.uvs[i0].y,
                                            p1.y, triangle.uvs[i1].y,
                                            p2.y, triangle.uvs[i2].y);
        }
    }

    if (USE_VERTEX_NORMALS) {
        let transform = matrix_times_matrix(transpose(camera.orientation), orientation);
        var normal0 = matrix_times_vector(transform, new Vertex4(triangle.normals[i0]));
        var normal1 = matrix_times_vector(transform, new Vertex4(triangle.normals[i1]));
        var normal2 = matrix_times_vector(transform, new Vertex4(triangle.normals[i2]));
    } else {
        var normal0 = normal;
        var normal1 = normal;
        var normal2 = normal;
    }

    let intensity;
    if (SHADING_MODEL == SM_FLAT) {
        // Flat shading: compute lighting for the entire triangle.
        let center = Vertex((v0.x + v1.x + v2.x)/3.0, (v0.y + v1.y + v2.y)/3.0, (v0.z + v1.z + v2.z)/3.0);
        intensity = compute_ilumination(center, normal0, camera, lights);
    } else if (SHADING_MODEL == SM_GOURAUD) {
        // Gouraud shading: compute lighting at the vertices, and interpolate.
        let i0 = compute_ilumination(v0, normal0, camera, lights);
        let i1 = compute_ilumination(v1, normal1, camera, lights);
        let i2 = compute_ilumination(v2, normal2, camera, lights);
        var [i02, i012] = edge_interpolate(p0.y, i0, p1.y, i1, p2.y, i2);
    } else if (SHADING_MODEL == SM_PHONG) {
        // Phong shading: interpolate normal vectors.
        var [nx02, nx012] = edge_interpolate(p0.y, normal0.x, p1.y, normal1.x, p2.y, normal2.x);
        var [ny02, ny012] = edge_interpolate(p0.y, normal0.y, p1.y, normal1.y, p2.y, normal2.y);
        var [nz02, nz012] = edge_interpolate(p0.y, normal0.z, p1.y, normal1.z, p2.y, normal2.z);
    }


    // Determine which is left and which is right.
    let m = (x02.length/2) | 0;
    if (x02[m] < x012[m]) {
        var [x_left, x_right] = [x02, x012];
        var [iz_left, iz_right] = [iz02, iz012];
        var [i_left, i_right] = [i02, i012];

        var [nx_left, nx_right] = [nx02, nx012];
        var [ny_left, ny_right] = [ny02, ny012];
        var [nz_left, nz_right] = [nz02, nz012];

        var [uz_left, uz_right] = [uz02, uz012];
        var [vz_left, vz_right] = [vz02, vz012];
    } else {
        var [x_left, x_right] = [x012, x02];
        var [iz_left, iz_right] = [iz012, iz02];
        var [i_left, i_right] = [i012, i02];

        var [nx_left, nx_right] = [nx012, nx02];
        var [ny_left, ny_right] = [ny012, ny02];
        var [nz_left, nz_right] = [nz012, nz02];

        var [uz_left, uz_right] = [uz012, uz02];
        var [vz_left, vz_right] = [vz012, vz02];
    }


    // Draw horizontal segments.
    for (let y = p0.y; y <= p2.y; y++) {
        var [xl, xr] = [x_left[y - p0.y] | 0, x_right[y - p0.y] | 0];

        // Interpolate attributes for this scanline.
        var [zl, zr] = [iz_left[y - p0.y], iz_right[y - p0.y]];
        let zscan = interpolate(xl, zl, xr, zr);

        if (SHADING_MODEL == SM_GOURAUD) {
            var [il, ir] = [i_left[y - p0.y], i_right[y - p0.y]];
            var iscan = interpolate(xl, il, xr, ir);
        } else if (SHADING_MODEL == SM_PHONG) {
            var [nxl, nxr] = [nx_left[y - p0.y], nx_right[y - p0.y]];
            var [nyl, nyr] = [ny_left[y - p0.y], ny_right[y - p0.y]];
            var [nzl, nzr] = [nz_left[y - p0.y], nz_right[y - p0.y]];

            var nxscan = interpolate(xl, nxl, xr, nxr);
            var nyscan = interpolate(xl, nyl, xr, nyr);
            var nzscan = interpolate(xl, nzl, xr, nzr);
        }

        if (triangle.texture) {
            var uzscan = interpolate(xl, uz_left[y - p0.y], xr, uz_right[y - p0.y]);
            var vzscan = interpolate(xl, vz_left[y - p0.y], xr, vz_right[y - p0.y]);
        }

        for (let x = xl; x <= xr; x++) {
            let inv_z = zscan[x - xl];
            if (update_buffer_if_closer(x, y, inv_z)) {
                if (SHADING_MODEL == SM_FLAT) {
                    // Just use the per-triangle intensity.
                } else if (SHADING_MODEL == SM_GOURAUD) {
                    intensity = iscan[x-xl];
                } else if (SHADING_MODEL == SM_PHONG) {
                    let vertex = unproject_vertex(x, y, inv_z);
                    let normal = Vertex(nxscan[x - xl], nyscan[x - xl], nzscan[x - xl]);
                    intensity = compute_ilumination(vertex, normal, camera, lights);
                }

                let color;
                if (triangle.texture) {
                    if (USE_PERSPECTIVE_CORRECT_DEPTH) {
                        var u = uzscan[x - xl] / zscan[x - xl];
                        var v = vzscan[x - xl] / zscan[x - xl];
                    } else {
                        var u = uzscan[x - xl];
                        var v = vzscan[x - xl];
                    }
                    color = triangle.texture.get_texel(u, v);
                    } else {
                    color = triangle.color;
                }

                put_pixel(x, y, color.mul(intensity));
            }
        }
    }   
}
  
  
  // Clips a triangle against a plane. Adds output to triangles and vertices.
function clip_triangle(triangle, plane, triangles, vertices) {
    let v0 = vertices[triangle.indexes[0]];
    let v1 = vertices[triangle.indexes[1]];
    let v2 = vertices[triangle.indexes[2]];

    let in0 = plane.normal.dot(v0) + plane.distance > 0;
    let in1 = plane.normal.dot(v1) + plane.distance > 0;
    let in2 = plane.normal.dot(v2) + plane.distance > 0;

    let in_count = in0 + in1 + in2;
    if (in_count == 0) {
        // Nothing to do - the triangle is fully clipped out.
    } else if (in_count == 3) {
        // The triangle is fully in front of the plane.
        triangles.push(triangle);
    } else if (in_count == 1) {
        // The triangle has one vertex in. Output is one clipped triangle.
    } else if (in_count == 2) {
        // The triangle has two vertices in. Output is two clipped triangles.
    }
}
  
  
function transform_and_clip(clipping_planes, model, scale, transform) {
    // Transform the bounding sphere, and attempt early discard.
    let center = matrix_times_vector(transform, new Vertex4(model.bounds_center));
    let radius = model.bounds_radius*scale;
    for (let p = 0; p < clipping_planes.length; p++) {
        let distance = clipping_planes[p].normal.dot(center) + clipping_planes[p].distance;
        if (distance < -radius) {
        return null;
        }
    }
  
    // Apply modelview transform.
    let vertices = [];
    for (let i = 0; i < model.vertices.length; i++) {
        vertices.push(matrix_times_vector(transform, new Vertex4(model.vertices[i])));
    }
  
    // Clip the entire model against each successive plane.
    let triangles = model.triangles.slice();
    for (let p = 0; p < clipping_planes.length; p++) {
        let new_triangles = []
        for (let i = 0; i < triangles.length; i++) {
            clip_triangle(triangles[i], clipping_planes[p], new_triangles, vertices);
        }
        triangles = new_triangles;
    }
  
    return Model(vertices, triangles, center, model.bounds_radius);
}
  
  
  function render_model(model, camera, lights, orientation) {
    let projected = [];
    for (let i = 0; i < model.vertices.length; i++) {
        projected.push(project_vertex(new Vertex4(model.vertices[i])));
    }
    for (let i = 0; i < model.triangles.length; i++) {
        render_triangle(model.triangles[i], model.vertices, projected, camera, lights, orientation);
    }
  }
  
  
function render_scene(camera, instances, lights) {
    let cameraMatrix = matrix_times_matrix(transpose(camera.orientation), make_translation_matrix(camera.position.mul(-1)));
    for (let i = 0; i < instances.length; i++) {
        let transform = matrix_times_matrix(cameraMatrix, instances[i].transform);
        let clipped = transform_and_clip(camera.clipping_planes, instances[i].model, instances[i].scale, transform);
        if (clipped != null) {
            render_model(clipped, camera, lights, instances[i].orientation);
        }
    }
}