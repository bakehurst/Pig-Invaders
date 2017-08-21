/* 
 * The MIT License
 *
 * Copyright 2017 Brian Akehurst.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

define([
    "modules/utilities",
    "modules/armsFactory"
], function (utils,factory) {
    var 
        height      =   700,
        width       =   1000,
        fh          =   700,
        fw          =   1000;
                    
var Behavior = function(pig)  {
    var orbit   = undefined, 
        name    = "Base",
        angle   = -150;

    Object.defineProperty(this,'orbit', {
        get: function() {
            return orbit;
        },
        set: function(value) {
            if(value !== undefined) {
               orbit = value;         
            }
        }
    });
    Object.defineProperty(this,'pig', {
        get: function() {
            return pig;
        }
    });
    Object.defineProperty(this,'angle', {
        get: function() {
            return angle;
        },
        set: function(value) {
            if(value !== undefined) {
                angle = value;
            }
        },
        configurable:true
    });
    Object.defineProperty(this,'speed', {
        get: function() {
            return orbit.speed;
        },
        set: function(value) {
            if(value) {
                orbit.speed = value;
            }
        }
    });
    Object.defineProperty(this,'name', {
        get: function() {
            return name;
        },
        set: function(value) {
            if(value) {
                name = value;
            }
        }
    });
    Object.defineProperty(this,'fH', {
        get: function() {
            return height/fh;
        }

    });
    Object.defineProperty(this,'fW', {
        get: function() {
            return width/fw;
        }
    });     
    
};
Behavior.prototype = {
   execute : function(fps) {

   }, 
   fire    : function(options)  {
        if(options.noFire) return;
        var rotation = Math.round(Math.abs(this.angle) / 360);
        var angle = Math.round(Math.abs(this.angle) % 360);
        var firePos = this.orbit.firePos; 
        var pig = this.pig;
        firePos.positions.forEach(function(pos){
            if(pos.rotation !== rotation && angle === pos.angle) {
                pig.load(options.type,options.qty);                
                pig.aim();
                pig.fire();
                pos.angle = utils.getRandomInt(
                               firePos.range.start,firePos.range.end);
                pos.rotation = rotation+1;
            }
        });       
   }
};

var YOrbit = function(pig) {
    Behavior.call(this,pig);
    this.orbit = factory.getOrbit("yOrbit");
    this.name = "YOrbit";
    var radX = this.orbit.radiusX;    
    Object.defineProperty(this,'radiusX', {
        get: function() {
            return radX;
        },
        set: function(value) {
            if(value) {              
                radX = value;
            }
        }
    });
    
};
YOrbit.prototype = Object.create(Behavior.prototype);
YOrbit.prototype.execute = function(fps,options) {
    function rotateY() {
        this.angle = (this.angle - (this.speed*fps));
        var x = Math.round(this.orbit.center.x +
                     (this.radiusX  * Math.cos(Math.radians(this.angle)))),
            y = Math.round(this.orbit.center.y),
            z = Math.round(this.orbit.center.z +(this.orbit.radiusZ * 
                                     Math.sin(Math.radians(this.angle))));
       this.pig.position(x*this.fW,y*this.fH,z*this.fH);       
    };
    rotateY.call(this);
    if(!options.noFire) {
        this.fire.call(this,options);
    }
};

var XOrbit = function(pig) {
    Behavior.call(this,pig);
    this.orbit = factory.getOrbit("xOrbit");    
    this.name = "XOrbit";     
};
XOrbit.prototype = Object.create(Behavior.prototype);
XOrbit.prototype.execute = function(fps,options){
    function rotateX() {
        this.angle = (this.angle + (this.speed*fps));
        var z = Math.round(this.orbit.center.z + 
                    (this.orbit.radiusZ * Math.cos(Math.radians(this.angle)))),
            y = Math.round(this.orbit.center.y + 
                    (this.orbit.radiusY * Math.sin(Math.radians(this.angle)))),
            x = Math.round(this.orbit.center.x); 
        this.pig.position(x*this.fW,y*this.fH,z*this.fW);     
    }; 
    rotateX.call(this);
    if(!options.noFire) {
        this.fire.call(this,options);
    }    
};

var ZOrbit = function(pig) {
    Behavior.call(this,pig);
    this.orbit = factory.getOrbit("zOrbit");   
    this.name = "ZOrbit";
};
ZOrbit.prototype = Object.create(Behavior.prototype);
ZOrbit.prototype.execute = function(fps,options) {
    function rotateZ() {
        this.angle = (this.angle + (this.speed*fps));      
        var x = Math.round((this.orbit.center.x) + 
                    (this.orbit.radiusX  * Math.cos(Math.radians(this.angle)))),
            y = Math.round(this.orbit.center.y + 
                    (this.orbit.radiusY * Math.sin(Math.radians(this.angle)))),
            z = Math.round(this.orbit.center.z);     
                       
        this.pig.position(x*this.fW,y*this.fH,z*this.fH);       
    }; 
    rotateZ.call(this);
    if(!options.noFire) {
        this.fire.call(this,options);
    }     
};

function rotateY(pig) {
   return new YOrbit(pig); 
};
function rotateX(pig) {
   return new XOrbit(pig);  
};
function rotateZ(pig) {
   return new ZOrbit(pig);  
};
function dispose() {
    var container = document.querySelector("#space");
    container.removeEventListener("resizeend",resizeHandler);    
};
function resizeHandler(e) {
    height = e.detail.height;
    width  = e.detail.width;    
}
function init() {
    var container = document.querySelector("#space");
    height = window.innerHeight;
    width  = window.innerWidth;
    container.addEventListener("resizeend",resizeHandler);    
};
/*
(function(){
    var container = document.querySelector("#space");
    height = window.innerHeight;
    width  = window.innerWidth;
    container.addEventListener("resizeend",resizeHandler);
}());
*/

    return {
        init:init,
        rotateY:rotateY,
        rotateX:rotateX,
        rotateZ:rotateZ,
        dispose:dispose
    };
});


