import { Vector } from './Vector'
import { intersectSafe } from './Utils'

export class Polygon {
    constructor(
        private center: Vector,
        private vertices: Array<Vector>
    ) {}

    addVertex(v: Vector): Polygon {
        this.vertices.push(v)
        return this;
    }
    add(v: Vector): Polygon {
        this.center = this.center.add(v);
        this.vertices = this.vertices
            .map((vertex) => vertex.add(v))
        return this;
    }
    rotate(angle: number): Polygon {
        this.vertices = this.vertices
            .map((v) => v.rotate(angle, this.center))
        return this;
    }
    intersectsWith(poly: Polygon) {
        const pointWallker = (
            collector: Array<Vector>,
            next: Vector,
            i:number
        ): Array<Vector> => {
            const iNext = i == this.vertices.length - 1 ? 0 : i+1;
            collector.push(this.vertices[i].sub(this.vertices[iNext]));
            return collector
        };
        let points = {
            self: [],
            other: [],
            all: []
        };
        this.vertices
            .reduce(pointWallker.bind(this), [])
            .concat(poly.vertices.reduce(pointWallker.bind(poly), []))
            .forEach((axisVector, axisCounter) => {
                points.self[axisCounter] = [];
                points.other[axisCounter] = [];
                let projections = {
                    self: this.vertices.map(selfVector => axisVector.dot(selfVector)),
                    other: poly.vertices.map(polyVector => axisVector.dot(polyVector))
                };
                projections.self.forEach((elem: number, i: number ) => {
                    if (elem > Math.min.apply(null, projections.other) 
                        && elem < Math.max.apply(null, projections.other)) {
                        points.self[axisCounter].push(poly.vertices[i]);
                    }
                })
                projections.other.forEach((elem: number, i: number) => {
                    if (elem > Math.min.apply(null, projections.self)
                        && elem < Math.max.apply(null, projections.self)) {
                        points.self[axisCounter].push(poly.vertices[i]);
                    }
                })
            });
            points.self = points.self.reduce(intersectSafe)
            points.other = points.other.reduce(intersectSafe)
            Object.keys(points)
                .slice(0, 2)
                .forEach(key => {
                    points.all = points.all.concat(points[key])
                })
            return points;
    }
}
