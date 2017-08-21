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
    "modules/utilities"
], function (utils) {
    var pool = (function(){
        var elements = [];
        
        function put(el) {
            el.setAttribute("style","");
            elements.push(el);
        };
        function get() {
            if(elements.length > 0) {
                return elements.pop();
            }
            put(document.createElement('div'));
            return get();
        };
        function clear() {
            elements = [];
        }
        return {
           put:put,
           get:get,
           clear:clear
        };       
    })();
    
     function explosion(container) {
        var div = document.createElement("div");

        var settings = {
            className: "particle",
            origin: {x:0,y:0},
            particles: 100,
            radius: 100,
            scaleMax:30,
            durationMax:2500
        };
        
        function explode(options,callback) {
            var count = settings.particles;
            container.appendChild(div);
            function transEnd() {
               if(this && div && div.contains(this)) {
                   this.removeEventListener("transitionend",transEnd);
                    pool.put(this);
                    div.removeChild(this);
                    count --;
               }
               if(count < 1) {
                    if(container && div && container.contains(div)) {
                        container.removeChild(div); 
                        div.innerHTML = "";
                        if(typeof callback === "function"){
                            callback();
                        }
                    }
                }                
            };

            for(var prop in options) {
               if(settings.hasOwnProperty(prop)) {
                   settings[prop] = options[prop];
               } 
            };
            for(var i = 0; i < settings.particles; i++) {
                var particle = pool.get();
                utils.addClass(particle,settings.className);
                particle.style.transform = 
                        "translate("+ settings.origin.x+"px, "+
                                      settings.origin.y+"px)";                                                           
                div.appendChild(particle);
                particle.offsetHeight; //slow things, let browser compute style
                var pos = {
                  x: utils.getRandomInt(-settings.radius,settings.radius),
                  y: utils.getRandomInt(-settings.radius,settings.radius),
                  z: utils.getRandomInt(-settings.radius,settings.radius),
                  s: utils.getRandomInt(
                                    settings.scaleMax/10,settings.scaleMax)/10
                };
                var duration = utils.getRandomInt(
                                settings.durationMax/10,settings.durationMax);
                particle.style.animation = "yellowRed linear "+duration/3+"ms";
                particle.style.transitionDuration =  duration+"ms";
                particle.style.transform = "translate3d("+ 
                     pos.x +"px,"+ pos.y +"px,"+ pos.z +"px) scale("+pos.s+")";        
                particle.style.backgroundColor = "red";
                particle.style.opacity = 0.2;
                particle.addEventListener('transitionend',transEnd);
            };                               
        };
        function stop() {
            div.innerHTML = "";
            try{
               container.removeChild(div);               
            }catch(e){};
        };
        return {
            explode:explode,
            stop:stop           
        };
    };   

    return {
        explosion:explosion,
        dispose:pool.clear
    };
});


