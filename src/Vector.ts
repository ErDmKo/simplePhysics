export class Vector {
    constructor(
        private x:number = 0,
        private y:number = 0
    ) {}
    copy(): Vector {
        return new Vector(this.x, this.y)
    }
    cross(v: Vector) {
        const [x, y] = v.args()
        return this.x * y - this.y * x
    }
    dot(v: Vector): number {
        const [x, y] = this.scale(v).args()
        return x + y
    }
    normalize(): Vector {
        const length = 1/this.length();
        return this.scale(new Vector(length, length))
    }
    scale(v: Vector): Vector {
        const [x, y] = v.args()
        return new Vector(this.x * x, this.y * y)
    }
    length(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }
    add(v: Vector): Vector {
        const [x, y] = v.args();
        return new Vector(this.x + x, this.y + y)
    }
    rotate(angle:number, v: Vector): Vector {
        const sub = this.sub(v),
            [subX, subY] = sub.args(),
            [vX,  vY] = v.args(),
            x = vX + (subX * Math.cos(angle) - subY * Math.sin(angle)),
            y = vY + (subX * Math.sin(angle) - subY * Math.cos(angle))
        return new Vector(x, y)
    }
    args(): Array<number> {
        return [this.x, this.y]
    }
    sub(v: Vector): Vector {
        const [x, y] = v.args()
        return new Vector(this.x - x, this.y - y)
    }
}
