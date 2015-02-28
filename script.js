var w = {},
    main = function() {
        var ball = new w.Ball({x:100, y:100}),
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
        FrameCounter = function(){
            
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
    var Vector = function(x, y){
            this.x = x || 0;
            this.y = y || 0;
        },
        typeHelper = function(args, callbacks) {
            if (args.length == 1){
                var n = args[0];
                if (n instanceof Vector){
                    return callbacks.vector ?
                            callbacks.vector.call(this, n) :
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
    Vector.prototype.rotate = function(angle, v){
        var sub = this.sub(v),
            x = v.x + ((sub.x * Math.cos(angle)) - (sub.y * Math.sin(angle))),
            y = v.y + ((sub.x * Math.sin(angle)) + (sub.y * Math.cos(angle)));
        return new Vector(x, y);
    }
    Vector.prototype.dot = function dot() {
        return typeHelper.apply(this, [arguments, {
            args: function(x, y) {
                var tmp = this.sub(x, y)
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
    var Polygon = function(center) {
        this.center = center;
        this.vertices = [];
    };
    Polygon.prototype.addVertex = function (v) {
        this.vertices.push(v);
    }
    Polygon.prototype.intersectsWith = function (poly){
        var test_vectors = this.vertices
            .reduce((function(prev, next, i) {
                var iPrev = i ? this.vertices.length - 1 : i,
                    iNext = iPrev == this.vertices.length? 0 : i+1;

                prev.push(this.vertices[iPrev].sub(this.vertices[iNext]));
                return prev;
            }).bind(this), [this.vertices[this.vertices.length-1]]);
    }
    w.Polygon = Polygon;
})();
(function(){
    var gravity = new w.Vector(0, 1).scale(9.8),
        dumpping = -1,
        World = function(){
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
                    dr = obj.velocity.scale(this.dt).add(obj.acceleration.scale(0.5*this.dt*this.dt));
                obj.move(dr.scale(10));
                f = f.add(gravity.scale(obj.mass));
                f = f.add(obj.velocity.scale(dumpping));
                
                var new_acceleration = f.scale(obj.mass),
                    dv = obj.acceleration.add(new_acceleration).scale(0.5*this.dt);
                obj.velocity = obj.velocity.add(dv);
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
            this.collision = typeof options.gravity === "undefined"? true : false;
            this.mass = 1;
            this.velocity = new w.Vector(0, 0);
            this.acceleration =new  w.Vector(0, 0);
            this.id = id++;
        };
    WorldObj.prototype.calcPoly = function() {
        return new w.Polygon(this.position);
    }
    WorldObj.prototype.drawObjShape = function(c) {
        throw 'Empty shape';
    }
    WorldObj.prototype.testCollision = function(objectsList){
        throw 'Empty collision shape'; 
    }
    WorldObj.prototype.move = function(v) {
        this.position = this.position.add(v);
        this.poly = this.calcPoly();
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
            this.poly = this.calcPoly();
        };    
    Ball.prototype = Object.create(w.WorldObj.prototype);
    Ball.prototype.calcPoly = function() {
        var poly = w.WorldObj.prototype.calcPoly.apply(this, arguments),
            size = 14,
            axis = new w.Vector(1, 0),
            trangle = (2*Math.PI)/size;
         
        for (var i=0; i < size; i++) {
            var point = new w.Vector(private_vars[this.id].radius, 0);
            point = this.position.add(point.rotate(i*trangle, axis));
            poly.addVertex(point);
        }
        return poly;
    }
    Ball.prototype.drawObjShape = function(c){
        c.arc.apply(c, this.position.args().concat([private_vars[this.id].radius, 0, 2*Math.PI, false]));
    }
    w.Ball = Ball;
})();
(function(){
    var private_vars = {},
        Block = function Block(options){
            w.WorldObj.apply(this, arguments); 
            private_vars[this.id] = {
                size: options.size? options.size : new w.Vector(10, 10)   
            }
            this.poly = this.calcPoly();
        };
    Block.prototype = Object.create(w.WorldObj.prototype);
    Block.prototype.calcPoly = function() {
        var poly = w.WorldObj.prototype.calcPoly.apply(this, arguments);
        poly.addVertex(this.position);
        poly.addVertex(this.position.add(private_vars[this.id].size.scale(new w.Vector(1,0))));
        poly.addVertex(this.position.add(private_vars[this.id].size));
        poly.addVertex(this.position.add(private_vars[this.id].size.scale(new w.Vector(0,1))));
        return poly;
    }
    w.Block = Block;
})();
main();
