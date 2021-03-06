/**
 * Copyright (c) 2010 Timothy Cardenas
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

//parts borrowed from the fb connect.js libs
G.provide('Array', {

  // This is native javascript function HOWEVER IE (7) BLOWS
  // and we force its definition here if its not defined
  indexOf: function (array, item) {
    if (array.indexOf) {
      return array.indexOf(item);
    }
    var length = array.length;
    if (length) {
      for (var index = 0; index < length; index++) {
        if (array[index] === item) {
          return index;
        }
      }
    }
    return -1;
  },

  /**
   * Create an array by performing transformation on the items in a source
   * array.
   *
   * @param arr {Array} Source array.
   * @param transform {Function} Transformation function.
   * @return {Array} The transformed array.
   */
  map: function(arr, transform) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      ret.push(transform(arr[i]));
    }
    return ret;
  }

});
