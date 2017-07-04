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
        
var player = function(space,options) {
    var div          = null, 
        container    = null,
        weapon       = null,
        mousePoint   = null,
        fireCallback = null,
        menuBounds   = null;

    var debounceFire = utils.debounce(function(){
            weapon.fire(fireCallback);
    },options.weapon.fireRate,true);
                 
    function move(x) {
       var cbounds  = utils.getBounds(container),
           wbounds  = weapon.bounds(),
           y        = cbounds.height - wbounds.height,
           right    = cbounds.width - wbounds.width-4; //4 for borders
        x = x > 0 ? x : 0;
        x = x < right ? x : right;
        weapon.position(x,y,0); 
    };
    function moveBy(dx) {
        move(weapon.position().x + dx);
    };
    function rotate(x,y) {
        var origin = weapon.origin();
        var cont    = utils.getBounds(container);
        var height  = origin.y + cont.y - y + 5; //armbase height/2
        var width = origin.x + cont.x - x + 5;   //armbase width/2    
        var angle = Math.degrees(Math.atan2(height,width))-90;
        weapon.rotate(angle);        
    };
    function mouseDown(e) {     
        var p = {x:e.clientX,y:e.clientY};
        var r = menuBounds();
        if(utils.pointInRect(p,r)) {
            mousePoint = null;
            return;
        }
        r = weapon.bounds();
        if(utils.pointInRect(p,r)) {
            mousePoint = {target:"weapon",x:p.x,y:p.y};
            return;
        }
        mousePoint = {target:"container",x:p.x,y:p.y};
        rotate(p.x,p.y);
    };
    function mouseUp() {
        if(mousePoint && mousePoint.target === "container" && 
                weapon.strength.get() > 0 && !options.weapon.nofire) {
            debounceFire();           
        }
        mousePoint = null;               
    };
    function mouseMove(e) {
        if(mousePoint) {
            if(mousePoint.target === "container") {
               rotate(e.clientX,e.clientY); 
            }
            else if(mousePoint.target === "weapon") {
               moveBy(e.clientX - mousePoint.x);
               mousePoint.x = e.clientX;
               mousePoint.y = e.clientY;
            }
        }
    };
    function touchStart(e) { 
        //e.preventDefault();
        if(e.targetTouches.length === 1){
            mouseDown(e.targetTouches[0]);
        }        
    };
    function touchEnd() {
        mouseUp();
    };
    function touchMove(e) {
        //e.preventDefault();
        if(e.targetTouches.length > 0){
            mouseMove(e.targetTouches[0]);
        }       
    };
    function keyDown(e) {
        var keys = options.keyboard;
        function keyMove(dx) {
            e.preventDefault();
            moveBy(dx);            
        };
        function keyRotate(dr) {
            e.preventDefault();
            var rotate = weapon.rotate()+dr;
            if(rotate > -90 && rotate < 90 ) {
                weapon.rotate(rotate);
            }
        };
        switch(e.key) {
            case keys.moveLeft:
                keyMove(-keys.dMove);
                break;
            case keys.moveRight:
                keyMove(keys.dMove);                
                break;
            case keys.fire:
                e.preventDefault();
                if(weapon.strength.get() > 0) {
                    weapon.fire(fireCallback);
                }
                break;
            case keys.rotateLeft:
                keyRotate(-keys.dRotate);
                break;
            case keys.rotateRight:
                keyRotate(keys.dRotate);                
                break;
            case keys.rotateCenter:
                 weapon.rotate(0); 
                break;
            case keys.changeArm:
                 e.preventDefault();
                break;         
        }
    }; 
    function initPosition() {
        var  cbounds     =  utils.getBounds(container),
             wbounds     =  weapon.bounds();
        move(cbounds.width/2 - wbounds.width/2);        
    };    
    function initMouse() {
       container.addEventListener("mousedown",mouseDown,false);
       container.addEventListener("mouseup",mouseUp,false);
       container.addEventListener("mousemove",mouseMove,false);        
    };
    function initTouch() {
       container.addEventListener("touchstart",touchStart,false);
       container.addEventListener("touchend",touchEnd,false);
       container.addEventListener("touchmove",touchMove,false);         
    }
    function initKey() {
        document.addEventListener("keydown",keyDown,false);
        document.addEventListener("keyup",mouseUp,false);        
    };

    function resizeEvent() {
        container.addEventListener("resizeend",initPosition);
    }
    function removeEventListeners() {
       container.removeEventListener("mousedown",mouseDown,false);
       container.removeEventListener("mouseup",mouseUp,false);
       container.removeEventListener("mousemove",mouseMove,false);
       container.removeEventListener("touchstart",touchStart,false);
       container.removeEventListener("touchend",touchEnd,false);
       container.removeEventListener("touchmove",touchMove,false);
       document.removeEventListener("keydown",keyDown,false);
       document.removeEventListener("keyup",mouseUp,false);
       container.removeEventListener("resizeend",initPosition);
    };

    function dispose() {
        removeEventListeners();
        weapon.dispose();       
    };
    (function () {
        fireCallback = options.callback;
        menuBounds   = options.menuBounds;
        container = space;
        div = document.createElement("div");            
        div.innerHTML = options.html;
        utils.addClass(div,options.className);
        weapon = arms.weapon(container,div);
        weapon.add();
        weapon.strength.set(options.force);  
        initPosition();
        initMouse();
        initTouch();
        initKey();
        resizeEvent();
    })(); 
    
    return {
        dispose:dispose,        
        fade:weapon.fade,
        bounds:weapon.bounds,
        origin:weapon.origin,
        explode:weapon.explode,
        select:weapon.select,
        load:weapon.loadArm,
        strength:weapon.strength,
        addEventListener:weapon.addEventListener,
        removeEventListener:weapon.removeEventListener        
    };
};
    return {
        player:player
    };
});


