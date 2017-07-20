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

], function () {

var createsoundbite = (function(){
    var html5_audiotypes = {
        "ogg": "audio/ogg",
        "aac": "audio/aac",
        "mp3": "audio/mpeg",
        "mp4": "audio/mp4",
        "wav": "audio/wav"
    };
    return function(sounds) {
        if(!Array.isArray(sounds)){
            sounds = [sounds];
        }
        var html5audio = document.createElement('audio');
        if (html5audio.canPlayType){ //check support for HTML5 audio
            for (var i=0; i<sounds.length; i++){
                var sourceel = document.createElement('source');
                sourceel.setAttribute('src', sounds[i]);
                if (sounds[i].match(/\.(\w+)$/i))
                    sourceel.setAttribute('type', html5_audiotypes[RegExp.$1]);
                    html5audio.appendChild(sourceel);
            }
            try{
                html5audio.load();
                return html5audio;             
            }catch(e) {
                console.error(e);
                return null;
            }
        }
        else{
            console.error(
                "This browser doesn't support HTML5 audio unfortunately");
            return null;
        }       
    };
}());

function hasClass(div,className) {
    if (div.classList) {
        return div.classList.contains(className);
    }
    else {
        return !!div.className.match(new RegExp('(\\s|^)' +
                                            className + '(\\s|$)'));
    }           
};
function addClassArray(div, array) {
    array.forEach(function(className){
        addClass(div,className);
    });
};
function addClass(div,className) {
    if(Array.isArray(className)) {
        return addClassArray(div,className);
    }
    if (div.classList) {
        div.classList.add(className);
    }
    else if (!hasClass(div, className)) {
        div.className += " " + className;
    }           
};
function removeClassArray(div,array) {
    array.forEach(function(className){
        removeClass(div,className);
    });    
}
function removeClass(div,className) {
    if(Array.isArray(className)) {
        return removeClassArray(div,className);
    }    
    if (div.classList) {
        div.classList.remove(className);
    }
    else if (hasClass(div, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        div.className = div.className.replace(reg, ' ');
    }             
};

function getBounds(div) {
    var rect = div.getBoundingClientRect();
    return {
        x:      rect.left,
        left:   rect.left,
        y:      rect.top,
        top:    rect.top,
        width:  rect.width,
        height: rect.height,
        right:  rect.right,
        bottom: rect.bottom,
        centerX: rect.left+rect.width/2,
        centerY: rect.top+rect.height/2
    };        
};
function intersectRect(r1, r2) {
    return !(r2.left > r1.right || 
       r2.right < r1.left || 
       r2.top > r1.bottom ||
       r2.bottom < r1.top);
};
function pointInRect(p,r) {
    return intersectRect(
        {left:p.x,right:p.x,top:p.y,bottom:p.y},
        r
    );
};
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var Timer = function(delay) {
    this.id = null;
    this.interval = delay;
};
Timer.prototype = {
    start:function(callback,args) {
        if(this.id === null) {
            this.id = window.setInterval(function() {
                if(typeof callback === "function") {
                    callback.apply(args);
                }                     
            },this.interval);
        }        
    },
    stop : function() {
        if(this.id !== null) {
            window.clearInterval(this.id);
            this.id = null;
        }        
    }
};

/**
 * Basic debounce function as taken from Underscore.js
 * @param {function} func function to execute
 * @param {number} wait timout ms
 * @param {boolean} immediate flag to execute immediately
 * @returns {function} only invoked when last timeout ends
 */
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if(!immediate) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(later, wait);
        if(callNow) {
            func.apply(context, args);
        }
    };
};

function localStorage(key,obj) {
    if(key !== undefined) {
        var store = window.localStorage;
        if(obj !== undefined) {
            store.setItem(key,JSON.stringify(obj));
        }
        else {
            var item = store.getItem(key);
            if(item) {
                return JSON.parse(item);
            }
            return null;
        }
    }
};

/*
Full Screen and orientaion Start
 */
function orientation(orient) {
    try {
        screen.orientation.lock(orient).then(
            function(){},
            function(){}
        ).catch(function(){});                                          
   }catch(e){};      
};

