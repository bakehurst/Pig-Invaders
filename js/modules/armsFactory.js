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
    "modules/arm"
], function (utils,arm) {
    var
    LOCALKEY    = "SPACEPIGS",
    arms = {
        missile:{
            className: "missile",
            selectType: "missileType",
            refreshTime:20000,
            width: 10,
            length:200,
            maxLength:300,
            explosion: {
                origin: {x:0,y:0},
                particles: 100,
                radius: 150,
                scaleMax:30,
                durationMax:2500,
                soundFile:"explosion1.mp3"
            },
            rotate:0,           
            speed: 5,
            strength:20,
            soundFile:"missile.mp3"          
        },
        laser:{        
            className: "laser",
            selectType: "laserType",
            refreshTime:15000,
            explosion: {
                origin: {x:0,y:0},
                particles: 50,
                radius: 100,
                scaleMax:30,
                durationMax:2500,
                soundFile:"explosion1.mp3"              
            },            
            width: 4,
            length:400,
            maxLength:400,
            rotate:0,            
            speed: 6,
            strength:12,
            soundFile:"laser.mp3"          
        },       
        gun:{
            className: "gun",
            selectType: "gunType",
            refreshTime:10000,
            explosion: {
                origin: {x:0,y:0},
                particles: 25,
                radius: 50,
                scaleMax:30,
                durationMax:2500,                
                soundFile:"explosion1.mp3"             
                
            },            
            width: 0,
            length:200,
            maxLength:250,
            rotate:0,             
            speed: 3,
            strength:6,
            soundFile:"gun.mp3"          
        },        
        blueray:{        
            className: "blueray",
            selectType: "bluerayType",
            refreshTime:10000,
            explosion: {
                origin: {x:0,y:0},
                particles: 25,
                radius: 50,
                scaleMax:30,
                durationMax:2500,
                soundFile:"explosion1.mp3"            
            },            
            width: 4,
            length:200,
            maxLength:250,
            rotate:0,
            radius:50,            
            speed: 4.5,
            strength:7, 
            soundFile:"blueray.mp3"           
        }         
    },
    playerParams = {
       spacePlayer: {
            className:["surround","gunsurround"],
            html:   '<div class="carriage playercarriage">'+
                        '<div  class="turret">'+
                            '<div class="barrel">'+
                            '</div>'+
                        '</div>'+
                        '<div class="percent">'+
                            '<div class="percentBar">'+
                            '</div>'+
                        '</div>' +                      
                    '</div>',
                    

            callback: "",
            menuBounds:"",
            force    : {
                max      : 48,
                increase : true,
                time     : 10000,
                value    : 1
            },
            explosion: {
                origin: {x:0,y:0},
                particles: 100,
                radius: 150,
                scaleMax:30,
                durationMax:2500,
                soundFile:"explosion2.mp3"
             
            },
            weapon      : {
                nofire  : false,
                fireRate : 500
            },
            keyboard: {
                moveLeft:"ArrowLeft",
                moveRight:"ArrowRight",
                rotateLeft:"a",
                rotateRight:"z",
                rotateCenter:"e",
                fire:"ArrowUp",
                changeArm:"Tab",
                dMove:15,
                dRotate:2
            },
            lang: "",
            scores: []
        },
       spacePigs:   { 
            className   :["surround","pigsurround"],
            html:'<div class="pig"></div><div class="carriage pigcarriage">'+
                        '<div class="turret pigturret"></div></div>'+
                        '<div class="pighelmet"></div>',
            pig         :0,
            numPigs     :5,
            weapon      : {
                type:"blueray",
                qty :1,
                noFire:false
            },
            force    : {
                max      : 24,
                increase : true,
                time     : 10000,
                value    : 1
            },
            explosion: {
                origin: {x:0,y:0},
                particles: 100,
                radius: 150,
                scaleMax:30,
                durationMax:2500,
                soundFile:"explosion2.mp3"              
            }             
        }
    },
    orbits = {
        yOrbit: {
            radiusX:550,
            radiusY:0,
            radiusZ:7000,
            speed:0.5,        
            center:{
                x:750,
                y:350,
                z:-5000
            },      
            firePos:{
                positions:[
                    {angle:150,rotation:-1},
                    {angle:270,rotation:-1}
                ],
                range:{
                    start:90,
                    end:280
                }               
            }
        },
        xOrbit: {
            radiusX:0,
            radiusY:300,
            radiusZ:3000,
            speed:0.7,           
            center:{x:250,y:450,z:-4000},           
            firePos:{
                positions:[
                    {angle:20,rotation:-1},
                    {angle:50,rotation:-1},
                    {angle:80,rotation:-1},
                    {angle:110,rotation:-1}                    
                ],
                range:{
                    start:10,
                    end:350
                }                
            }          

        },
        zOrbit: {
            radiusX:650,
            radiusY:120,
            radiusZ:0,
            speed:0.25,
            center:     {
                x:250,
                y:350,
                z:-8000
            },            
            firePos:    {
                positions:[
                    {angle:20,rotation:-1},
                    {angle:160,rotation:-1}
                ],
                range:{
                    start:10,
                    end:170
                }
            }                    
       }        
    };
   
    function settings(type,options) {
        if(type === undefined && options === undefined) {
            return arms;
        }
        var arm = arms[type];
        if(options !== undefined) {
            for(var prop in options) {
                arm[prop] = options[prop];
            }
        }
        return arm;
    };
    function selectTypes() {
        var obj = {};
        for(var prop in arms) {
            var arm = arms[prop];
            obj[arm.selectType] = {
                className:arm.className,
                selectType:arm.selectType,
                div:null,
                qtyDiv:null,
                index:null,
                qty:0,
                max:0,
                time:arm.refreshTime,
                timer:null
            };
        }
        return obj;
    };
    function addType(type,options) {
        arms[type] = options;
    };   
    function getArm(container,type,targets) {
         return arm.Arm(container,arms[type],targets);
    };
    function playerOptions(type) {
        if(type !== undefined) {
            return playerParams[type];
        }
        return playerParams;
    };
    function getOrbit(type) {
        return orbits[type];        
    };
    function soundFiles() {
        var arr = [];
        for(var a in arms) {
            var arm = arms[a];
            if(!arr.includes(arm.soundFile)) {
                arr.push(arm.soundFile);
            }
            if(!arr.includes(arm.explosion.soundFile)) {
               arr.push(arm.explosion.soundFile);
            }
        }
        for(var p in playerParams) {
            var player = playerParams[p];
            if(!arr.includes(player.explosion.soundFile)) {
               arr.push(player.explosion.soundFile);
            }            
        }
        return arr;
    };
    function lang(l) {
        if(l !== undefined) {
            playerParams.spacePlayer.lang = l;
            toLocal();
        }
        return playerParams.spacePlayer.lang;
    };
    function keyboard(keys) {
        if(keys !== undefined) {
           playerParams.spacePlayer.keyboard = keys;
           toLocal();
        }
        return playerParams.spacePlayer.keyboard;
    };
    function scores(sc) {
        if(sc !== undefined) {
            playerParams.spacePlayer.scores = sc;
            toLocal();
        }
        return playerParams.spacePlayer.scores;
    };
    function addScore(score) {
        var arr = scores();
        arr.push(score);
        arr.sort(function(a,b){
            if (a.elapse < b.elapse) {
                return -1;
            }
            if (a.elapse > b.elapse) {
                return 1;
            }
            return 0;           
        });
        arr.splice(10);
        scores(arr);
    };
    function fromLocal(local) {
        playerParams.spacePlayer.keyboard = local.keyboard;
        playerParams.spacePlayer.lang = local.lang;
        playerParams.spacePlayer.scores = local.scores;        
    }
    function toLocal() {
        var local = {};
        local["keyboard"] = playerParams.spacePlayer.keyboard;
        local["lang"] = playerParams.spacePlayer.lang;
        local["scores"] = playerParams.spacePlayer.scores;
        utils.localStorage(LOCALKEY,local);       
    };

    (function() {
        var local = utils.localStorage(LOCALKEY);
        if(local) {
            fromLocal(local);
        }
        else {
           toLocal();  
        }
    })();

    return {
        arm:getArm,
        settings:settings,
        selectTypes:selectTypes,
        addType:addType,
        playerOptions:playerOptions,
        getOrbit:getOrbit,
        soundFiles:soundFiles,
        lang:lang,
        keyboard:keyboard,
        scores:scores,
        addScore:addScore
    };
});


