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
    "modules/pig",
    "modules/behaviors",
    "modules/armsFactory"
], function (piggy,behaviors,factory) {
    var options         =   factory.playerOptions("spacePigs"),
        pigs            =   [],
        container       =   undefined,
        clock           =   undefined,
        gameEndEvent    =   undefined;
        
    var stopwatch = (function(){
        var begin       = 0,
            end         = 0,
            time        = 0,
            separator   = ":";
            function start() {
                if(begin === 0) {
                    begin = Date.now();
                }
                return begin;
            };
            function stop() {
                if(end === 0) {
                    end = Date.now();
                }
                return end;
            };
            function elapse() {
                if(begin === 0) {
                    time = 0;
                }
                else if(end !== 0) {
                    time = end - begin;
                }
                else {
                    time = Date.now() - begin;
                }
                return time;                
            };
            function toString() {
                var ms    = elapse();
                var mins  = Math.floor((ms % 3600000) / 60000);
                var secs  = Math.floor(((ms % 360000) % 60000) / 1000);
                var cents = Math.floor((((ms % 360000) % 60000)%1000) / 10);
                return mins.toString().padLeft(2,"0")+separator+
                       secs.toString().padLeft(2,"0")+separator+
                       cents.toString().padLeft(2,"0");
            };
            function reset() {
                begin   = 0;
                end  = 0;
                time    = 0;                
            };
            return {
                start:start,
                stop:stop,
                elapse:elapse,
                toString:toString,
                reset:reset
            };
   
    }());
    
    function gameTime() {
        clock.textContent = stopwatch.toString();
        gameEndEvent.detail.elapse = stopwatch.elapse();
        gameEndEvent.detail.time = stopwatch.toString();
    };
    
    function flyPigs(fps) {
        fps = fps !== undefined ? 60/fps : 1;        
        pigs.forEach(function(pig) {
            pig.behavior().execute(fps,options.weapon);
        });        
    };    
    function changeBehaviour(behavior){
        if(behavior.name === this.behavior().name)
            return;
        behavior.angle = this.behavior().angle;
        this.behavior(behavior);         
    };
    function strengthHandler(e) {       
       if(e.detail.force === 0) {
            var that = this;
            pigs.remove(this);
            this.fade();
            this.explode(options.explosion,function(){
               that.dispose();
                if(pigs.length === 0) {
                    gameEndEvent.detail.winner = "player";
                    container.dispatchEvent(gameEndEvent);
                }               
            });
       }
       else {
           var per = e.detail.percent;
           var behavior;
             if(per > 75) {
                changeBehaviour.call(this,behaviors.rotateY(this));
                this.behavior().speed =  0.5;
                return;
            }
            else if(per > 50) {
                if(this.behavior().speed >= 0.25) {
                    this.behavior().speed =  0.25;
                }
                return;
            }
            else if(per >= 25) {
                return changeBehaviour.call(this,behaviors.rotateZ(this));
            }
            else if(per < 25){
                return changeBehaviour.call(this,behaviors.rotateX(this));
            }        
        }
    };    
    function loadPigs(players) {
        options.weapon.noFire = false;       
        for(var i = 0; i < options.numPigs; i++) {           
            options.pig = (i % 5);
            var pig = piggy.pig(container,options);
            pig.players(players);
            pig.load(options.weapon.type,options.weapon.qty);            
            pig.select(options.weapon.type);            
            var yorbit = behaviors.rotateY(pig);
            var radius = ((i%5)*100) < 500 ? ((i%5)*100) : 0;
            yorbit.radiusX = yorbit.radiusX + radius;            
            yorbit.angle = yorbit.angle + (i*360/options.numPigs);
            pig.behavior(yorbit);           
            pig.addEventListener("strength",strengthHandler.bind(pig));
            pigs[i] = pig;
            pig.add();           
        }
    };
    function getPigs() {
        return pigs;
    };

    var animation = (function() {
        var requestID  =  null;
        
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

        var pause = (function() {
            var paused = false;
            return function(p) {
                if(p !== undefined) {
                    paused = p;
                    //options.weapon.noFire = paused;
                }
                return paused;
            };
        })();
       
        function animate(time) {
            fps(time);
            if(!pause()) {
                gameTime();
                flyPigs(fps());
            }
            requestID =  window.requestAnimationFrame(animate);            
        };
        function start() {
            if(requestID === null) {
               gameEndEvent.detail.start = stopwatch.start();
               animate();  
            }
        };
        function stop() {
            if(requestID !== null) {
                window.cancelAnimationFrame(requestID);
                requestID = null; 
            }
        };
        return {
            start:start,
            stop:stop,
            pause:pause
        };
        
    })();
    
    function pauseAnim() {
        animation.pause(true);
    }
    function unpauseAnim() {
        animation.pause(false);
    };
    /*
    function gameStartHandler() {
        animation.start();
    };
    */
    function gameEndHandler(e) { 
        stopwatch.stop();
        options.weapon.noFire = true;
        animation.stop();       
        dispose();        
    };
    function resizeEvents() {
        container.addEventListener("resizestart",pauseAnim);
        container.addEventListener("resizeend",unpauseAnim);       
    };
    
    function gameEvents() {
        container.addEventListener("gameend",gameEndHandler);
    };
    
    function dispose() {
        behaviors.dispose(); 
        container.removeEventListener("resizestart",pauseAnim);
        container.removeEventListener("resizeend",unpauseAnim);
        container.removeEventListener("gameend",gameEndHandler);
        pigs.forEach(function(pig){
            pig.dispose();
        });
        pigs = [];
    };
    
    function init(space,players,event) {
        container = space;
        clock = container.querySelector(" .gameTime");
        behaviors.init();
        gameEndEvent = event;
        loadPigs(players);
        resizeEvents();
        gameEvents();
        stopwatch.reset();
        animation.start();        
        //options.weapon.noFire = true; // for testing only
    };

    return {
        init:init,
        dispose:dispose,
        getPigs:getPigs        
    };
});


