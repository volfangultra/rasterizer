function Color(r, g, b) {
    return {
      r, g, b,
      mul: function(n) { return new Color(this.r*n, this.g*n, this.b*n); },
    };
  }

function Pt(x, y, h) {
    return {x, y, h};
  }


function Vertex(x, y, z) {
    return {
      x, y, z,
      add: function(v) { return new Vertex(this.x + v.x, this.y + v.y, this.z + v.z); },
      sub: function(v) { return new Vertex(this.x - v.x, this.y - v.y, this.z - v.z); },
      mul: function(n) { return new Vertex(this.x*n, this.y*n, this.z*n); },
      dot: function(vec) { return this.x*vec.x + this.y*vec.y + this.z*vec.z; },
      length: function() { return Math.sqrt(this.dot(this)); },
    }
}


function Vertex4(arg1, y, z, w) {
    if (y == undefined) {
        this.x = arg1.x;
        this.y = arg1.y;
        this.z = arg1.z;
        this.w = arg1.w | 1;
    } else {
        this.x = arg1;
        this.y = y;
        this.z = z;
        this.w = w;
    }
        this.add = function(v) { return new Vertex4(this.x + v.x, this.y + v.y, this.z + v.z); };
        this.sub = function(v) { return new Vertex4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w); };
        this.mul = function(n) { return new Vertex4(this.x*n, this.y*n, this.z*n, this.w); };
        this.dot = function(vec) { return this.x*vec.x + this.y*vec.y + this.z*vec.z; };
        this.cross = function(v2) { return new Vertex4(this.y*v2.z - this.z*v2.y, this.z*v2.x - this.x*v2.z, this.x*v2.y - this.y*v2.x); };
        this.length = function() { return Math.sqrt(this.dot(this)); };
}


function Mat4x4(data) {
    return {data};
}

const I4 = new Mat4x4([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);


function Triangle(indexes, color, normals, texture, uvs) {
    return {indexes, color, normals, texture, uvs}
}

function Model(vertices, triangles, bounds_center, bounds_radius) {
    return {vertices, triangles, bounds_center, bounds_radius};
}


function Instance(model, position, orientation, scale) {
    this.model = model;
    this.position = position;
    this.orientation = orientation || Identity4x4;
    this.scale = scale || 1.0;
    this.transform = matrix_times_matrix(make_translation_matrix(this.position), matrix_times_matrix(this.orientation, make_scaling_matrix(this.scale)));
}


function Camera(position, orientation) {
    this.position = position;
    this.orientation = orientation;
    this.clipping_planes = [];
}

function Plane(normal, distance) {
    return {normal, distance};
}

const LIGHT_AMBIENT = 0;
const LIGHT_POINT = 1;
const LIGHT_DIRECTIONAL = 2;

function Light(type, intensity, vector) {
    return {type, intensity, vector};
}


// A Texture.
function Texture(url) {
    this.image = new Image();
    this.image.src = url;

    let texture = this;

    this.image.onload = function() {
        texture.iw = texture.image.width;
        texture.ih = texture.image.height;

        texture.canvas = document.createElement("canvas");
        texture.canvas.width = texture.iw;
        texture.canvas.height = texture.ih;
        let c2d = texture.canvas.getContext("2d");
        c2d.drawImage(texture.image, 0, 0, texture.iw, texture.ih);
        texture.pixel_data = c2d.getImageData(0, 0, texture.iw, texture.ih);
    };

    this.get_texel = function(u, v) {
        let iu = (u*this.iw) | 0;
        let iv = (v*this.ih) | 0;

        let offset = (iv*this.iw*4 + iu*4);

        return new Color(
        this.pixel_data.data[offset + 0],
        this.pixel_data.data[offset + 1],
        this.pixel_data.data[offset + 2]
        );
    };
}