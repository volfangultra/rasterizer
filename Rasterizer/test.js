var viewport_size = 1;
var projection_plane_z = 1;
var camera_position = [0, 0, 0];
var camera_rotation = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

var background_color = [0, 0, 0];

var lines = [	
				new Line(new Point(-200, -100), new Point(240, 120), [255,0,0]), 			
				new Line(new Point(-50, -200), new Point(60, 240), [0,0,255])
			]
for (let line of lines)
	line.draw()

update_canvas()
