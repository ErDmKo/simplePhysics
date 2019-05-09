import { Vector } from './Vector'
import { WorldObj } from './WorldObj'

interface WorldOpt {
    objects?: WorldObj[],
    fps?: number,
    gravity?: Vector,
    dumpping?: number,
    angularD?: number,
    dt?: number,
}

export class World {

    objects: WorldObj[] = []
    fps?: 0
    gravity?: Vector = new Vector(0, 9.8)
    dumpping?: number = -1
    angularD?: number = -1
    dt?: number = 0

    constructor(
        private options: WorldOpt
    ) {
       Object.keys(options).forEach(key => {
           this[key] = options[key];
       });
    }

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
        for (let i = 0; i < this.objects.length; i ++) {
            const collision = obj.getPoly()
                .intersectsWith(this.objects[i].getPoly());
            if (collision.all.length) {
                obj.move(dr.scale(-1));
                obj.rotate(-1 * deltaTheta);
                const normal: Vector = collision
                    .self
                    .reduce((p, n) => {
                        return p.add(obj
                            .getPoly()
                            .getCenter()
                            .sub(n)
                        )
                    }, new Vector(0, 0))
                    .normalize();
                const vr: Vector  = obj.getVelocity();
                const omega: number = obj.getOmega();

                obj
                .setVelocity(
                    normal.scale(
                        -1 * 0.9 * vr.dot(normal)
                    )
                )
                .setOmega(
                    0.3 * (
                        omega === 0 ? 1 :
                        omega / Math.abs(omega)
                    ) *
                    obj
                        .getPosition()
                        .sub(collision.all[0]).cross(vr)
                )
            }
        }
    }
    draw(c: CanvasRenderingContext2D) {
        this.objects.forEach((obj) => {
            if (obj.getGravity()) {
                var f = this.gravity.scale(
                    obj.getMass()
                ).add(
                    obj.velocity.scale(
                        this.dumpping
                    )
                );
                var dr = obj.getVelocity()
                    .scale(this.dt)
                    .add(
                         obj
                         .getAcceleration()
                         .scale(
                             0.5 * this.dt * this.dt
                         )
                    )
                    .scale(10);

                var deltaTheta = obj.getOmega() * this.dt;
                var torque = 0;

                obj.move(dr);
                obj.rotate(deltaTheta);

                this.calcCollisions(obj, dr, deltaTheta);

                let newAcceleration: Vector = f.scale(
                    obj.getMass()
                );
                let dv = obj
                    .getAcceleration()
                    .add(newAcceleration)
                    .scale(
                        0.5 * this.dt
                    );

                torque = obj.getOmega() * this.angularD;

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
