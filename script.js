Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};
var w = {},
    main = function() {
        var ball = new w.Ball({x: 300, y: 100}),
            block = new w.Block({
                x: 0,
                y: a.height-10,
                gravity: false,
                size: new w.Vector(a.width, 10)
            }),
            world = new w.World(),
            frameCounter = new w.FrameCounter(),
            update = function() {
                frameCounter.begin();
                c.clearRect(0, 0, a.width, a.height)
                world.setFps(frameCounter.getFps());
                world.draw(c);
                frameCounter.end();
                requestAnimationFrame(update);
            };
        world.add(ball);
        world.add(block);
        requestAnimationFrame(update);
    };
(function(){
    var startTime = Date.now(),
        prevTime = startTime,
        fps = 0,
        frames = 0,
        FrameCounter = function FrameCounter() {
            
        }
    FrameCounter.prototype.begin = function() {
        startTime = Date.now();
    };
    FrameCounter.prototype.getFps = function() {
        return fps;
    }
    FrameCounter.prototype.end = function() {
        var time = Date.now();
        frames++;
        if (time > prevTime) {
            fps = Math.round((frames * 1000) / (time - prevTime))
            prevTime = time;
            frames = 0;
        }
        return time;
    }
    w.FrameCounter = FrameCounter;
})();
(function(){
    var Vector = function Vector(x, y){
            this.x = x || 0;
            this.y = y || 0;
        },
        typeHelper = function(args, callbacks) {
            // TODO universe this for w obj
            if (args.length == 1){
                var n = args[0],
                    class_name = typeof n === "undefined" ? 
                        "undefined" : n.constructor.name.toLowerCase();

                if (n instanceof Vector){
                    return callbacks[class_name] ?
                            callbacks[class_name].call(this, n) :
                            this[args.callee.name].apply(this, n.args());
                } else {
                    return callbacks.oneArg ?
                        callbacks.oneArg.call(this, n) :
                        this[args.callee.name].call(this, n, n);
                }
            } else {
                return callbacks.args.apply(this, args)
            }
        }
    
    Vector.prototype.copy = function copy() {
        return new Vector(this.x, this.y);
    }
    Vector.prototype.length = function() {
        return Math.sqrt(this.args().reduce(function(prev, next){
            return prev*prev + next*next
        }));
    }
    Vector.prototype.rotate = function(angle, v){
        var sub = this.sub(v),
            x = v.x + ((sub.x * Math.cos(angle)) - (sub.y * Math.sin(angle))),
            y = v.y + ((sub.x * Math.sin(angle)) + (sub.y * Math.cos(angle)));
        return new Vector(x, y);
    }
    Vector.prototype.cross = function cross(v) {
        return this.x*v.y - this.y*v.x;
    }
    Vector.prototype.dot = function dot() {
        return typeHelper.apply(this, [arguments, {
            args: function(x, y) {
                var tmp = this.scale(x, y)
                return tmp.x + tmp.y;
            }
        }]);
    }
    Vector.prototype.scale = function scale(){
        return typeHelper.apply(this, [arguments, {
            args: function(x, y) {
                return new Vector(this.x * x, this.y * y);
            }
        }]);
    };
    Vector.prototype.normalize = function normalize() {
       return this.scale(1/this.length());
    }
    Vector.prototype.sub = function sub() {
        return typeHelper.apply(this, [arguments, {
            args: function(x, y) {
                return new Vector(this.x - x, this.y - y);
            }
        }]);
    };
    Vector.prototype.args = function args(){
        return [this.x, this.y];
    }
    Vector.prototype.toString = function toString(){
        return '[' + this.x + ',' + this.y + ']';
    }
    Vector.prototype.add = function add(){
        return typeHelper.apply(this, [arguments, {
            args: function(x, y) {
                return new Vector(this.x + x, this.y + y);
            }
        }]);
    };
    w.Vector = Vector;
})();
(function(){
    var intersect_safe = function intersect_safe(a, b){
           return  a.slice().filter(function(n){
                return b.indexOf(n) !=-1;
            })
        },
        Polygon = function Polygon(center) {
        this.center = center;
        this.vertices = [];
    };
    Polygon.prototype.addVertex = function (v) {
        this.vertices.push(v);
    };
    Polygon.prototype.add = function add(v) {
        this.center = this.center.add(v);
        this.vertices = this.vertices.map((function(vertex){
            return vertex.add(v);
        }).bind(this));
        return this;
    };
    Polygon.prototype.rotate = function (angle) {
        this.vertices = this.vertices.map((function(vertex){
            return vertex.rotate(angle, this.center);
        }).bind(this));
        return this;
    };
    Polygon.prototype.intersectsWith = function (poly){
        var self = this,
            point_wallker = function(prev, next, i) {
                var iPrev = i,
                    iNext = iPrev == this.vertices.length - 1 ? 0 : i+1;

                prev.push(this.vertices[iPrev].sub(this.vertices[iNext]));
                return prev;
            },
            axis_vectors = this.vertices
                .reduce(point_wallker.bind(this), [])
                .concat(poly.vertices.reduce(point_wallker.bind(poly), [])),
            points = {
                self: [],
                other: [],
                all: [],
                arr_length: 0
            }

        axis_vectors.forEach(function(axis_vector, axis_counter) {
            points.self[axis_counter] = [];
            points.other[axis_counter] = [];
            var projections = {
                self: self.vertices.map(function(self_vector, i) {
                    return axis_vector.dot(self_vector);
                }),
                other: poly.vertices.map(function(poly_vector, i) {
                    return axis_vector.dot(poly_vector);
                })
            }
            projections.self.forEach(function(elem, i) {
                if (elem > projections.other.min() && elem < projections.other.max()) {
                    points.self[axis_counter].push(self.vertices[i]);
                }
            });
            projections.other.forEach(function(elem, i) {
                if (elem > projections.self.min() && elem < projections.self.max()) {
                    points.other[axis_counter].push(poly.vertices[i]);
                }
            });
        });
        points.self = points.self.reduce(intersect_safe);
        points.other = points.other.reduce(intersect_safe);
        Object.keys(points).slice(0,2).forEach(function(key) {
            points.all = points.all.concat(points[key]);
            points.arr_length += points[key].length;
        });
        return points;
    };
    w.Polygon = Polygon;
})();
(function(){
    var gravity = new w.Vector(0, 1).scale(9.8),
        dumpping = -1,
        angularD = -1,
        World = function World(){
            this.objects = []; 
            this.fps = 0;
        }
    World.prototype.setGravity = function(vector){
        gravity = vector;
    }
    World.prototype.add = function(obj){
        this.objects.push(obj);
    }
    World.prototype.setFps = function(fps){
        this.dt = fps < 1 ? 0.0001 : 1/fps;
    }
    World.prototype.draw = function(c) {
        this.objects.forEach((function(obj) {
            if (!obj.gravity) {
                var f = new w.Vector(0, 0),
                    dr = obj.velocity.scale(this.dt).add(obj.acceleration.scale(0.5*this.dt*this.dt)).scale(10),
                    torque = 0;

                obj.move(dr);
                f = f.add(gravity.scale(obj.mass));
                f = f.add(obj.velocity.scale(dumpping));
                
                for (var i = 0; i < this.objects.length; i++) if (this.objects[i].id != obj.id) {
                    var collision = obj.poly.intersectsWith(this.objects[i].poly);
                    if (collision.all.length) {
                        var N = collision.self.reduce(function(p, n, i) {
                                return p.add(obj.poly.center.sub(n));
                            }, new w.Vector(0,0)).normalize(),
                            Vr = obj.velocity;

                        obj.velocity = N.scale(-1 * Vr.dot(N));
                        obj.move(dr.scale(-1));
                        obj.omega = -1 * 0.2 * (
                            obj.omega / Math.abs(obj.omega)) * obj.position.sub(collision.all[0]).cross(Vr);
                    }
                }
                var new_acceleration = f.scale(obj.mass),
                    dv = obj.acceleration.add(new_acceleration).scale(0.5*this.dt);

                obj.velocity = obj.velocity.add(dv);
                torque += obj.omega * angularD;
                obj.alpha = torque / obj.J;
                obj.omega += obj.alpha * this.dt;
                var deltaTheta = obj.omega * this.dt;
                obj.rotate(deltaTheta);
            }
            obj.draw(c)
        }).bind(this));
    };  
    w.World = World;
})();
(function(){
    var id = 0,
        WorldObj = function WorldObj(options) {
            this.position = new w.Vector(options.x, options.y);
            this.gravity = typeof options.gravity === "undefined"? options.gravity : true;
            this.collision = typeof options.gravity === "undefined";
            this.mass = 1;
            this.velocity = new w.Vector(0, 0);
            this.acceleration =new  w.Vector(0, 0);
            this.id = id++;
            this.theta = 0;
            this.omega = 0;
            this.alpha = 0;
        };
    WorldObj.prototype.postInit = function() {
        this.poly = this.calcPoly();
        this.J = this.getInertia();
    } 
    WorldObj.prototype.getInertia = function() {
        return this.mass * 2 / 12000;
    }
    WorldObj.prototype.calcPoly = function() {
        return new w.Polygon(this.position);
    }
    WorldObj.prototype.drawObjShape = function(c) {
        throw 'Empty shape';
    }
    WorldObj.prototype.testCollision = function(objectsList){
        throw 'Empty collision shape'; 
    }
    WorldObj.prototype.rotate = function(angle) {
        this.theta += angle;
        this.poly = this.poly.rotate(angle);
    }
    WorldObj.prototype.move = function(v) {
        this.position = this.position.add(v);
        this.poly = this.poly.add(v);
    }
    WorldObj.prototype.drawObjShape = function(c){
        c.moveTo.apply(c, this.poly.vertices[0].args());
        for (var i = 1; i < this.poly.vertices.length; i++) {
            c.lineTo.apply(c, this.poly.vertices[i].args());
        }
    }
    WorldObj.prototype.draw = function(c){
        c.save();
        c.beginPath();
        this.drawObjShape(c);
        c.fillStyle = 'green';
        c.fill();
        c.closePath();
        c.restore();
    }
    w.WorldObj = WorldObj;
})();
(function(){
    var private_vars = {},
        Ball = function Ball(options) {
            w.WorldObj.apply(this, arguments); 
            private_vars[this.id] = {
                radius: options.radius || 20,
            }
            this.omega = 3;
            this.postInit();
        };    
    Ball.prototype = Object.create(w.WorldObj.prototype);
    Ball.prototype.calcPoly = function() {
        var poly = w.WorldObj.prototype.calcPoly.apply(this, arguments),
            size = 5,
            axis = new w.Vector(1, 0),
            trangle = (2*Math.PI)/size;
         
        for (var i=0; i < size; i++) {
            var point = new w.Vector(private_vars[this.id].radius, 0);
            point = this.position.add(point.rotate(i*trangle, axis));
            poly.addVertex(point);
        }
        return poly;
    }
    Ball.prototype.getInertia = function() {
        var r = private_vars[this.id].radius;
        return this.mass*r*r/200;
    }
    /*
    Ball.prototype.drawObjShape = function(c) {
        c.arc.apply(c, this.position.args().concat([private_vars[this.id].radius, 0, 2*Math.PI, false]));
    }
    */
    w.Ball = Ball;
})();
(function(){
    var private_vars = {},
        Block = function Block(options) {
            w.WorldObj.apply(this, arguments); 
            private_vars[this.id] = {
                size: options.size? options.size : new w.Vector(10, 10)   
            }
            this.postInit();
        };
    Block.prototype = Object.create(w.WorldObj.prototype);
    Block.prototype.getInertia = function() {
        var height = private_vars[this.id].size.y,
            width = private_vars[this.id].size.x;

        return this.m * (height*height + width*width) / 12000;
    };
    Block.prototype.calcPoly = function() {
        var poly = new w.Polygon(this.position.add(private_vars[this.id].size.scale(0.5)));
        poly.addVertex(this.position);
        poly.addVertex(this.position.add(private_vars[this.id].size.scale(new w.Vector(1,0))));
        poly.addVertex(this.position.add(private_vars[this.id].size));
        poly.addVertex(this.position.add(private_vars[this.id].size.scale(new w.Vector(0,1))));
        return poly;
    }
    w.Block = Block;
})();
main();
