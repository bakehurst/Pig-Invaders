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
    "modules/particles",
    "modules/sounds"
], function (utils,particles,sounds) {
    
   var Arm = function(container,options,targets) {
        var 
            requestID   = null,
            paused      = false,
            height      = 700,
            fh          = 700,
            rect        = {x:0,y:0,width:0,height:0},
            div         = document.createElement("div"),
            base        = document.createElement("div"),
            hitDiv      = document.createElement("div"),
            bang        = particles.explosion(hitDiv),
            settings    = {
                className: "laser",
                explosion: {
                    origin: {x:0,y:0},
                    particles: 50,
                    radius: 100,
                    scaleMax:30,
                    durationMax:2500,
                    soundFile:""                    
                },                 
                width: 4,
                length:false,
                maxLength:false,
                rotate:0,            
                speed: 3,
                soundFile:"",               
                behavior:function(rect,grow,fps){
                    var fH = height/fh;
                    if(grow()) {
                        rect.height += (this.speed * fps/60 * fH);
                        if(rect.height > (this.maxLength * fH)) {
                            grow(false);
                        }
                    }
                    else {
                        if(rect.height > (this.length * fH)){
                            rect.height -= (this.speed * fps/60 * fH); 
                        }
                    }                                     
                }  
            };            
          
        function end() {
            dispose();
            if(container.contains(base)) {
                container.removeChild(base);
                base.innerHTML = "";
            }
        };
        function dispose() {
            container.removeEventListener("resizestart",pause);
            container.removeEventListener("resizeend",unpause);
            container.removeEventListener("gameend",stop);            
        };
        function stop() {
           window.cancelAnimationFrame(requestID);
           requestID = null;
           bang.stop();           
           end();
        };
        function hit(rect,target) {           
            if(requestID === null) return;
            target.strength.reduce(options.strength);
            window.cancelAnimationFrame(requestID);
            requestID = null;  
            div.style.opacity = 0;
            var expl = options.explosion; 
            sounds.play(expl.soundFile);            
            expl.origin = {x:rect.width/2,y:rect.height/2};
            bang.explode(expl,function(){
                end();
            });           
        };
        function fire(origin) { 
            if(paused) return;
            if(requestID === null) { 
                events();
                base.style.transform = "translate("+origin.x+"px,"+
                        origin.y+"px) rotate("+rotate()+"deg)";
                container.appendChild(base);
                div.style.transitionDuration = 
                        settings.explosion.durationMax+"ms";
                sounds.play(settings.soundFile);
                animate();
            }                     
        };
        function bounds() {
            return utils.getBounds(hitDiv);
        };
        function extend(fps) {
            fps = fps !== undefined ? fps : 60;           
            rect.y -= settings.speed;
            settings.behavior(rect,grow,fps);
            div.style.top = rect.y+"px";
            div.style.height = rect.height+"px";           
        };
        
        var fps = (function() {
            var last = 0;
            var frpersec = 60;
            return function(latest) {
                if(latest !== undefined) {
                   var fps = Math.round(1000 / (latest - last));
                   if(fps > 1) {
                        last = latest;
                        frpersec = fps;
                    }
                }
                return frpersec;
            };
        })();         

        function animate(time) {
            fps(time);
            if(!paused) {
                var b = bounds();
                var c = utils.getBounds(container);
                var t;
                extend(fps());
                if(targets) {
                    for(var i = 0; i < targets.length; i++) {
                         var tar = targets[i];
                         t = tar.bounds();
                         if(utils.intersectRect(b, t)){
                            return hit(b,tar);
                        }                                       
                    }
                }
                if(!utils.intersectRect(b,c)) {                  
                   return stop();
                }             
            }
            requestID =  window.requestAnimationFrame(animate);
        };
        function rotate(r) {
            if(r !== undefined) {
                settings.rotate = r;
            }
            return settings.rotate;
        };
        
        var grow = (function() {
           var growing = true;
           return function(g) {
               if(g !== undefined) {
                   growing = g;
               }
               return growing;
           };
        })();
        
        function pause() {
            paused = true;
        };
        function unpause(e) {
            paused = false;
            height = e.detail.height;
        };
    
        function events() {
            height = window.innerHeight;
            container.addEventListener("resizestart",pause);
            container.addEventListener("resizeend",unpause);
            container.addEventListener("gameend",stop);
        };

        (function(options) {
            for(var prop in options) {
               if(settings.hasOwnProperty(prop)) {
                   settings[prop] = options[prop];
               } 
            };
            utils.addClass(div,"arm");
            utils.addClass(div,settings.className);
            div.style.width = settings.width+"px";
            div.style.height = settings.width+"px";
            div.style.opacity = 1;           
            utils.addClass(hitDiv,"hit");
            utils.addClass(base,"armbase");
            div.appendChild(hitDiv);
            base.appendChild(div);           
            //events();
        })(options);
        
              
        return {
            fire:fire,
            rotate:rotate,
            bounds:bounds,
            dispose:dispose
        };              
    };
    return {
        Arm:Arm
    };
});


