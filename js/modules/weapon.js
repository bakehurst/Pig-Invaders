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
    "modules/armsFactory",
    "modules/particles",
    "modules/sounds"
], function (utils,factory,particles,sounds) {
    var weapon = function(container, surround){
        var bang        = particles.explosion(surround),
            turretDiv   = surround.querySelector(" .turret"),
            magasin     = {};   

        function origin() {
            var c = utils.getBounds(container);
            var s = utils.getBounds(surround);           
            var x = s.x - c.x + (s.width/2) - 5; // borders
            var y = s.y - c.y + (s.height/2) - 12;            
            return {x:x,y:y};
        };       
        
        var position = (function () {
            var pos = {x:0,y:0,z:0};
            return function(x,y,z) {
                if(x !== undefined || y !== undefined || z !== undefined) {
                   if(x !== undefined) {
                       pos.x = x;
                   }
                   if(y !== undefined) {
                       pos.y = y;                       
                   }
                   if(z !== undefined) {
                       pos.z = z;                       
                   }
                   surround.style.transform = "translate3d("+
                                         pos.x+"px, "+pos.y+"px, "+pos.z+"px )";
                }
                return pos;
            };
        })();
        
        var rotate = (function() {
            var ang = 0;
            return function(angle) {
                if(angle !== undefined) {
                    ang = angle;
                    turretDiv.style.transform = "rotate("+ang+"deg)";
                }
                return ang;
            };
        })();
        
        var select = (function() {
            var selected = null;
            return function(type) {
                if(type === undefined) return selected;
                if(magasin.hasOwnProperty(type)) {
                    selected = type;
                }
                return selected;
            };
        })();
        
        var strength = (function(){
            var carriage    = surround.querySelector(" .carriage"),
                percentBar  = carriage.querySelector(" .percentBar"),
                tints       = ["tint75","tint50","tint25","tint0"],
                tintIndex   = undefined,
                force       = 0,
                maxForce    = 0,
                options     = null,
                timer      = null,
                
                changeEvent = new CustomEvent("strength", {
                detail: {
                        type : "",
                        force: 0,
                        maxForce:0,
                        percent: 0
                    }
                });
            function changeTint(per) {
                if(percentBar) {
                    percentBar.style.width = per+"%";
                }
                function nextTint(index) {
                    if(tintIndex === index) return;
                    if(tintIndex !== undefined) {
                        utils.removeClass(carriage,tints[tintIndex]);
                    }
                    tintIndex = index;
                    utils.addClass(carriage,tints[index]); 
                    return per;
                }
                if(per > 75) {
                    if(tintIndex !== undefined) {
                        utils.removeClass(carriage,tints[tintIndex]);
                        tintIndex = undefined;
                    }
                    if(percentBar) {
                        percentBar.style.backgroundColor = "green";
                    }
                    return per;
                }
                else if(per > 50) {
                    if(percentBar) {
                        percentBar.style.backgroundColor = "darkorange";
                    }
                    return nextTint(0);
                }
                else if(per > 25) {
                    if(percentBar) {
                        percentBar.style.backgroundColor = "darkred";
                    }                    
                    return nextTint(1);
                }
                else if(per > 0) {
                     return nextTint(2);
                }
                else {
                   return nextTint(3); 
                }
                return per;
                
            };
            function fireEvent(newValue,type) {
                force = newValue;
                changeEvent.detail.percent = 
                        changeTint(Math.round(force/maxForce*100));
                changeEvent.detail.type = type;
                changeEvent.detail.force = newValue;
                changeEvent.detail.maxForce = maxForce;
                surround.dispatchEvent(changeEvent);
                if(force === maxForce){
                    timer.stop();
                }
                else {
                    timer.start(function(){
                        add(options.value);
                    });
                }
            };
            
            function set(value) {
                if(value) {
                  options = value;
                  force = value.max;
                  maxForce = value.max;
                  timer = new utils.Timer(options.time);
                }
                return options;
            };
            function get() {
                return force;
            };
            function reduce(value) {
                if(value && force) {
                    var newValue = force-value >= 0 ? force-value: 0;
                    fireEvent(newValue,"reduce");                   
                }
                return force;
            };
            function add(value) {
                if(value) {
                    var newValue = force+value <= 
                                            maxForce ? force+value: maxForce;                    
                    fireEvent(newValue,"add");            
                }
                return force;
            };
            function dispose() {
                timer.stop();
            };
            return {
                set:set,
                get:get,
                add:add,
                reduce:reduce,
                dispose:dispose
            };

        }());
        
        function addEventListener(name,func) {
            surround.addEventListener(name,func,false);
        };
        function removeEventListener(name,func) {
            surround.removeEventListener(name,func,false);          
        }
        
        function fire(callback) {
            if(magasin === null) return;           
            var type = select();
            if(!type) return;            
            var weapons = magasin[type];
            var arm = weapons.pop();           
            if(arm) {                
                arm.rotate(rotate());
                select(type);
                arm.fire(origin());
                 if(typeof callback ===  "function") {
                    callback(arm);
                }               
            }
        };
        function loadArm(type,qty,targets) {
            var arm;
            if(magasin.hasOwnProperty(type)) {
               arm = magasin[type]; 
            }
            else {
                arm = [];
                magasin[type] = arm;
            }
            for(var i = 0; i < qty; i++) {
                if(targets !== undefined) {
                    arm.push(factory.arm(container,type,targets));
                }              
            }
        };
        function magasinDispose() {
            for(var type in magasin)  {
               var arms = magasin[type];
               arms.forEach(function(arm){
                   arm.dispose();
               });
            }
            magasin = {};
        };
        function fade() {
            utils.addClass(surround,"fadeout");
        };        
        
        function explode(options,callback) {
            var rect = bounds();
            options.origin.x = rect.width/2;
            options.origin.y = rect.height/2;
            sounds.play(options.soundFile);
            bang.explode(options,function(){
                if(typeof callback === "function") {
                    callback();
                }  
            });            
        };
        function bounds() {
            return utils.getBounds(surround);
        };
        function add() {
            if(!container.contains(surround)) {
                container.appendChild(surround); 
            }            
        };
        function remove() {
            if(container.contains(surround)) {
                container.removeChild(surround); 
            }               
        };
        function dispose() {
            magasinDispose();
            strength.dispose();
            remove();
            surround.html = "";            
        };

        return {
          position:position,
          rotate:rotate,
          select:select,          
          fire:fire,
          loadArm:loadArm,
          bounds:bounds,
          add:add,
          dispose:dispose,
          explode:explode,
          fade:fade,
          origin:origin,
          strength:strength,
          addEventListener:addEventListener,
          removeEventListener:removeEventListener
        };
        
        
    };
    return {
        weapon:weapon
    };
});


