import { Vector } from "./Vector";
import { FrameCounter } from "./FrameCounter";
import { Polygon } from "./Polygon";
import { WorldObj, Ball, Block } from "./WorldObj";
import { World } from "./World";

export const m = (() => {
  const canvas = document.getElementsByTagName("canvas")[0];
  const body = document.body;
  const ctx = canvas.getContext("2d");

  const fc = new FrameCounter();
  const ball = new Ball({
    position: new Vector(300, 100),
    polys: 3,
    omega: 0,
    radius: 50,
  });
  const block = new Block({
    position: new Vector(0, canvas.height - 10),
    gravity: false,
    size: new Vector(canvas.width, 10),
  });
  const world = new World({
    objects: [ball, block],
  });
  const animate = () => {
    fc.begin();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    world.setFps(fc.getFps());
    world.draw(ctx);
    fc.end();
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
})();
