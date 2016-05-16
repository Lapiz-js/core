Lapiz.Module("Objects", ["Events"], function($L){
  $L.Object = function(){
    var self = {};
    var priv = {};

    self.priv =  priv;
    self.on = {};
    priv.fire = {};
    priv.attr = {};
    self._cls = $L.Object;

    priv.event = function(name){
      var e = $L.Event();
      self.on[name] = e.register;
      e.register.deregister = e.deregister;
      Object.defineProperty(self.on, name, {
        get: function(){ return e.register; },
        set: function(fn){ e.register(fn); }
      });
      priv.fire[name] = e.fire;
      priv.fire[name].disable = function(){ e.enabled = false; };
      priv.fire[name].enable = function(){ e.enabled = true; };
      priv.fire[name].enabled = function(){ return e.enabled; };
      priv.fire[name].length = function(){ return e.length; };
      Object.defineProperty(priv.fire[name], "length", {
        get: function(){ return e.length; }
      });
    };

    priv.event("change");
    priv.event("delete");

    priv.setAll = function(json){
      var property, i;
      var keys = Object.keys(json);
      priv.fire.change.disable();
      for(i=keys.length-1; i>=0; i-=1){
        property = keys[i];
        if (self.hasOwnProperty(property)) {
          self[property] = json[property];
        }
      }
      priv.fire.change.enable();
      priv.fire.change(self);
    };

    priv.lock = function(){
      delete self.priv;
      delete self.lock;
    };

    var _getter = function (funcOrProp){
        if (funcOrProp instanceof Function) { return funcOrProp; }
        if (typeof(funcOrProp) === "string") { return function(){ return priv.attr[funcOrProp]; }; }
      };
    var _setter = function (field, func){
      if (typeof func === "string"){
        if ($L.parse[func] === undefined){
          throw new Error("Lapiz.parse does not have field "+func);
        } else {
          func = $L.parse[func];
        }
      }
      return function(){
        var setterInterface = {
          set: true
        };
        var val = func.apply(setterInterface, arguments);
        if (setterInterface.set) { priv.attr[field] = val; }
        priv.fire.change(self);
      };
    };

    priv.properties = function(properties, values){
      var property, val, i, desc;
      var keys = Object.keys(properties);
      for(i=keys.length-1; i>=0; i-=1){
        property = keys[i];
        val = properties[property];
        desc = {};

        if (val === undefined || val === null){
          throw "Invalid value for '" + property + "'";
        } else if (typeof val === "function" || typeof val === "string"){
          desc.set = _setter(property, val);
          desc.get = _getter(property);
        } else if (val.set !== undefined || val.get !== undefined) {
            if (val.set !== undefined){
              desc.set = _setter(property, val.set);
            }
            if (val.get !== undefined){
              desc.get = _getter(val.get);
            } else {
              desc.get = _getter(property);
            }
        } else if (val instanceof Array){
          desc.set = _setter(property, val[0]);
          if (val[1] !== undefined) {
            desc.get = _getter(val[1]);
          } else {
            desc.get = _getter(property);
          }
        } else {
          throw "Could not construct getter/setter for " + val;
        }

        Object.defineProperty(self, property, desc);
      }
      if (values!== undefined){
        priv.setAll(values);
      };
    };

    priv.argDict = function(){
      var args = arguments.callee.caller.arguments;
      var argNames = (arguments.callee.caller + "").match(/\([^)]*\)/g);
      var dict = {};
      var i,l;
      argNames = argNames[0].match(/[\w$]+/g);
      l = argNames.length;
      for(i=0; i<l; i+=1){
        dict[argNames[i]] = args[i];
      }
      return dict;
    };
    return self;
  };

  var _newClassEvent = $L.Event();
  Object.defineProperty($L.on, "class", {
    get: function(){ return _newClassEvent.register; },
    set: function(fn){ _newClassEvent.register(fn); }
  });
  $L.Class = function(fn){
    var e = Lapiz.Event();
    var ret = function(){
      var obj = fn.apply(this, arguments);
      if (obj === undefined) {throw new Error("Constructor did not return an object");}
      e.fire(obj);
      return obj;
    };
    ret.on = {
      "create": e.register
    };
    _newClassEvent.fire(ret);
    return ret;
  };
  $L.Constructor = function(fn, properties){
    return $L.Class( function(){
      var self = Lapiz.Object();
      if (properties !== undefined){
        self.priv.properties(properties);
      }
      fn.apply(self, arguments);
      return self;
    });
  };
});
