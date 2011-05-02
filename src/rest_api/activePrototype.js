



G.provide("ActivePrototype", {
    
  /**
   * Generates a wrapper from an incoming JSON object.  Recursively wraps all
   * children.  If the JSON object is a String, Boolean, or Number, then that
   * value is returned without modification.
   * @param data the JSON data hash
   * @return wrapped object
   */
  newModel: function(modelName, data) {

    if (!(data instanceof Object)) {
      // This handles the case where data is a value, i.e., String, Number,
      // or Boolean.
      return data;
    }

    var model = G["new" + modelName]();
    for (var key in data) {
      var value = data[key];
      var setterName = G.String.toCamelCase(key);
      if (!(model[setterName] instanceof Function)) {
        //G.log("Warning: Invalid setter: " + key);
        continue;
      }

      var subModelName = G.ActivePrototype.modelName(key);
      if (value instanceof Array) {
        // Collection (i.e., object.foo(5))
        for (i in value) {
          var subModel = G.ActivePrototype.newModel(subModelName, value[i]);
          model[setterName](i, subModel); 
        }
      } else {
        // Single attribute (i.e., object.foo())
        var subModel = G.ActivePrototype.newModel(subModelName, value);
        model[setterName](subModel);
      }
    }  
    return model;
  },

  /**
   * Convert a Rails attribute name (i.e., foo_bars) to a camel-case class name
   * (i.e., FooBar).
   */
  modelName: function(name) {
    name = G.String.toCamelCase(name);
    name = name[0].toUpperCase() + name.substring(1)

    /* Strip out the 's' if there is an s */
    if (name[name.length-1] == 's') {
      name = name.substring(0, name.length-1);
    }
    return name
  }
});


function test() {
  var a = G.ActivePrototype.newModel("Groupit", {});
  a.id(1);
  a.read({ success: function() {
    console.log(a.data());
    var b = G.ActivePrototype.newModel("Groupit", a.data());
  }});
}
