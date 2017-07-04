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
        var factory     = null,
            muted       = true,
            dir         = "./sounds/",
            loaded      = false,
            soundBites  = {};
            function loadSounds() {
               var arms = factory.settings();
                if(loaded) return;
                for(var a in arms ) {
                    var arm = arms[a];
                    if(!soundBites.hasOwnProperty(arm.soundFile)) {
                       soundBites[arm.soundFile] =  
                                    utils.createsoundbite(dir+arm.soundFile); 
                    }
                    if(!soundBites.hasOwnProperty(arm.explosion.soundFile)){
                       soundBites[arm.explosion.soundFile] =  
                             utils.createsoundbite(dir+arm.explosion.soundFile);                        
                    }
                }
                var playerParams = factory.playerOptions();
                for(var p in playerParams) {
                    var player = playerParams[p];
                    if(!soundBites.hasOwnProperty(player.explosion.soundFile)) {
                       soundBites[player.explosion.soundFile] =  
                          utils.createsoundbite(dir+player.explosion.soundFile);                        
                    }                   
                };
                loaded = true;
            };
            function mute(fact,m) {
               factory = fact;
               if(m !== undefined)  {
                   muted = m;
                   if(!loaded) {
                      loadSounds(); 
                   }
               }
               return muted;
            };         
            function play(soundFile) {
                if(!muted) {
                    var sound = soundBites[soundFile];
                    if(sound) {
                        sound.play();
                    }
                }
            };

    return {
        mute:mute,
        play:play
    };
});


