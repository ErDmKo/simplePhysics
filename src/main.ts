import { Vector } from './Vector'
import { FrameCounter } from './FrameCounter'
import { Polygon } from './Polygon'

const fc = new FrameCounter()
fc.begin()
console.log('hello world');
new Polygon(new Vector(), [new Vector()]);
new Vector(1,1).add(new Vector(1, 1))
fc.end()
