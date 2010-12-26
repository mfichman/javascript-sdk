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
 
G.provide('', {

  //Indirection method for the api calls. Can expand out
  //for richer debuging support, etc
  api: function(){
    G.ApiClient.rest.apply(G.ApiClient, arguments);    
  },
  
  test: function(){
    var doc = document
    G.api('view_modules/page', 'get', {
      name: 'view_modules/test'
    }, function(r){
      console.log(r)
      var div = doc.createElement('div');
      div.innerHTML = r;
      doc.body.appendChild(div)
    //      eval("function fn1(){return "+r.toString()+";}")
    //      fn1()();
    });
    
  }
});

G.provide('ApiClient', {
  REST_METHODS: ['get', 'post','delete', 'put'],
  REST_BASE_URL: "http://localhost:3000/",

  /**
   *   rest: REST access to our server with various calling options.
   *    
   *   Except for the path all the arguments to this function are 
   *   optional. Below are examples of valid invocations.
   *
   *  G.api('gift/delete'); // throw away the response
   *  G.api('gift/delete'), function(r){console.log(r)});
   *  G.api('gift/show'), { param1: 'value1', ... }); //throw away response
   *  G.api('gift', 'put', function(r){ console.log(r) });
   *  G.api(
   *    'gift/create',
   *    'post',
   *    {param1: value1, param2 : value2, ...},
   *    function(r) { console.log(r) }
   *
   * @access private
   * @param path      {String}   the url path
   * @param method    {String}   the http method
   * @param params    {Object}   the parameters for the query
   * @param cb        {Function} the callback function for the response 
   */

  rest: function(){
    var 
    args = Array.prototype.slice.call(arguments),
    path = args.shift(),
    next = args.shift(),
    method,
    params,
    cb;
     
    while(next){
      var type = typeof next;
      if (type === 'string' && !method) {
        method = next.toLowerCase();
      } else if (type === 'function' && !cb) {
        cb = next;
      } else if (type === 'object' && !params) {
        params = next;
      } else {
        G.log('Invalid argument passed to FB.api(): ' + next);
        return;
      }
      next = args.shift();
    }

    method = method || 'get';
    params = params || {};

    // remove prefix slash if one is given, as it's already in the base url
    if (path[0] === '/') {
      path = path.substr(1);
    }

    if (G.Array.indexOf(G.ApiClient.REST_METHODS, method) < 0){
      console.log('failed on rest methods');
      return; //Need to create a logging mech
    }

    G.ApiClient.iframeRequest(path, method, params,cb);
  },


  /**
   * iframeRequest: Creates a form and submits from params
   *
   *
   * @access private
   * @param path      {String}   the url path
   * @param method    {String}   the http method
   * @param params    {Object}   the parameters for the query
   * @param cb        {Function} the callback function for the response
   */
  iframeRequest: function(path, method, params, cb){
     
    var iframe = document.createElement('iframe');
    iframe.style.display = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.height = "0px";
    iframe.style.width = "0px";
    
    document.body.appendChild(iframe); //initializes iframe
    
    G['iframe'] = iframe;

    var form = document.createElement('form');
    form.action = this.REST_BASE_URL + path;
    form.method = method;

    for(key in params){
      var input = document.createElement('input');
      input.type ='text'; //DEBUG text
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    }

    //Load the content after submission to the callback
    if(cb){
      iframe.onload = function(){

        var content;
        //the callback() method is inserted into our frame as a JSONP method
        if(!!iframe.contentWindow.callback){
          content= iframe.contentWindow.callback();
        }else{
          //Not a JSONP response, assume html/js is response and pass back
          if(!!iframe.contentWindow.callback2){
            fn = iframe.contentWindow.callback2//.call(window)
            eval("function fn1(){return "+fn.toString()+";}")
            fn1.call(window)();
            console.log("called callback2");
          }
          content = iframe.contentWindow.document.body.innerHTML;
          
        }

        console.log(content)
        //        //Apply callback in the context of the callee instead of the iframe
        cb(content);
        //We have to set a timeout to kill the parent and let the onload
        //finish otherwise we get errors in browsers thinking that the response
        //never arrived. Functions like a 'after_load' event
        setTimeout(function(){
          //          document.body.removeChild(iframe);
          //          console.log(cb)
          //          console.log("callback coming")
          
          }, 1000); //IE doesn't accept 0 and all browsers round up to min delay ~10ms

      }
    }
      
    iframe.contentWindow.document.body.appendChild(form);    
    form.submit();
  }

});
