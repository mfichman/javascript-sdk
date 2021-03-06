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
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

G.provide("", {
  newGroupit: function(json) {
    var namespace = G.models.groupit;
    return G.DataObject.commonConstructor(namespace, G.newContribution, json);
  }
});

//TODO migrate over to just groupit once we go to restObject
G.provide("models.groupit", {

  //TODO need to do inventory on the keys returned from the server
  objectName: "groupit",
  path: "/groupits",
  keys: ["id", "product_image", "product_uri", "product", "price",
    "message", "surprise", "quantity","user_id","recipient", "options",
    "active", "lead_uri", "support_uri", "purchase_date", "groupit_type",
    "created_at", "updated_at", "hash_digest", "organizer", "amount_raised",
    "end_date", "redeem_date", "hide_participants", "is_valid", "lead_image",
    "participants", "app", "user", "contributions", "organizer_uri"],


  index: function(config) {
    //Testing out the includes directive
    var params = {
      include: ["user","participants","contributions", "app"]
    };

    G.DataObject.commonIndex(config, G.models.groupit, G.newGroupit,
      params, wrapIncludes);

    function wrapIncludes(models) {
    }

    //The participants must have a user for the contribution as a contributor => participant
    function commonUser(userId, participants) {
      for (var i in participants) {
        var p = participants[i];
        if (p.userId() == userId) {
          return p.user();
        }
      }
      return null;
    }

  },



  Base: function() {
    var self = this;
    /**
     * Returns a form for image uploads. Only works if the record already exists
     *
     * TODO Add support for uploading on creation.
     *
     * @param {Object} params
     *
     *   imageName:{String}  name of image (lead, support, profile, etc)
     *   imageSize:{String}  size of image to check for. (proxy, full, thumb, etc)
     *   s3Root:   {String}  the s3 url where to poll for the image
     *   timeStamp {Function} (optional) defaults to current ms since epoch
     *   success   {Function} (optional) Success callback
     *   error     {Function} (optional) Error callback
     *   complete: {Function} (optional) Complete callback
     *   doc:      {Object}   (optional) defaults to current document
     *
     * Note submit is intentionally left off so the client can add whatever
     * submit verbage that is needed.
     *
     */
    self.uploadImageForm = function(params) {
      params = params || {};
      params.httpMethod = "PUT";
      params.modelClassName = "groupit";
      params.modelId = params.modelId || this.id && this.id();
      params.path = G.endPoint + "/groupits/" + params.modelId; //Update path

      return G.ApiClient.uploadImageForm(params);
    };


    /**
     * Notes that will be created during the next create/update calls
     *
     *
     * @param noteName Key to get the data back for the groupit
     * @param noteText Value for the note
     * @param userId Optional userId
     */
    var notes = [];
    self.addNote = function(noteName, noteText, userId) {
      notes.push({
        note: noteText,
        name: noteName,
        userId: userId,
        metadataType: 'Groupit'
      });
    };

    var oldCreate = self.create; //TODO has to be a better way to do this
    self.create = function(config) {
      config = config || {};
      //Rewire success to first create notes and then after that finishes return
      var oldSuccess = config.success;
      config.success = function() {
        var args = arguments;
        createNotes(function() {
          if (oldSuccess) oldSuccess.apply(self, args);
        });
      };

      //Try creating like instructed
      oldCreate(config);
    };


    var oldUpdate = self.update;
    self.update = function(config) {
      config = config || {};
      //Rewire success to first create notes and then after that finishes return
      var oldSuccess = config.success;
      config.success = function() {
        var args = arguments;
        createNotes(function() {
          if (oldSuccess) oldSuccess.apply(self, args);
        });
      };

      //Try creating like instructed
      oldUpdate(config);
    };


    //Creates the notes that were added and clears out the array as needed
    //We assume that the groupit has been created and exists at this point.
    //Relies on the fact that self.id() returns a valid id.
    function createNotes(callback) {
      if(notes.length == 0) callback(); //No notes then just return normally
      var finished = 0;
      for (var i in notes) {
        var noteData = notes[i],
          note = G.newNote();
        note.metadataId(self.id());
        note.metadataType('Groupit');
        note.userId(noteData.userId);
        note.name(noteData.name);
        note.note(noteData.note);

        note.create({
          complete: function() {
            finished++;
            if (finished == notes.length) {
              callback(); //Let us know when all the calls finished
              //reset the note array
              notes = [];
            }
          }
        });
      }
    }


  }

});
