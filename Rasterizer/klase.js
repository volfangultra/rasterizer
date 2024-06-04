class Point{
    constructor(x,y,color){
        this.x = x
        this.y = y
        this.color = color
    }
    draw(){
        put_pixel(this.x | 0, this.y | 0, this.color)
    }

}

class Line {
    constructor(P0, P1, color){
        this.start = P0
        this.end = P1
        this.dx = this.end.x - this.start.x
        this.dy = this.end.y - this.start.y
        if(Math.abs(this.dx) > Math.abs(this.dy)){
            if(P0.x > P1.x){
                this.start = P1
                this.end = P0
            }
            this.x_dependent = false
        }else {
            if (P0.y > P1.y){
                this.start = P1
                this.end = P0
            }
            this.x_dependent = true
        }
        this.dx = this.end.x - this.start.x
        this.dy = this.end.y - this.start.y
        this.color = color
    }
    interpolate(){
        if(!this.x_dependent){
            if(this.dx == 0)
                return [this.start]

            var rez = []
            const a = this.dy / this.dx
            var y = this.start.y
            for(let x = this.start.x; x < this.end.x; x++){
                rez.push(new Point(x, y,this.color))
                y += a
            }
            return rez
        }

        if(this.dy == 0)
            return [this.start]

        var rez = []
        const a = this.dx / this.dy
        var x = this.start.x
        for(let y = this.start.y; y < this.end.y; y++){
            rez.push(new Point(x,y,this.color))
            x += a
        }
        return rez
        
    }

    draw(){
        var points = this.interpolate()
        for(let point of points)
            point.draw()
    }
}
