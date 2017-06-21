import { Vector } from './Vector'
import { FrameCounter } from './FrameCounter'

const fc = new FrameCounter()
fc.begin()
console.log('hello world');
new Vector(1,1).add(new Vector(1, 1))
fc.end()
