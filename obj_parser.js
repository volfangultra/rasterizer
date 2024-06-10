document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
var OBJ = null

function handleFileSelect(event) {
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
        console.log("HELO")
        make_object();
    };
    reader.readAsText(file);
}

class OBJParser {
    constructor() {
        this.vertices = [];
        this.texture_coords = [];
        this.normals = [];
        this.faces = [];
    }

    parse(fileContent) {
        const lines = fileContent.split('\n');

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('#') || line === '') {
                return; // Skip comments and empty lines
            }

            const parts = line.split(/\s+/);
            const keyword = parts[0];

            switch (keyword) {
                case 'v':
                    this.parse_vertex(parts);
                    break;
                case 'vt':
                    this.parse_texture_cord(parts);
                    break;
                case 'vn':
                    this.parse_normal(parts);
                    break;
                case 'f':
                    this.parse_face(parts);
                    break;
                default:
                    // Ignore other cases
                    break;
            }
        });
    }

    parse_vertex(parts) {
        const vertex = parts.slice(1).map(Number);
        this.vertices.push(vertex);
    }

    parse_texture_cord(parts) {
        const texture_coord = parts.slice(1).map(Number);
        this.texture_coords.push(texture_coord);
    }

    parse_normal(parts) {
        const normal = parts.slice(1).map(Number);
        this.normals.push(normal);
    }

    parse_face(parts) {
        // Parse a face line like "f 1/1/1 2/2/2 3/3/3"

        const face = parts.slice(1).map(part => {
            const indices = part.split('/').map(index => parseInt(index, 10));
            if(indices.length == 3)
                return {
                    vertex_index: indices[0] - 1,
                    texture_index: indices[1] ? indices[1] - 1 : undefined,
                    normal_index: indices[2] ? indices[2] - 1 : undefined
                };
            else if(indices.length == 2)
                return {
                    vertex_index: indices[0] - 1,
                    texture_index: indices[1] ? indices[1] - 1 : undefined,
                    normal_index:null,
                };
        });

        if(face.length == 3){
            this.faces.push(face)
        }else{
            const a = face[0]
            for(let i = 1; i < face.length - 1; i+=1){
                const b = face[i]
                const c = face[i + 1]
                this.faces.push([a,b,c])
            }
        }
    }
}
