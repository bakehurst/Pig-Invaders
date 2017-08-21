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
    'modules/utilities',
    'modules/armsFactory',
    'modules/player'
], function (utils,factory,playerMod) {
    var container       = undefined,
        gameEndEvent    = undefined,
        player          = undefined,
        types           = factory.selectTypes(),
        options         = factory.playerOptions("spacePlayer");        
    
    var selector = (function() {
        var div         = undefined,
            arms        = undefined,
            targets     = undefined,
            selected    = undefined,
            selectClass = "armSelected";
            
        function selectHandler(e) {
           e.stopPropagation();
           changeSelected(this); 
        };
        function changeSelected(div) {
            utils.removeClass(selected.div,selectClass);
            utils.addClass(div,selectClass);
            select(div);            
        };
        function select(div) {
            var selectType = div.querySelector(" .armType div").className;
            var type = types[selectType];
            selected = type;
            player.select(type.className);
        };
        function addReduceWeapon(type,qty) {            
            type.qty += qty;
            type.qty = type.qty > 0 ? type.qty: 0;
            type.qty = type.qty < type.max ? type.qty: type.max;
            type.qtyDiv.textContent = type.qty;
            if(type.qty === 0) {
                if(checkWeapons()){
                    utils.addClass(type.qtyDiv,"qtyflash");
                    type.timer.start(function(){
                        addReduceWeapon(type,1);
                        player.load(type.className,1,targets);  
                    });
                }                
            }
            else {
               utils.removeClass(type.qtyDiv,"qtyflash");  
            }
            if(type.qty === type.max) {
                type.timer.stop();
            }            
        };
        function weaponFired() {
            addReduceWeapon(selected,-1);
        };
        function checkWeapons() {
            var finished = 0;
            for(var type in types) {
               finished += types[type].qty; 
            }
            if(finished === 0) {
                player.strength.reduce(options.force.max);
            }
            return finished;
        };      
        function keyUpHandler(e) {
            if(e.key === options.keyboard.changeArm) {
                e.preventDefault();
                var index = types[selected.selectType].index+1;
                if(index === arms.length) {
                    index = 0;
                }
                changeSelected(arms[index]);;
            }
        };
        function init(targs) {
            targets = targs;
            document.addEventListener("keyup",keyUpHandler,false);            
            div  = container.querySelector(" .selector");
            arms = [].slice.call(div.querySelectorAll(" .selectArm"));
            arms.forEach(function(arm,index){
                arm.addEventListener("mousedown",selectHandler,false);
                arm.addEventListener("touchstart",selectHandler,false);
                var type = arm.querySelector(" .armType div").className;
                var qtyDiv = arm.querySelector(" .armQty");
                utils.removeClass(qtyDiv,"qtyflash");                
                var qty = parseInt(qtyDiv.getAttribute("data-max"));
                qtyDiv.textContent = qty;
                types[type]["div"] = arm;
                types[type]["qtyDiv"] = qtyDiv;
                types[type]["index"] = index;
                types[type]["qty"] = qty;
                types[type]["max"] = qty;
                types[type]["timer"] = new utils.Timer(types[type]["time"]);               
                player.load(types[type].className,qty,targets);                
            });
            if(selected) {
                changeSelected(arms[0]);
            }
            else {
                select(arms[0]);
            }
            for(var prop in types) {
               var type = types[prop];
               if(type.index === null) {
                   delete types[prop];
               }
           }
        };
        function bounds() {
            return utils.getBounds(div);
        };
        function dispose() {
            document.removeEventListener("keyup",keyUpHandler,false);
            player.dispose();
            arms.forEach(function(arm){
               arm.removeEventListener("click",clickHandler,false); 
            });
            for(var type in types) {
                types[type].timer.stop();
            }
        };
       
        return {
            init:init,
            weaponFired:weaponFired,
            bounds:bounds,
            dispose:dispose
        };
        
    })();

    options.callback = selector.weaponFired;
    options.menuBounds = selector.bounds;

    function strengthHandler(e) {        
        if(e.detail.force === 0){
            var that = this;
            this.fade();
            this.explode(options.explosion,function(){
                gameEndEvent.detail.winner = "pigs";
                gameEndEvent.detail.end = Date.now();
                container.dispatchEvent(gameEndEvent);
                that.dispose();
            });
        }        
    };
    function gameEndHandler(e) {
        options.weapon.nofire = true;
        player.removeEventListener("strength",strengthHandler.bind(player));       
        container.removeEventListener("gameend",gameEndHandler);
        selector.dispose();       
    };
    
    function getPlayer()  {
        return player;
    };
    
    function init(space,event) {
        container       = space;
        gameEndEvent    = event;
        options.weapon.nofire = false;
        player          = playerMod.player(container,options);
        player.addEventListener("strength",strengthHandler.bind(player));
        container.addEventListener("gameend",gameEndHandler);
        return player;
    };
    return {
        init:init,
        selectorInit:selector.init,
        getPlayer:getPlayer
    };
});


