const RED = new Color(255, 0, 0);
const GREEN = new Color(0, 255, 0);
const BLUE = new Color(0, 0, 255);
const YELLOW = new Color(255, 255, 0);
const PURPLE = new Color(255, 0, 255);
const CYAN = new Color(0, 255, 255);

const wood_texture = new Texture("crate_texture.jpg");

const vertices = [
	new Vertex(1, 1, 1),
	new Vertex(-1, 1, 1),
	new Vertex(-1, -1, 1),
	new Vertex(1, -1, 1),
	new Vertex(1, 1, -1),
	new Vertex(-1, 1, -1),
	new Vertex(-1, -1, -1),
	new Vertex(1, -1, -1)
];

const triangles = [
	new Triangle([0, 1, 2], RED,    [new Vertex( 0,  0,  1), new Vertex( 0,  0,  1), new Vertex( 0,  0,  1)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
	new Triangle([0, 2, 3], RED,    [new Vertex( 0,  0,  1), new Vertex( 0,  0,  1), new Vertex( 0,  0,  1)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
	new Triangle([4, 0, 3], GREEN,  [new Vertex( 1,  0,  0), new Vertex( 1,  0,  0), new Vertex( 1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
	new Triangle([4, 3, 7], GREEN,  [new Vertex( 1,  0,  0), new Vertex( 1,  0,  0), new Vertex( 1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
	new Triangle([5, 4, 7], BLUE,   [new Vertex( 0,  0, -1), new Vertex( 0,  0, -1), new Vertex( 0,  0, -1)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
	new Triangle([5, 7, 6], BLUE,   [new Vertex( 0,  0, -1), new Vertex( 0,  0, -1), new Vertex( 0,  0, -1)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
	new Triangle([1, 5, 6], YELLOW, [new Vertex(-1,  0,  0), new Vertex(-1,  0,  0), new Vertex(-1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
	new Triangle([1, 6, 2], YELLOW, [new Vertex(-1,  0,  0), new Vertex(-1,  0,  0), new Vertex(-1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
	new Triangle([1, 0, 5], PURPLE, [new Vertex( 0,  1,  0), new Vertex( 0,  1,  0), new Vertex( 0,  1,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
	new Triangle([5, 0, 4], PURPLE, [new Vertex( 0,  1,  0), new Vertex( 0,  1,  0), new Vertex( 0,  1,  0)], wood_texture, [new Pt(0, 1), new Pt(1, 1), new Pt(0, 0)]),
	new Triangle([2, 6, 7], CYAN,   [new Vertex( 0, -1,  0), new Vertex( 0, -1,  0), new Vertex( 0, -1,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
	new Triangle([2, 7, 3], CYAN,   [new Vertex( 0, -1,  0), new Vertex( 0, -1,  0), new Vertex( 0, -1,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
];

function generate_sphere(divs, color) {
    let vertices = [];
    let triangles = [];

    let delta_angle = 2.0*Math.PI / divs;

    // Generate vertices and normals.
    for (let d = 0; d < divs + 1; d++) {
        let y = (2.0 / divs) * (d - divs/2);
        let radius = Math.sqrt(1.0 - y*y);
        for (let i = 0; i < divs; i++) {
            let vertex = new Vertex(radius*Math.cos(i*delta_angle), y, radius*Math.sin(i*delta_angle));
            vertices.push(vertex);
        }
    }

    // Generate triangles.
    for (let d = 0; d < divs; d++) {
        for (let i = 0; i < divs; i++) {
            let i0 = d*divs + i;
            let i1 = (d+1)*divs + (i+1)%divs;
            let i2 = divs*d + (i+1)%divs;
            let tri0 = [i0, i1, i2];
            let tri1 = [i0, i0+divs, i1];
            triangles.push(Triangle(tri0, color, [vertices[tri0[0]], vertices[tri0[1]], vertices[tri0[2]]]));
            triangles.push(Triangle(tri1, color, [vertices[tri1[0]], vertices[tri1[1]], vertices[tri1[2]]]));
        }
    }

    return new Model(vertices, triangles, new Vertex(0, 0, 0), 1.0);
}

const cube = new Model(vertices, triangles, new Vertex(0, 0, 0), Math.sqrt(3));

let instances = [
	new Instance(cube, new Vertex(-1.5, 0, 7), I4, 0.75),
	new Instance(cube, new Vertex(1.25, 2.5, 7.5), make_oy_rotation_matrix(195)),
	new Instance(cube, new Vertex(1.75, 0, 5), make_oy_rotation_matrix(-30)),
];

const camera = new Camera(new Vertex(-3, 1, 2), make_oy_rotation_matrix(-30));

let s2 = 1.0 / Math.sqrt(2);
camera.clipping_planes = [
	new Plane(new Vertex(  0,   0,  1), -1), // Near
	new Plane(new Vertex( s2,   0, s2),  0), // Left
	new Plane(new Vertex(-s2,   0, s2),  0), // Right
	new Plane(new Vertex(  0, -s2, s2),  0), // Top
	new Plane(new Vertex(  0,  s2, s2),  0), // Bottom
];

const lights = [
	new Light(LIGHT_AMBIENT, 0.2),
	new Light(LIGHT_DIRECTIONAL, 0.2, Vertex(-1, 0, 1)),
	new Light(LIGHT_POINT, 0.6, Vertex(-3, 2, -10))
];

function set_use_perspective_correct_depth(upcd) {
	USE_PERSPECTIVE_CORRECT_DEPTH = upcd;
	render();
}

function make_object(){
	let triangles = []
	let vertices = []
	for(let i = 0; i < OBJ.vertices.length; i+= 1){
		vertices.push(new Vertex(OBJ.vertices[i][0], OBJ.vertices[i][1], OBJ.vertices[i][2]))
	}

	for(let i = 0; i < OBJ.faces.length; i+= 1){
		if(OBJ.normals.length != 0)
			triangles.push(new Triangle( [OBJ.faces[i][0].vertex_index, OBJ.faces[i][1].vertex_index, OBJ.faces[i][2].vertex_index], BLUE, [
				new Vertex (OBJ.normals[OBJ.faces[i][0].normal_index][0], OBJ.normals[OBJ.faces[i][0].normal_index][0], OBJ.normals[OBJ.faces[i][0].normal_index][0]),
				new Vertex (OBJ.normals[OBJ.faces[i][1].normal_index][0], OBJ.normals[OBJ.faces[i][1].normal_index][1], OBJ.normals[OBJ.faces[i][1].normal_index][1]),
				new Vertex (OBJ.normals[OBJ.faces[i][2].normal_index][0], OBJ.normals[OBJ.faces[i][2].normal_index][2], OBJ.normals[OBJ.faces[i][2].normal_index][2])
			]))
		else
			triangles.push(new Triangle( [OBJ.faces[i][0].vertex_index, OBJ.faces[i][1].vertex_index, OBJ.faces[i][2].vertex_index], BLUE))
	}

	const alien = new Model(vertices, triangles, new Vertex(0, 0, 0), Math.sqrt(3));
	instances = [new Instance(alien, new Vertex(15, -5, 30), make_oy_rotation_matrix(195))]
	render()
}

function render() {
		clear_all();
		console.log(instances)
		// This lets the browser clear the canvas before blocking to render the scene.
		setTimeout(function(){
			render_scene(camera, instances, lights);
			update_canvas();
		}, 0);
}

/*
if (wood_texture.image.complete) {
	render();
} 
else {
	wood_texture.image.addEventListener("load", render);
}
*/