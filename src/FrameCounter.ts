export class FrameCounter {
  constructor(
    private startTime: number = 0,
    private prevTime: number = 0,
    private frames: number = 0,
    private fps: number = 0
  ) {}
  begin(): FrameCounter {
    this.startTime = Date.now();
    return this;
  }
  getFps(): number {
    return this.fps;
  }
  end(): number {
    let time = Date.now();
    this.frames++;
    if (time > this.prevTime) {
      this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
      this.prevTime = time;
      this.frames = 0;
    }
    return time;
  }
}
