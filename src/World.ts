import { Vector } from './Vector'
import { WorldObj } from './WorldObj'

export class World {
    constructor(
        private objects: WorldObj[],
        private fps: number = 0,
        private gravity: Vector = new Vector(0, 1).scale(new Vector().fill(9.8)),
        private dumpping: number = -1,
        private angularD: number = -1,
        private dt: number = 0
    ) {}

    add(obj: WorldObj) {
        this.objects.push(obj);
    }
    setGravity(v: Vector) {
        this.gravity = v;
    }
    setFps(fps: number) {
        this.dt = fps < 1 ? 0.0001 : 1/fps;
    }
    private calcCollisions(
        obj: WorldObj, 
        dr: Vector,
        deltaTheta: number
    ) {
        for (var i = 0; i < this.objects.length; i ++) {
            let collision = obj.getPoly()
                .intersectsWith(this.objects[i].getPoly());
            if (collision.all.length) {
                obj.move(dr.scale(new Vector().fill(-1)));
                obj.rotate(-1 * deltaTheta);
                let normal: Vector = collision.self.reduce((p, n) => {
                    return p.add(obj
                        .getPoly()
                        .getCenter()
                        .sub(n)
                    )
                }, new Vector(0, 0));
                let vr: Vector  = obj.getVelocity();
                let omega: number = obj.getOmega();

                obj.setVelocity(normal.scale(new Vector().fill(-1 * 0.9 * vr.dot(normal))))
                    .setOmega (
                        0.3 * (omega / Math.abs(omega)) *
                        obj.getPosition()
                            .sub(collision.all[0]).cross(vr)
                    )
            }
        }
    }
    draw(c: CanvasRenderingContext2D) {
        this.objects.forEach((obj) => {
            if (!obj.getGravity()) {
                var f = new Vector(0, 0)
                var dr = obj.getVelocity()
                    .scale(new Vector().fill(this.dt))
                    .add(obj.getAcceleration()
                         .scale(
                             new Vector().fill(0.5 * this.dt * this.dt)
                         ))
                     .scale(new Vector().fill(10));
                var deltaTheta = obj.getOmega() * this.dt;
                var torque = 0;

                obj.move(dr);
                obj.rotate(deltaTheta);
                this.calcCollisions(obj, dr, deltaTheta);
                let newAcceleration: Vector = f.scale(
                    new Vector().fill(obj.getMass())
                );
                let dv = obj.getAcceleration().add(newAcceleration).scale(
                    new Vector().fill(0.5 * this.dt)
                );

                torque += obj.getOmega() * this.angularD;

                obj
                    .setVelocity(obj.getVelocity().add(dv))
                    .setAlpha(torque / obj.getJ())
                    .setOmega(
                        obj.getOmega() + 
                            obj.getAlpha() * this.dt
                    )
            }
            obj.draw(c)
        });
    }
}
