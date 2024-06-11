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

let COLOR = Color(0, 0, 255)

let instances = []
let triangles = []
let vertices = []
let model = null

function make_object(position = Vertex(0,0,30), orientation = I4, scale = 1){
	triangles = []
	vertices = []
	instances = []
	for(let i = 0; i < OBJ.vertices.length; i+= 1){
		vertices.push(new Vertex(OBJ.vertices[i][0], OBJ.vertices[i][1], OBJ.vertices[i][2]))
	}

	for(let i = 0; i < OBJ.faces.length; i+= 1){
		if(OBJ.normals.length != 0)
			triangles.push(new Triangle( [OBJ.faces[i][0].vertex_index, OBJ.faces[i][1].vertex_index, OBJ.faces[i][2].vertex_index], COLOR, [
				new Vertex (OBJ.normals[OBJ.faces[i][0].normal_index][0], OBJ.normals[OBJ.faces[i][0].normal_index][1], OBJ.normals[OBJ.faces[i][0].normal_index][2]),
				new Vertex (OBJ.normals[OBJ.faces[i][1].normal_index][0], OBJ.normals[OBJ.faces[i][1].normal_index][1], OBJ.normals[OBJ.faces[i][1].normal_index][2]),
				new Vertex (OBJ.normals[OBJ.faces[i][2].normal_index][0], OBJ.normals[OBJ.faces[i][2].normal_index][1], OBJ.normals[OBJ.faces[i][2].normal_index][2])
			]))
		else
			triangles.push(new Triangle( [OBJ.faces[i][0].vertex_index, OBJ.faces[i][1].vertex_index, OBJ.faces[i][2].vertex_index], COLOR))
	}

	if(OBJ.normals.length == 0){
		console.log("SWITCHING OFF VERTEX NORMALS ...")
		USE_VERTEX_NORMALS = false;
	}

	model = new Model(vertices, triangles, new Vertex(0, 0, 0), Math.sqrt(3));
	instances = [new Instance(model, position, orientation, scale)]
	render()
}

function render_book_example(){
	const wood_texture = new Texture("crate_texture.jpg");

	vertices = [
		new Vertex(1, 1, 1),
		new Vertex(-1, 1, 1),
		new Vertex(-1, -1, 1),
		new Vertex(1, -1, 1),
		new Vertex(1, 1, -1),
		new Vertex(-1, 1, -1),
		new Vertex(-1, -1, -1),
		new Vertex(1, -1, -1)
	];
	triangles = [
		new Triangle([0, 1, 2], COLOR,    [new Vertex( 0,  0,  1), new Vertex( 0,  0,  1), new Vertex( 0,  0,  1)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
		new Triangle([0, 2, 3], COLOR,    [new Vertex( 0,  0,  1), new Vertex( 0,  0,  1), new Vertex( 0,  0,  1)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
		new Triangle([4, 0, 3], COLOR,  [new Vertex( 1,  0,  0), new Vertex( 1,  0,  0), new Vertex( 1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
		new Triangle([4, 3, 7], COLOR,  [new Vertex( 1,  0,  0), new Vertex( 1,  0,  0), new Vertex( 1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
		new Triangle([5, 4, 7], COLOR,   [new Vertex( 0,  0, -1), new Vertex( 0,  0, -1), new Vertex( 0,  0, -1)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
		new Triangle([5, 7, 6], COLOR,   [new Vertex( 0,  0, -1), new Vertex( 0,  0, -1), new Vertex( 0,  0, -1)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
		new Triangle([1, 5, 6], COLOR, [new Vertex(-1,  0,  0), new Vertex(-1,  0,  0), new Vertex(-1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
		new Triangle([1, 6, 2], COLOR, [new Vertex(-1,  0,  0), new Vertex(-1,  0,  0), new Vertex(-1,  0,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
		new Triangle([1, 0, 5], COLOR, [new Vertex( 0,  1,  0), new Vertex( 0,  1,  0), new Vertex( 0,  1,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
		new Triangle([5, 0, 4], COLOR, [new Vertex( 0,  1,  0), new Vertex( 0,  1,  0), new Vertex( 0,  1,  0)], wood_texture, [new Pt(0, 1), new Pt(1, 1), new Pt(0, 0)]),
		new Triangle([2, 6, 7], COLOR,   [new Vertex( 0, -1,  0), new Vertex( 0, -1,  0), new Vertex( 0, -1,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
		new Triangle([2, 7, 3], COLOR,   [new Vertex( 0, -1,  0), new Vertex( 0, -1,  0), new Vertex( 0, -1,  0)], wood_texture, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
	];
	let cube = new Model(vertices, triangles, new Vertex(0, 0, 0), Math.sqrt(3));
	instances = [
		new Instance(cube, new Vertex(-1.5, 0, 7), I4, 0.75),
		new Instance(cube, new Vertex(1.25, 2.5, 7.5), make_oy_rotation_matrix(195)),
		new Instance(cube, new Vertex(1.75, 0, 5), make_oy_rotation_matrix(-30)),
	];

	if (wood_texture.image.complete) {
		render()
	} 
	else {
		wood_texture.image.addEventListener("load", render);
	}
}

function render() {
	clear_all();
	
	setTimeout(function(){
		render_scene(camera, instances, lights);
		update_canvas();
	}, 0);
}

function move_model(movement){
	instances = [new Instance(model, movement, instances[0].orientation, instances[0].scale)]
	render()
}

function rotate_model(orientation){
	instances = [new Instance(model, instances[0].position, matrix_times_matrix(instances[0].orientation, orientation), instances[0].scale)]
	render()
}

