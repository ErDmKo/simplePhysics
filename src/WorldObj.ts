import { Vector } from './Vector'
import { Polygon } from './Polygon'

export abstract class WorldObj {

    private poly: Polygon
    private J: number

    constructor(
        protected position: Vector,
        private gravity: boolean = true,
        private collision: boolean = true,
        private mass: number = 1,
        private velocity: Vector = new Vector(),
        private acceleration: Vector = new Vector(),
        private id: number = 0,
        private theta: number = 0,
        private omega: number = 0,
        private alpha: number = 0
    ) {
        this.poly = this.calcPoly();
        this.J = this.getInertia();
    }

    abstract calcPoly(): Polygon

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
    move(v: Vector) {
        this.position.add(v);
        this.poly.add(v);
    }
    draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        this.drawObjShape(c);
        c.fillStyle = 'green';
        c.fill();
        c.closePath();
        c.restore();
    }
}
export class Ball extends WorldObj {
    private size: number = 10
    private axis: Vector = new Vector(1, 0)
    private radius: number = 20

    calcPoly(): Polygon {
        let poly = new Polygon(this.position, []);
        const trangle = ( 2 * Math.PI ) / this.size;
        Array.call(null, {length: 10}).map(Number.call, Number)
            .forEach(i => {
                let point = new Vector(this.radius, 0);
                this.position
                    .add(point.rotate(i * trangle, this.axis));
                poly.addVertex(point);
            })
        return poly;
    }
}
