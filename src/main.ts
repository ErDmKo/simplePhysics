import { Vector } from './Vector'
import { FrameCounter } from './FrameCounter'
import { Polygon } from './Polygon'
import { WorldObj } from './WorldObj'
import { World } from './World'

const fc = new FrameCounter()
fc.begin()
console.log('hello world');
new Polygon(new Vector(), [new Vector()]);
new Vector(1,1).add(new Vector(1, 1))
fc.end()
