/*jslint browser: true, devel: true, passfail: true, plusplus: true, sloppy: true, white: true */
/*global util, game, calculateMove, HTMLElement */

// An object full of utility methods.
// This object also creates all the polyfills needed for IE7 support.
var util = (function () {
    var addEventListener, removeEventListener; 
    
    // Converts traditional coordinates to chess coordinates.
    // `xyToChessCoords(0,7) -> "A8"`
    function xyToChessCoords(x, y) {
        var char = "ABCDEFGH".charAt(x),
            num = Math.abs(y - 8);
        return char + num;
    }
    
    /**
     *@param {Number} max A cap for the random number, ex: 1-100 (100 is max).
     *@param {Array} not An array of numbers that the return value cannot be.
     */
    function random(max, not) {
        var num = Math.floor(Math.random() * max);
        
        if (not) {
            while (not.indexOf(num) !== -1) {
                num = Math.ceil(Math.random() * max);
            }
        }
        return num;
    }
    
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function(cn) {
            var allTags = document.getElementsByTagName('*'), 
                allClassMatches = [], 
                i = 0,
                e = allTags[i];
            
            while(e) {
                if (e.className === cn) { 
                    allClassMatches.push(e); 
                }
                e = allTags[++i];
            }
            return allClassMatches;
        };
    }
    
    // Shim for event listening
    if (!window.addEventListener) {
        addEventListener = function (type, callback) {
            this.attachEvent("on" + type, callback);
        };
        removeEventListener = function (type, callback) {
            this.detachEvent("on" + type, callback);
        };
    } else {
        addEventListener = function (type, callback) {
            this.addEventListener(type, callback, false);
        };
        removeEventListener = function (type, callback) {
            this.removeEventListener(type, callback, false);
        };
    }
    
    // "Don't modify what you dont own". Well in this case, I am simply
    // creating functionality for what might not be there. If this program
    // is going to run on IE7, it needs these array methods. They all work
    // exactly like the ES5 ones.
    if (![].forEach) {
        
        Array.prototype.indexOf = function (value, fromPosition) {
            var i = fromPosition || 0,
                len = this.length;
            
            while (i < len) {
                if (this.hasOwnProperty(i) && this[i] === value) {
                    return i;
                }
                i++;
            }
            return -1;
        };
        
        Array.prototype.filter = function (fn, thisArg) {
            var i, value,
                len = this.length,
                result = [];
            
            for (i = 0; i < len; i ++) {
                if (this.hasOwnProperty(i)) {
                    value = this[i];
                    if (fn.call(thisArg, value, i, this)) {
                        result.push(value);
                    }
                }
            }
            return result;
        };
        
        Array.prototype.forEach = function (fn, thisArg) {
            var i, 
                len = this.length;
            
            for (i = 0; i < len; i++) {
                if (this.hasOwnProperty(i)) {
                    fn.call(thisArg, this[i], i, this);
                }
            }
        };
        
        Array.prototype.map = function (fn, thisArg) {
            var i,
                len = this.length,
                result = [];
            
            for (i = 0; i < len; i ++) {
                if (this.hasOwnProperty(i)) {
                    result[i] = fn.call(thisArg, this[i], i, this);
                }
            }
            return result;
        };

        Array.prototype.some = function (fn, thisArg) {
            var i,
                len = this.length;
            
            for (i = 0; i < len; i ++) {
                if (this.hasOwnProperty(i) && fn.call(thisArg, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
        
    }
    
    return {
        xyToChessCoords: xyToChessCoords,
        random: random,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener
    };
    
}());