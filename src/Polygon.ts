import { Vector } from "./Vector";
import { intersectSafe } from "./Utils";

export class Polygon {
  constructor(private center: Vector, private vertices: Array<Vector> = []) {}

  getVertices(): Array<Vector> {
    return this.vertices;
  }
  getCenter(): Vector {
    return this.center;
  }

  addVertex(v: Vector): Polygon {
    this.vertices.push(v);
    return this;
  }
  add(v: Vector): Polygon {
    this.center = this.center.add(v);
    this.vertices = this.vertices.map((vertex) => vertex.add(v));
    return this;
  }
  rotate(angle: number): Polygon {
    this.vertices = this.vertices.map((v) => v.rotate(angle, this.center));
    return this;
  }
  // https://en.wikipedia.org/wiki/Hyperplane_separation_theorem
  intersectsWith(poly: Polygon) {
    const pointWallker = function (
      this: Polygon,
      collector: Array<Vector>,
      _: Vector,
      i: number
    ): Array<Vector> {
      if (i >= this.vertices.length) {
        return collector;
      }
      const iNext = i == this.vertices.length - 1 ? 0 : i + 1;
      collector.push(this.vertices[i].sub(this.vertices[iNext]));
      return collector;
    };
    let points: Record<string, Vector[][]> = {
      self: [],
      other: [],
      all: [],
    };
    this.vertices
      .reduce(pointWallker.bind(this), [])
      .concat(poly.vertices.reduce(pointWallker.bind(poly), []))
      .forEach((axisVector, axisCounter) => {
        points.self[axisCounter] = [] as Vector[];
        points.other[axisCounter] = [] as Vector[];
        let projections = {
          self: this.vertices.map((selfVector) => axisVector.dot(selfVector)),
          other: poly.vertices.map((polyVector) => axisVector.dot(polyVector)),
        };
        projections.self.forEach((elem: number, i: number) => {
          if (
            elem > Math.min.apply(null, projections.other) &&
            elem < Math.max.apply(null, projections.other)
          ) {
            points.self[axisCounter].push(this.vertices[i]);
          }
        });
        projections.other.forEach((elem: number, i: number) => {
          if (
            elem > Math.min.apply(null, projections.self) &&
            elem < Math.max.apply(null, projections.self)
          ) {
            points.self[axisCounter].push(poly.vertices[i]);
          }
        });
      });
    const result: Record<string, Vector[]> = {
      self: points.self.reduce(intersectSafe),
      other: points.other.reduce(intersectSafe),
    };
    result.all = result.self.concat(result.other);
    return result;
  }
}
