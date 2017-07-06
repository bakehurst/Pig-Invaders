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
    "modules/sounds"
], function (utils,factory,sounds) {
    var AVLANGS         = ["EN","FR"],
        doc             = undefined,
        container       = undefined,
        gameContainer   = undefined,
        gameEvents      = undefined,
        menuDiv         = undefined,
        menu            = undefined,
        principal       = undefined,
        scores          = undefined;
    
    var toggleMenu = (function() {
        var hidden = false;
        return function(hide) {
            if(hide !== undefined) {
                hidden = hide;              
                if(hidden === true) {
                    menuDiv.style.display = "none";
                    //gameContainer.style.visibility = "visible";
                    gameContainer.style.display = "block";
                    document.documentElement.focus();
                }
                else {
                    menuDiv.style.display = "flex";
                    //gameContainer.style.visibility = "hidden"; 
                    gameContainer.style.display = "none";                      
                }
            }
            return hidden;
        };
    })();
    
    var selectSubMenu = (function() {
        var selected = undefined;
        return function(select) {
            if(select !== undefined) {
                if(selected !== undefined) {
                    utils.removeClass(selected,"menuShow");
                }
                selected = select;
                utils.addClass(selected,"menuShow");
            }
            return selected;
        };
    })();
    
    function startHandler() {
        toggleMenu(true);
        gameEvents.start.detail.chapter = 1; // from Local when more chapters
        gameEvents.end.detail.chapter = 1;        
        gameContainer.dispatchEvent(gameEvents.start);
    }; 
    function closeHandler() {
        selectSubMenu(principal);
    };
    function subMenuHandler() {
        selectSubMenu(this);
    };
    function selectLang(lang) {
        if(lang === undefined) {
            if(factory.lang() === "") {
                lang = navigator.language.substring(0,2).toUpperCase();
            }
            else {
                lang = factory.lang();
            }
        }
        else if(AVLANGS.includes(lang)) {
            factory.lang(lang);
        }
        if(!AVLANGS.includes(lang)) {
            lang = "EN"; 
        } 
        menu.src = "frames/"+lang+"/menuFrame.html";         
    }; 
    function handleSelectLang() {
        selectLang((this.options[this.selectedIndex]).value);
    };
    function principalMenu(prince) {
        function handleSoundSelect() {
            sounds.mute(factory,!this.checked);
        };
        function handleFullScreen() {
            utils.fullScreen();            
        };
        principal = prince;
        selectSubMenu(principal);
        principal.querySelector(" .startButton").addEventListener(
                                                        "click",startHandler);
        principal.querySelector(" .selectLang").addEventListener(
                                                "change",handleSelectLang);
   
        principal.querySelector("#soundButton input").addEventListener(
                "change",handleSoundSelect);
        principal.querySelector(" .fullscreen").addEventListener(
                                                    "click",handleFullScreen);
                                            
        
    };    
    function infoMenu(information) {
        information.querySelector(" .closeButton").addEventListener(
                                                        "click",closeHandler);
        principal.querySelector("#informationButton").addEventListener(
                                     "click",subMenuHandler.bind(information));                            
    };   
    function winLoseMenu(winner,loser) {
        var winnerName = winner.querySelector("input[name=player]");
        var winnerTime = "";
        var winnerElapse = 0;
        function gameEndHandler(e) {
           if(e.detail.winner === "player") {
               winnerTime = e.detail.time;
               winnerElapse = e.detail.elapse;
               winnerName.value = "";
               selectSubMenu(winner);
           }
           else if(e.detail.winner === "pigs") {
               selectSubMenu(loser);
           }
           else if(e.detail.winner === "abandon") {
                selectSubMenu(principal);
           }
           toggleMenu(false);       
        };
        function winnerClose() {
            if(winnerName.value !== "") {
                var obj = {
                    name:winnerName.value,
                    time:winnerTime,
                    elapse:winnerElapse
                };
                if(factory) {
                    factory.addScore(obj);
                    loadScores();
                }
                subMenuHandler.call(scores);                
            }
            else {
               subMenuHandler.call(principal); 
            }                 
        };
        
        
        gameContainer.addEventListener("gameend",gameEndHandler);

        winner.querySelector(" .closeButton").addEventListener(
                                                        "click",winnerClose);
        loser.querySelector(" .closeButton").addEventListener(
                                                        "click",closeHandler);         
       
    };
    function keyboardMenu(doc,keyboard) {
        var keys = keyboard.querySelector("#keys");
        var buttons = [].slice.call(keys.querySelectorAll(" .keyPanel"));
        var keyValues = factory.keyboard();
        var selectedKey = null;
        principal.querySelector("#keyboardButton").addEventListener(
                                         "click",subMenuHandler.bind(keyboard));
        function close() {
            factory.keyboard(keyValues);
            closeHandler();
        };
        function selectHandler() {
            if(selectedKey !== null) {
                utils.removeClass(selectedKey.button,"keySelect");
            }
            selectedKey = this;
            utils.addClass(selectedKey.button,"keySelect");
        };
        function keyHandler(e) {
            if(selectSubMenu() !== keyboard) {
                return;
            }
            if(e.key === "Tab") {
                e.preventDefault();
                var index = selectedKey.index + 1;
                index = index < buttons.length ? index : 0;
                var button = buttons[index];
                var div = button.querySelector(" .keyValue");
                selectHandler.call({button:button,keyValue:div,index:index});                
            }
            else {
                selectedKey.keyValue.textContent = e.key;
                keyValues[selectedKey.button.getAttribute("data-name")] = e.key;               
            }                       
        };
        keyboard.querySelector(" .closeButton").addEventListener("click",close);        
        buttons.forEach(function(button,index){
            var div = button.querySelector(" .keyValue");
            div.textContent = keyValues[button.getAttribute("data-name")];       
            button.addEventListener("click",
                 selectHandler.bind({button:button,keyValue:div,index:index}));
            if(index === 0) {
                selectHandler.call({button:button,keyValue:div,index:index});
            }
        });
        doc.addEventListener("keydown",keyHandler);
    };
    function loadScores() {  
        var first = '<li><span class="scoreName">',
            middle = '</span><span class="scoreTime">',
            last = '</span></li>',
            list = scores.querySelector("ol"),
            html = "";    
        while (list.hasChildNodes()) {
            list.removeChild(list.lastChild);
        }      
        factory.scores().forEach(function(score){
            html += first+score.name+middle+score.time+last;
        });
        list.innerHTML = html;
    };
    function scoresMenu(score) {
        scores = score;

        scores.querySelector(" .closeButton").addEventListener(
                                                        "click",closeHandler);
        principal.querySelector("#scoresButton").addEventListener(
                                           "click",subMenuHandler.bind(scores));         
        loadScores();                           
    };
    function orientation(e) {
        if(e.detail.mode === "portrait") {
            toggleMenu(false);
            subMenuHandler.call(doc.querySelector("#portrait"));  
        }
        else {
            toggleMenu(true);
            subMenuHandler.call(principal); 
        }
    };    
      
    function menuInit() {
        doc = this.contentDocument;
        principalMenu(doc.querySelector("#principal"));
        winLoseMenu(doc.querySelector("#winner"),doc.querySelector("#loser"));
        infoMenu(doc.querySelector("#information"));       
        keyboardMenu(doc,doc.querySelector("#keyboard"));       
        scoresMenu(doc.querySelector("#scores"));
    };
    
    var resizeEnd = utils.debounce(function(){
            container.style.width = window.innerWidth+"px";
            container.style.height = window.innerHeight+"px";
        },250);
        
    function init(space,events) {
        container = document.querySelector("#container");
        window.addEventListener("resize",resizeEnd);        
        gameContainer = space;
        gameContainer.addEventListener("orientation",orientation);        
        gameEvents = events;        
        menuDiv = container.querySelector("#menuDiv");  
        menu = container.querySelector("#menu");                 
        menu.addEventListener("load",menuInit);
        selectLang();
    };
    return {
        init:init
    };
});


