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
    var soundBites  = {};     
            
    var load = (function(){
        var loaded      = false,
            dir         = "./sounds/";

        function loadSounds(soundFiles) {
            if(!loaded) {
                soundFiles.forEach(function(file){
                    if(!soundBites.hasOwnProperty(file)){
                         soundBites[file] = utils.createsoundbite(dir+file);                    
                    }
                });               
            }
            return true;
            
        };
        return function(soundFiles) {
            if(soundFiles !== undefined){                       
               loaded = loadSounds(soundFiles); 
            }
            return loaded;
        };

    }());

    var mute = (function(){
        var muted = false;
        return function (m) {
            if(m !== undefined) {
                muted = m;
            }
            return muted;
        };
    }());         
    function play(soundFile) {
        if(!mute()) {
            var sound = soundBites[soundFile];
            if(sound) {
                sound.play();
            }
        }
    };

    return {
        load:load,
        mute:mute,
        play:play
    };
});


