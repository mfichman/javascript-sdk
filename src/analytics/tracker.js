/**
 * Copyright (c) 2011 Timothy Cardenas
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
 * OF CONTRACT, TORT OR OTHERWISE, ARISING fromWidget, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */


G.provide("", {
  track: function() {
    G.Tracker.track.apply(G.Tracker, arguments);
  }
});


G.provide("Tracker", {

  endpoint: "https://analytics.groupit.com",

  /**
   * General tracking mechanism for our analytics. Spins up a self destructive
   * iframe that then sends a request to watson for tracking.
   *
   * Allows multiplexing of event tracking and pageview tracking. In addition to
   * requesting either tracking mechanism you can also do both at the same time
   * if needed. Just pass the keys as specified below
   *
   * @param {Object} options See below
   *
   * options = {
   *  event: {
   *    category: undefined,
   *    action: undefined,
   *    optLabel: undefined, //optional
   *    optValue: undefined  //optional
   *  },
   *  pageview = {
   *    path: undefined
   *  }
   * }
   *
   */

  track: function(options) {

    var trackParams = {},
      iframe = G.ApiClient.createHiddenIframe();

    //Populate the trackParams
    if (options.event) trackEvent(options.event, trackParams);
    if (options.pageview) trackPageView(options.pageview, trackParams);

    //Encode and send
    var qs = G.QS.encode(trackParams);
    iframe.src = G.Tracker.endpoint + "?" + qs;

    //Cleanup
    setTimeout(function() {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 30000); //30 seconds from now (max heroku timeout length) remove iframe

    //Support functions
    function trackEvent(options, trackParams) {
      if (!options.category || !options.action) {
        G.log("trackEvent requires category and action arguments");
        return;
      }

      //Required for eventTracking
      trackParams.category = options.category;
      trackParams.action = options.action;

      if (options.optLabel) trackParams.optLabel = options.optLabel;
      if (options.optValue) trackParams.optValue = options.optValue;
    }

    function trackPageView(options, trackParams) {
      if (!options.path) {
        G.log('trackPageview requires a path argument');
        return;
      }

      //Required for pageview tracking
      trackParams.path = options.path
    }
  }
});

