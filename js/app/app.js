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
    'modules/spacePlayer',
    'modules/spacePigs',
    'modules/spaceMenu'
], function (utils,spacePlayer,spacePigs,menu) {
    
    var container = undefined,
        chapter1Container       = undefined,
        quitButton      = undefined,
        gameStartEvent  = new CustomEvent("gamestart",{
                                    detail: {
                                        chapter:0
                                    }       
                                                        }),
        gameEndEvent    = new CustomEvent("gameend",{
                                    detail: {
                                        chapter:0,
                                        winner:"",
                                        elapse:0,
                                        time:0
                                    }
                                                        }),
        gameEvents      = {
            start:  gameStartEvent,
            end:    gameEndEvent
                                                         },
        changeEventStart = new CustomEvent("resizestart", {
            detail: {
                    width: 0,
                    height:0
                }
                                                        }),
        changeEventEnd = new CustomEvent("resizeend", {
            detail: {
                    width: 0,
                    height:0
                }
                                                        }),
        orientationEvent = new CustomEvent("orientation", {
            detail: {
                    mode: 0
                }
                                                        }),
        resizeStart = utils.debounce(function(){
            changeEventStart.detail.width = window.innerWidth;
            changeEventStart.detail.height = window.innerHeight;
            chapter1Container.dispatchEvent(changeEventStart);
        },250,true),        
        resizeEnd = utils.debounce(function(){
            var w = window.innerWidth, h =  window.innerHeight;
            changeEventEnd.detail.width = w;
            changeEventEnd.detail.height = h;
            containerSize(w,h);
            if(h < w) {  
                orientationEvent.detail.mode = "landscape";
                chapter1Container.dispatchEvent(changeEventEnd);
                chapter1Container.dispatchEvent(orientationEvent);                
            }
            else {
                orientationEvent.detail.mode = "portrait";
                chapter1Container.dispatchEvent(orientationEvent);                
            }
        },250);              
   
    function events() {
        window.addEventListener("resize",resizeStart);
        window.addEventListener("resize",resizeEnd);      
    };
    function orientation() {
        var w = window.innerWidth, h =  window.innerHeight;
        changeEventStart.detail.width = w;
        changeEventStart.detail.height = h;        
        if(h > w) {
            chapter1Container.dispatchEvent(changeEventStart);
            orientationEvent.detail.mode = "portrait";
            chapter1Container.dispatchEvent(orientationEvent);      
        }     
    }

    function startGame(e) {        
       events();
       quitButton.addEventListener("click",quitGame);     
       switch(e.detail.chapter) {
           case 1:startChapter1();
                break;
           case 2:startChapter2();
                break;
           case 3:startChapter3();
                break;                
           default:startChapter1();
               break;
       }
       orientation();
    };
    function startChapter1() {
        gameEvents.end.detail = {
            chapter:1,
            winner:"",
            elapse:0,
            time:0           
        };
        var player = spacePlayer.init(chapter1Container,gameEndEvent);
        spacePigs.init(chapter1Container,[player],gameEndEvent);   
        spacePlayer.selectorInit(spacePigs.getPigs());         
    };
    function startChapter2() {
        //ToDo Write this chapter
    };
    function startChapter3() {
         //ToDo Write this chapter       
    };
    function quitGame(e) {
        e.stopPropagation();
        gameEvents.end.detail.winner = "abandon";
        chapter1Container.dispatchEvent(gameEvents.end);
    };
    function endGame(e) {
        window.removeEventListener("resize",resizeStart);
        window.removeEventListener("resize",resizeEnd);
        quitButton.removeEventListener("click",quitGame);     
    };
    function containerSize(w,h) {
        container.style.width = w+"px";
        container.style.height = h+"px";       
    }

    function init(doc) {
        container = doc.querySelector("#container");
        chapter1Container = doc.querySelector("#space");
        quitButton = chapter1Container.querySelector(" .quitButton");
        chapter1Container.addEventListener("gamestart",startGame,false);
        chapter1Container.addEventListener("gameend",  endGame,false);
        utils.fullScreenChange(function(){
                utils.orientation("landscape");
                chapter1Container.dispatchEvent(changeEventEnd);
        }); 
        containerSize(window.innerWidth,window.innerHeight);
        menu.init(chapter1Container,gameEvents);
    };
    return {
       init:init 
    };
});


