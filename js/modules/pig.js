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
    "modules/weapon"
], function (utils,arms) {
    
    var pig = function(space, options) {
        var div         =   null,
            pig         =   null,
            container   =   null,
            weapon      =   null;

        var behavior = (function() {
            var func;
            return function(f) {
                if(f !== undefined) {
                    func = f;                    
                }
                return func;
 
            };           
        })();        
        var players = (function() {
            var pls = undefined;
            return function (ps) {
                if(ps !== undefined) {
                    pls = ps;
                }
                return pls;
            };
        })();
        
        var pigNum = (function() {
            var value;
            return function(num) {
                if(num > -1 && num < 5) {
                   value = num;
                   pig.style.backgroundPositionX = (value*25)+"%";
                }
                return value;
            };
        })();
        
        function getPlayer() {
            var plays = players();
            if(plays.length > 1) {
               var num = utils.getRandomInt(0,plays.length-1);
               return plays[num];
            }
            else {
                return plays[0];
            }
        };
            
        function aim() {
            var wo = weapon.origin();
            var po = getPlayer().origin();
            var height = wo.y  - po.y + 5;
            var width  = wo.x  - po.x + 5;
            var angle = Math.degrees(Math.atan2(height,width))-90;
            weapon.rotate(angle);                       
        };
        function load(type, qty) {
            weapon.loadArm(type,qty,players());
        };
        function resize() {
            
        };
        function dispose() {
            behavior(null);
            weapon.dispose();
        };

        (function () {
           container = space;
           div = document.createElement("div");            
           div.innerHTML = options.html;         
           utils.addClass(div,options.className);
           pig = div.querySelector(" .pig");
           pigNum(options.pig);
           weapon = arms.weapon(container,div);
           weapon.strength.set(options.force);           
        })();           

        return {
            players:players,
            pigNum:pigNum,
            load:load,            
            behavior:behavior,
            aim:aim,
            resize:resize,
            dispose:dispose,             
            add:weapon.add,          
            bounds:weapon.bounds,
            explode:weapon.explode,
            fade:weapon.fade,
            rotate:weapon.rotate,
            fire:weapon.fire,
            position:weapon.position,          
            select:weapon.select,
            strength:weapon.strength,
            addEventListener:weapon.addEventListener,
            removeEventListener:weapon.removeEventListener           
        };        
        
    };
    return {
        pig:pig
    };
});

