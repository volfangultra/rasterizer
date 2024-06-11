function handle_keydown(event) {
    let position = null
    switch(event.key) {
        case 'w':
        case 'W':
            position = instances[0].position
            position.y += MOVEMENT_SPEED
            move_model(position);
            break;
        case 'a':
        case 'A':
            position = instances[0].position
            position.x -= MOVEMENT_SPEED
            move_model(position);
            break;
        case 's':
        case 'S':
            position = instances[0].position
            position.y -= MOVEMENT_SPEED
            move_model(position);
            break;
        case 'd':
        case 'D':
            position = instances[0].position
            position.x += MOVEMENT_SPEED
            move_model(position);
            break;
        case 'e':
        case 'E':
            rotate_model(make_oy_rotation_matrix(ROTATION_SPEED));
            break;
        case 'q':
        case 'Q':
            rotate_model(make_oy_rotation_matrix(-ROTATION_SPEED));
            break;
        
    }
}

function handle_wheel(event) {
    if (event.deltaY < 0) {
        position = instances[0].position
        position.z -= MOVEMENT_SPEED
        move_model(position);
    } else {
        position = instances[0].position
        position.z += MOVEMENT_SPEED
        move_model(position);
    }
}

function handle_file_select(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const parser = new OBJParser();
        parser.parse(content);
        OBJ = parser;
        make_object();
    };
    reader.readAsText(file);
}

function handle_scale_change(event) {
    instances = [new Instance(model, instances[0].position, instances[0].orientation, event.target.value)]
    render();
}

function handle_vertex_normals_toggle(event) {
    USE_VERTEX_NORMALS = event.target.checked;
    render();
}

function handle_perspective_correct_depth_toggle(event) {
    USE_PERSPECTIVE_CORRECT_DEPTH = event.target.checked;
    render();
}

function handle_shading_mode_change(event) {
    SHADING_MODEL = parseInt(event.target.value);
    render();
}

function handle_color_picker_change(event) {
    hex = event.target.value;
    hex = hex.replace(/^#/, '');

    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    COLOR = new Color(r,g,b)
    if(instances.length != 0)
        make_object(instances[0].position, instances[0].orientation, instances[0].scale)
}

function draw_wireframe(event){
    WIREFRAME = event.target.checked;
    render()
}

function use_backface(event){
    BACKFACE = event.target.checked
    render()
}

document.getElementById('scale').addEventListener('input', handle_scale_change);
document.getElementById('use_vertex_normals').addEventListener('change', handle_vertex_normals_toggle);
document.getElementById('draw_wireframe').addEventListener('change', draw_wireframe);
document.getElementById('use_perspective_correct_depth').addEventListener('change', handle_perspective_correct_depth_toggle);
document.getElementById('shading_mode').addEventListener('change', handle_shading_mode_change);
document.getElementById('backface').addEventListener('change', use_backface)
document.getElementById('color_picker').addEventListener('input', handle_color_picker_change);
document.getElementById('clear_button').addEventListener('click', function() {
    clear_all();
});
document.getElementById('render_book_example').addEventListener('click', function() {
    render_book_example();
});

window.addEventListener('keydown', handle_keydown);
window.addEventListener('wheel', handle_wheel);
document.getElementById('fileInput').addEventListener('change', handle_file_select, false);