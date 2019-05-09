import { Vector } from './Vector'
import { Polygon } from './Polygon'

interface WorldObjOpt {
    position: Vector,
    gravity?: boolean,
    collision?: boolean,
    mass?: number,
    velocity?: Vector,
    acceleration?: Vector,
    id?: number,
    theta?: number,
    omega?: number,
    alpha?: number,
}

export abstract class WorldObj implements WorldObjOpt {
    poly: Polygon
    J: number
    gravity = true
    position = new Vector()
    collision = true
    mass = 1
    velocity = new Vector()
    acceleration = new Vector()
    id = 0
    theta = 0
    omega = 0
    alpha = 0

    constructor(options: WorldObjOpt) {
        Object.keys(options).forEach(key => {
            this[key] = options[key];
        })
    }

    abstract calcPoly(): Polygon

    getGravity(): boolean {
        return this.gravity;
    }
    getJ(): number {
        return this.J;
    }

    getAlpha(): number {
        return this.alpha;
    }

    setAlpha(a: number): WorldObj {
        this.alpha = a;
        return this;
    }
    getMass(): number {
        return this.mass;
    }
    getPosition(): Vector {
        return this.position;
    }
    getAcceleration(): Vector {
        return this.acceleration;
    }
    setVelocity(v: Vector) {
        this.velocity = v;
        return this;
    }

    getVelocity(): Vector {
        return this.velocity;
    }
    getOmega(): number {
        return this.omega;
    }
    setOmega(n: number): WorldObj {
        this.omega = Math.abs(n) < 0.000001 ? 0 : n;
        return this;
    }

    getInertia(): number {
        return this.mass * 2 / 12000;
    }
    drawObjShape(c: CanvasRenderingContext2D) {
        const vertices: Array<Vector> = this.poly.getVertices()
        c.moveTo.apply(c, vertices[0].args());
        vertices.forEach((v: Vector) => {
            c.lineTo.apply(c, v.args())
        })
    }
    rotate(angle: number) {
        this.theta += angle;
        this.poly = this.poly.rotate(angle);
    }
    getPoly(): Polygon {
        return this.poly;
    }
    move(v: Vector) {
        this.position = this.position.add(v);
        this.poly.add(v);
    }
    draw(c: CanvasRenderingContext2D) {
        const [x, y] = this.poly.getCenter().args();
        c.save();
        c.beginPath();
        this.drawObjShape(c);
        c.fillStyle = 'green';
        c.fill();
        c.closePath();
        c.beginPath();
        c.arc(x, y, 2, 0, 2 * Math.PI);
        c.fillStyle = 'black';
        c.fill();
        c.restore();
    }
}
export class Ball extends WorldObj {
    polys: number
    axis = new Vector(1, 0)
    radius: number

    constructor(
        options: WorldObjOpt & {
            polys?: number
            radius?: number
    }) {
        super(options);
        this.poly = this.calcPoly();
        this.J = this.getInertia();
    }

    calcPoly(): Polygon {
        let poly = new Polygon(this.position, []);
        const trangle = ( 2 * Math.PI ) / this.polys;
        for (var i = 0; i < this.polys; i++) {
            let point = new Vector(this.radius, 0)
                .rotate(i * trangle, this.axis)
                .add(this.position)
            poly.addVertex(point);
        }
        return poly;
    }
    getInertia () {
        var r = this.radius;
        return this.mass*r*r/200;
    }
}
export class Block extends WorldObj {
    size: Vector

    constructor(options: WorldObjOpt & {
        size: Vector
    }) {
        super(options);
        this.poly = this.calcPoly();
        this.J = this.getInertia();
    }

    getInertia() {
        let [height, width] = this.size.args();
        return this.mass * (height * height + width * width) / 12000;
    }
    calcPoly() {
        let poly = new Polygon(
            this.position.add(this.size.scale(new Vector(0.5, 0.5)))
        );
        poly.addVertex(this.position)
        poly.addVertex(
            this.position.add(
                this.size.scale(new Vector(1, 0))
            )
        )
        poly.addVertex(this.position.add(this.size))
        poly.addVertex(
            this.position.add(
                this.size.scale(new Vector(0, 1))
            )
        )
        return poly;
    }
}