var enterFullScreen = (function(){
    var func = null;
    if(document.documentElement.requestFullscreen) {
        func = function(el){
            el.requestFullscreen();
            return true;
        }; 
    }
    else if(document.documentElement.mozRequestFullScreen) {
        func = function(el){;
            el.mozRequestFullScreen();
            return true;
        };     
    }
    else if(document.documentElement.webkitRequestFullscreen) {
        func = function(el) {
            el.webkitRequestFullscreen();
            return true;
        };      
    }
    else if(document.documentElement.msRequestFullscreen) {
        func = function(el) {
            el.msRequestFullscreen();
            return true;
        };       
    }
    return function(element) {
        if(func !== null) {
            return func(element || document.documentElement);          
        }
        return false;
    };
}());

var exitFullScreen = (function(){
    var func = null;
    if(document.exitFullscreen) {
        func = function() {
            document.exitFullscreen();
            return true;
        };
    } else if(document.mozCancelFullScreen) {
        func = function() {
            document.mozCancelFullScreen();
            return true;
        };
    } else if(document.webkitExitFullscreen) {
        func = function() {
            document.webkitExitFullscreen();
            return true;
        };
    }else if(document.msExitFullscreen) {
        func = function() {
            document.msExitFullscreen();
            return true;
        };
    }    
    return function() {
        if(func !== null) {
            return func.apply();
        }
        return false;
    };        
}());

function toggleFullScreen(element) {
    if(document.fullscreenElement || 
       document.mozFullScreenElement || 
       document.webkitFullscreenElement ||
       document.msFullscreenElement){
       exitFullScreen();
    }
    else {
        enterFullScreen(element);
    }   
};
        
function fullScreenChange(callback) {
    if(document.onfullscreenchange) {
        document.onfullscreenchange = callback;
    }
    else if(document.onwebkitfullscreenchange) {
        document.onwebkitfullscreenchange = callback;
    }
    else if(document.onmozfullscreenchange) {
        document.onmozfullscreenchange = callback; 
    }
    else if(document.onmsfullscreenchange) {
       document.onmsfullscreenchange = callback;
    }
};

/*
Full Screen and orientaion End
*/

/**
 * Polyfill auto load
 * @returns {undefined}
 */
(function () {
    if(!String.prototype.padLeft) {
    String.prototype.padLeft = 
         function(l,c) {return Array(l-this.length+1).join(c||" ")+this;};
    }
    if(!Math.radians) {
        Math.radians = function(degrees) {
           return degrees * Math.PI / 180; 
        };
    }
    if(!Math.degrees) {
        Math.degrees = function(radians) {
            return radians * 180 / Math.PI;
        };
    }
    if(!Array.prototype.remove){
        Array.prototype.remove = 
          function(el) {
              var index = this.indexOf(el);
              if(el !== -1) {
                  return this.splice(index,1);
              }
              return index;
        };
    }
    (function () {

      if ( typeof window.CustomEvent === "function" ) return false;

      function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
       }

      CustomEvent.prototype = window.Event.prototype;

      window.CustomEvent = CustomEvent;
    })();
    
    if (typeof Object.assign !== 'function') {
      Object.assign = function(target, varArgs) { // .length of function is 2
        'use strict';
        if (target === null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource !== null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }
    if (!Array.prototype.includes) {
      Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {
          if (this === null) {
            throw new TypeError('"this" is null or not defined');
          }
          var o = Object(this);
          var len = o.length >>> 0;
          if (len === 0) {
            return false;
          }
          var n = fromIndex | 0;
          var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

          function sameValueZero(x, y) {
            return x === y || (typeof x === 'number' && 
                    typeof y === 'number' && isNaN(x) && isNaN(y));
          }
          while (k < len) {
            if (sameValueZero(o[k], searchElement)) {
              return true;
            }
            k++;
          }
          return false;
        }
      });
    }
})();
    
    return {
        hasClass:       hasClass,
        addClass:       addClass,
        removeClass:    removeClass,
        getBounds:      getBounds,
        intersectRect:  intersectRect,
        pointInRect:    pointInRect,
        getRandomInt:   getRandomInt,
        Timer:          Timer,
        debounce:       debounce,
        localStorage:   localStorage,
        orientation:    orientation,
        createsoundbite:createsoundbite,
        enterFullScreen:enterFullScreen,
        exitFullScreen:exitFullScreen,
        toggleFullScreen:toggleFullScreen,        
        fullScreenChange:fullScreenChange
    };
});


