(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Combinatorics = require('js-combinatorics');
var Numbered      = require('numbered');


// Util functions for generating schema and utterances
// ===================================================
// Convert a number range like 5-10 into an array of english words
function expandNumberRange(start, end, by) {
  by = by || 1; //incrementing by 0 is a bad idea
  var converted = [];
  for (var i=start; i<=end; i+=by) {
    converted.push( Numbered.stringify(i).replace(/-/g,' ') );
  }
  return converted;
}

// Determine if a curly brace expression is a Slot name literal
// Returns true if expression is of the form {-|Name}, false otherwise
function isSlotLiteral(braceExpression) {
  return braceExpression.substring(0, 3) == "{-|";
}

// Recognize shortcuts in utterance definitions and swap them out with the actual values
function expandShortcuts(str, slots, dictionary) {
  // If the string is found in the dictionary, just provide the matching values
  if (typeof dictionary=="object" && typeof dictionary[str]!="undefined") {
    return dictionary[str];
  }
  // Numbered ranges, ex: 5-100 by 5
  var match = str.match(/(\d+)\s*-\s*(\d+)(\s+by\s+(\d+))?/);
  if (match) {
    return expandNumberRange(+match[1],+match[2],+match[4]);
  }
  return [str];
}

var slotIndexes = [];
function expandSlotValues (variations, slotSampleValues) {
  var i;

  var slot;
  for (slot in slotSampleValues) {

    var sampleValues = slotSampleValues[slot];

    var idx = -1;
    if (typeof slotIndexes[slot] !== "undefined") {
      idx = slotIndexes[slot];
    }

    var newVariations = [];

    // make sure we have enough variations that we can get through the sample values
    // at least once for each alexa-app utterance...  this isn't strictly as
    // minimalistic as it could be.
    //
    // our *real* objective is to make sure that each sampleValue gets used once per
    // intent, but each intent spans multiple utterances; it would require heavy
    // restructuring of the way the utterances are constructed to keep track of
    // whether every slot was given each sample value once within an Intent's set
    // of utterances.  So we take the easier route, which generates more utterances
    // in the output (but still many less than we would get if we did the full
    // cartesian product).
    if (variations.length < sampleValues.length) {
      var mod = variations.length;
      var xtraidx = 0;
      while (variations.length < sampleValues.length) {
        variations.push (variations[xtraidx]);
        xtraidx = (xtraidx + 1) % mod;
      }
    }

    variations.forEach (function (variation, j) {
      var newVariation = [];
      variation.forEach (function (value, k) {
        if (value == "slot-" + slot) {
          idx = (idx + 1) % sampleValues.length;
          slotIndexes[slot] = idx;

          value = sampleValues[idx];
        }

        newVariation.push (value);
      });
      newVariations.push (newVariation);
    });

    variations = newVariations;
  }

  return variations;
}

// Generate a list of utterances from a template
function generateUtterances(str, slots, dictionary, exhaustiveUtterances) {
  var placeholders=[], utterances=[], slotmap={}, slotValues=[];
  // First extract sample placeholders values from the string
  str = str.replace(/\{([^\}]+)\}/g, function(match,p1) {

    if (isSlotLiteral(match)) {
      return match;
    }

    var expandedValues=[], slot, values = p1.split("|");
    // If the last of the values is a SLOT name, we need to keep the name in the utterances
    if (values && values.length && values.length>1 && slots && typeof slots[values[values.length-1]]!="undefined") {
      slot = values.pop();
    }
    values.forEach(function(val,i) {
      Array.prototype.push.apply(expandedValues,expandShortcuts(val,slots,dictionary));
    });
    if (slot) {
      slotmap[slot] = placeholders.length;
    }

    // if we're dealing with minimal utterances, we will delay the expansion of the
    // values for the slots; all the non-slot expansions need to be fully expanded
    // in the cartesian product
    if (!exhaustiveUtterances && slot)
    {
      placeholders.push( [ "slot-" + slot ] );
      slotValues[slot] = expandedValues;
    }
    else
    {
      placeholders.push( expandedValues );
    }

    return "{"+(slot || placeholders.length-1)+"}";
  });
  // Generate all possible combinations using the cartesian product
  if (placeholders.length>0) {
    var variations = Combinatorics.cartesianProduct.apply(Combinatorics,placeholders).toArray();

    if (!exhaustiveUtterances)
    {
      variations = expandSlotValues (variations, slotValues);
    }

    // Substitute each combination back into the original string
    variations.forEach(function(values) {
      // Replace numeric placeholders
      var utterance = str.replace(/\{(\d+)\}/g,function(match,p1){ 
        return values[p1]; 
      });
      // Replace slot placeholders
      utterance = utterance.replace(/\{(.*?)\}/g,function(match,p1){ 
        return (isSlotLiteral(match)) ? match : "{"+values[slotmap[p1]]+"|"+p1+"}";
      });
      utterances.push( utterance );
    });
  }
  else {
    utterances = [str];
  }

  // Convert all {-|Name} to {Name} to accomodate slot literals
  for (var idx in utterances) {
    utterances[idx] = utterances[idx].replace(/\{\-\|/g, "{");
  }

  return utterances;
}


module.exports = generateUtterances;

},{"js-combinatorics":2,"numbered":3}],2:[function(require,module,exports){
/*
 * $Id: combinatorics.js,v 0.25 2013/03/11 15:42:14 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-combination
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-permutation
 *    http://en.wikipedia.org/wiki/Factorial_number_system
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Combinatorics = factory();
    }
}(this, function () {
    'use strict';
    var version = "0.5.4";
    /* combinatory arithmetics */
    var P = function(m, n) {
        if (n % 1 !== 0) throw new RangeError;
        var p = 1;
        while (n--) p *= m--;
        return p;
    };
    var C = function(m, n) {
        if (n > m) {
            return 0;
        }
        return P(m, n) / P(n, n);
    };
    var factorial = function(n) {
        return P(n, n);
    };
    var factoradic = function(n, d) {
        var f = 1;
        if (!d) {
            for (d = 1; f < n; f *= ++d);
            if (f > n) f /= d--;
        } else {
            f = factorial(d);
        }
        var result = [0];
        for (; d; f /= d--) {
            result[d] = Math.floor(n / f);
            n %= f;
        }
        return result;
    };
    /* common methods */
    var addProperties = function(dst, src) {
        Object.keys(src).forEach(function(p) {
            Object.defineProperty(dst, p, {
                value: src[p],
                configurable: p == 'next'
            });
        });
    };
    var hideProperty = function(o, p) {
        Object.defineProperty(o, p, {
            writable: true
        });
    };
    var toArray = function(f) {
        var e, result = [];
        this.init();
        while (e = this.next()) result.push(f ? f(e) : e);
        this.init();
        return result;
    };
    var common = {
        toArray: toArray,
        map: toArray,
        forEach: function(f) {
            var e;
            this.init();
            while (e = this.next()) f(e);
            this.init();
        },
        filter: function(f) {
            var e, result = [];
            this.init();
            while (e = this.next()) if (f(e)) result.push(e);
            this.init();
            return result;
        },
        find: function(f) {
            var e, result;
            this.init();
            while (e = this.next()) {
                if (f(e)) {
                    result = e;
                    break;
                }
            }
            this.init();
            return result;
        },
        lazyMap: function(f) {
            this._lazyMap = f;
            return this;
        },
        lazyFilter: function(f) {
            Object.defineProperty(this, 'next', {
                writable: true
            });
            if (typeof f !== 'function') {
                this.next = this._next;
            } else {
                if (typeof (this._next) !== 'function') {
                    this._next = this.next;
                }
                var _next = this._next.bind(this);
                this.next = (function() {
                    var e;
                    while (e = _next()) {
                        if (f(e))
                            return e;
                    }
                    return e;
                }).bind(this);
            }
            Object.defineProperty(this, 'next', {
                writable: false
            });
            return this;
        }

    };
    /* power set */
    var power = function(ary, fun) {
        var size = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var i = 0,
                    result = [];
                for (; n; n >>>= 1, i++) if (n & 1) result.push(this[i]);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* combination */
    var nextIndex = function(n) {
        var smallest = n & -n,
            ripple = n + smallest,
            new_smallest = ripple & -ripple,
            ones = ((new_smallest / smallest) >> 1) - 1;
        return ripple | ones;
    };
    var combination = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = (1 << nelem) - 1,
            size = C(ary.length, nelem),
            maxIndex = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first;
            },
            next: function() {
                if (this.index >= maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (; n; n >>>= 1, i++) {
                    if (n & 1) result[result.length] = this[i];
                }

                this.index = nextIndex(this.index);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* bigcombination */
    var bigNextIndex = function(n, nelem) {

        var result = n;
        var j = nelem;
        var i = 0;
        for (i = result.length - 1; i >= 0; i--) {
            if (result[i] == 1) {
                j--;
            } else {
                break;
            }
        } 
        if (j == 0) {
            // Overflow
            result[result.length] = 1;
            for (var k = result.length - 2; k >= 0; k--) {
                result[k] = (k < nelem-1)?1:0;
            }
        } else {
            // Normal

            // first zero after 1
            var i1 = -1;
            var i0 = -1;
            for (var i = 0; i < result.length; i++) {
                if (result[i] == 0 && i1 != -1) {
                    i0 = i;
                }
                if (result[i] == 1) {
                    i1 = i;
                }
                if (i0 != -1 && i1 != -1) {
                    result[i0] = 1;
                    result[i1] = 0;
                    break;
                }
            }

            j = nelem;
            for (var i = result.length - 1; i >= i1; i--) {
                if (result[i] == 1)
                    j--;
            }
            for (var i = 0; i < i1; i++) {
                result[i] = (i < j)?1:0;
            }
        }

        return result;

    };
    var buildFirst = function(nelem) {
        var result = [];
        for (var i = 0; i < nelem; i++) {
            result[i] = 1;
        }
        result[0] = 1;
        return result;
    };
    var bigCombination = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = buildFirst(nelem),
            size = C(ary.length, nelem),
            maxIndex = ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first.concat();
            },
            next: function() {
                if (this.index.length > maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (var j = 0; j < n.length; j++, i++) {
                    if (n[j])
                        result[result.length] = this[i];
                }
                bigNextIndex(this.index, nelem);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* permutation */
    var _permutation = function(ary) {
        var that = ary.slice(),
            size = factorial(that.length);
        that.index = 0;
        that.next = function() {
            if (this.index >= size) return;
            var copy = this.slice(),
                digits = factoradic(this.index, this.length),
                result = [],
                i = this.length - 1;
            for (; i >= 0; --i) result.push(copy.splice(digits[i], 1)[0]);
            this.index++;
            return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
        };
        return that;
    };
    // which is really a permutation of combination
    var permutation = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var size = P(ary.length, nelem),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                /* combination can only be used for less than 31 elements */
                if (ary.length < 31) {
                    this.cmb = combination(ary, nelem);
                } else {
                    this.cmb = bigCombination(ary, nelem);
                }
                
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) return;
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    var PC = function(m) {
        var total = 0;
        for (var n = 1; n <= m; n++) {
            var p = P(m,n);
            total += p;
        };
        return total;
    };
    // which is really a permutation of combination
    var permutationCombination = function(ary, fun) {
        // if (!nelem) nelem = ary.length;
        // if (nelem < 1) throw new RangeError;
        // if (nelem > ary.length) throw new RangeError;
        var size = PC(ary.length),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        hideProperty(that, 'nelem');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.nelem = 1;
                // console.log("Starting nelem: " + this.nelem);
                this.cmb = combination(ary, this.nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) {
                        this.nelem++;
                        // console.log("increment nelem: " + this.nelem + " vs " + ary.length);
                        if (this.nelem > ary.length) return;
                        this.cmb = combination(ary, this.nelem);
                        cmb = this.cmb.next();
                        if (!cmb) return;
                    }
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* Cartesian Product */
    var arraySlice = Array.prototype.slice;
    var cartesianProduct = function() {
        if (!arguments.length) throw new RangeError;
        var args = arraySlice.call(arguments),
            size = args.reduce(function(p, a) {
                return p * a.length;
            }, 1),
            sizeOf = function() {
                return size;
            },
            dim = args.length,
            that = Object.create(args, {
                length: {
                    get: sizeOf
                }
            });
        if (!size) throw new RangeError;
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            dim: dim,
            init: function() {
                this.index = 0;
            },
            get: function() {
                if (arguments.length !== this.length) return;
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var i = arguments[d];
                    if (i >= this[d].length) return;
                    result.push(this[d][i]);
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            nth: function(n) {
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var l = this[d].length;
                    var i = n % l;
                    result.push(this[d][i]);
                    n -= i;
                    n /= l;
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            next: function() {
                if (this.index >= size) return;
                var result = this.nth(this.index);
                this.index++;
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return that;
    };
    /* baseN */
    var baseN = function(ary, nelem, fun) {
                if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        var base = ary.length,
                size = Math.pow(base, nelem);
        var sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var result = [];
                for (var i = 0; i < nelem; i++) {
                    var d = n % base;
                    result.push(ary[d])
                    n -= d; n /= base
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    /* export */
    var Combinatorics = Object.create(null);
    addProperties(Combinatorics, {
        C: C,
        P: P,
        factorial: factorial,
        factoradic: factoradic,
        cartesianProduct: cartesianProduct,
        combination: combination,
        bigCombination: bigCombination,
        permutation: permutation,
        permutationCombination: permutationCombination,
        power: power,
        baseN: baseN,
        VERSION: version
    });
    return Combinatorics;
}));

},{}],3:[function(require,module,exports){
(function (root, factory) {
  /* istanbul ignore else */
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD, registers as an anonymous module.
    define(factory);
  } else {
    // Browser global.
    root.numbered = factory();
  }
})(this, function () {
  var NUMBER_MAP = {
    '.': 'point',
    '-': 'negative',
    0: 'zero',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fifteen',
    16: 'sixteen',
    17: 'seventeen',
    18: 'eighteen',
    19: 'nineteen',
    20: 'twenty',
    30: 'thirty',
    40: 'forty',
    50: 'fifty',
    60: 'sixty',
    70: 'seventy',
    80: 'eighty',
    90: 'ninety'
  };

  // http://en.wikipedia.org/wiki/English_numerals#Cardinal_numbers
  var CARDINAL_MAP = {
    2: 'hundred',
    3: 'thousand',
    6: 'million',
    9: 'billion',
    12: 'trillion',
    15: 'quadrillion',
    18: 'quintillion',
    21: 'sextillion',
    24: 'septillion',
    27: 'octillion',
    30: 'nonillion',
    33: 'decillion',
    36: 'undecillion',
    39: 'duodecillion',
    42: 'tredecillion',
    45: 'quattuordecillion',
    48: 'quindecillion',
    51: 'sexdecillion',
    54: 'septendecillion',
    57: 'octodecillion',
    60: 'novemdecillion',
    63: 'vigintillion',
    100: 'googol',
    303: 'centillion'
  };

  // Make a hash of words back to their numeric value.
  var WORD_MAP = {
    nil: 0,
    naught: 0,
    period: '.',
    decimal: '.'
  };

  Object.keys(NUMBER_MAP).forEach(function (num) {
    WORD_MAP[NUMBER_MAP[num]] = isNaN(+num) ? num : +num;
  });

  Object.keys(CARDINAL_MAP).forEach(function (num) {
    WORD_MAP[CARDINAL_MAP[num]] = isNaN(+num) ? num : Math.pow(10, +num);
  });

  /**
   * Returns the number of significant figures for the number.
   *
   * @param  {number} num
   * @return {number}
   */
  function intervals (num) {
    var match = String(num).match(/e\+(\d+)/);

    if (match) return match[1];

    return String(num).length - 1;
  }

  /**
   * Calculate the value of the current stack.
   *
   * @param {Array}  stack
   * @param {number} largest
   */
  function totalStack (stack, largest) {
    var total = stack.reduceRight(function (prev, num, index) {
      if (num > stack[index + 1]) {
        return prev * num;
      }

      return prev + num;
    }, 0);

    return total * largest;
  }

  /**
   * Accepts both a string and number type, and return the opposite.
   *
   * @param  {string|number} num
   * @return {string|number}
   */
  function numbered (num) {
    if (typeof num === 'string') return numbered.parse(num);
    if (typeof num === 'number') return numbered.stringify(num);

    throw new Error('Numbered can only parse strings or stringify numbers');
  }

  /**
   * Turn a number into a string representation.
   *
   * @param  {number} num
   * @return {string}
   */
  numbered.stringify = function (value) {
    var num = Number(value);
    var floor = Math.floor(num);

    // If the number is in the numbers object, we quickly return.
    if (NUMBER_MAP[num]) return NUMBER_MAP[num];

    // If the number is a negative value.
    if (num < 0) return NUMBER_MAP['-'] + ' ' + numbered.stringify(-num);

    // Check if we have decimals.
    if (floor !== num) {
      var words = [numbered.stringify(floor), NUMBER_MAP['.']];
      var chars = String(num).split('.').pop();

      for (var i = 0; i < chars.length; i++) {
        words.push(numbered.stringify(+chars[i]));
      }

      return words.join(' ');
    }

    var interval = intervals(num);

    // It's below one hundred, but greater than nine.
    if (interval === 1) {
      return NUMBER_MAP[Math.floor(num / 10) * 10] + '-' + numbered.stringify(Math.floor(num % 10));
    }

    var sentence = [];

    // Simple check to find the closest full number helper.
    while (!CARDINAL_MAP[interval]) interval -= 1;

    if (CARDINAL_MAP[interval]) {
      var remaining = Math.floor(num % Math.pow(10, interval));

      sentence.push(numbered.stringify(Math.floor(num / Math.pow(10, interval))));
      sentence.push(CARDINAL_MAP[interval] + (remaining > 99 ? ',' : ''));

      if (remaining) {
        if (remaining < 100) sentence.push('and');

        sentence.push(numbered.stringify(remaining));
      }
    }

    return sentence.join(' ');
  };

  /**
   * Turns a string representation of a number into a number type
   * @param  {string} num
   * @return {number}
   */
  numbered.parse = function (num) {
    var modifier = 1;
    var largest = 0;
    var largestInterval = 0;
    var zeros = 0; // Track leading zeros in a decimal.
    var stack = [];

    var total = num.split(/\W+/g)
      .map(function (word) {
        var num = word.toLowerCase();

        return WORD_MAP[num] !== undefined ? WORD_MAP[num] : num;
      })
      .filter(function (num) {
        if (num === '-') modifier = -1;
        if (num === '.') return true; // Decimal points are a special case.

        return typeof num === 'number';
      })
      .reduceRight(function (memo, num) {
        var interval = intervals(num);

        // Check the interval is smaller than the largest one, then create a stack.
        if (typeof num === 'number' && interval < largestInterval) {
          stack.push(num);
          if (stack.length === 1) return memo - largest;
          return memo;
        }

        memo += totalStack(stack, largest);
        stack = []; // Reset the stack for more computations.

        // If the number is a decimal, transform everything we have worked with.
        if (num === '.') {
          var decimals = zeros + String(memo).length;

          zeros = 0;
          largest = 0;
          largestInterval = 0;

          return memo * Math.pow(10, -decimals);
        }

        // Buffer encountered zeros.
        if (num === 0) {
          zeros += 1;
          return memo;
        }

        // Shove the number on the front if the intervals match and the number whole.
        if (memo >= 1 && interval === largestInterval) {
          var output = '';

          while (zeros > 0) {
            zeros -= 1;
            output += '0';
          }

          return Number(String(num) + output + String(memo));
        }

        largest = num;
        largestInterval = intervals(largest);

        return (memo + num) * Math.pow(10, zeros);
      }, 0);

    return modifier * (total + totalStack(stack, largest));
  };

  return numbered;
});

},{}]},{},[1]);
