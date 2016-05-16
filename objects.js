Lapiz.Module("Objects", ["Events"], function($L){
  function _getter(self, funcOrProp){
    if ($L.typeCheck.function(funcOrProp)) { return funcOrProp; }
    if ($L.typeCheck.string(funcOrProp)) { return function(){ return self.attr[funcOrProp]; }; }
  }

  function _setter(self, field, func){
    if ($L.typeCheck.string(func)){
      $L.assert($L.parse[func] !== undefined, "Lapiz.parse does not have field "+func);
      func = $L.parse[func];
    }
    return function(){
      //todo: add test for fireChange and event
      var setterInterface = {
        set: true,
        fireChange: true,
        event: undefined,
      };
      var val = func.apply(setterInterface, arguments);
      if (setterInterface.set) {
        var oldVal = self.attr[field];
        self.attr[field] = val;
        if (setterInterface.fireChange) {self.fire.change(self.pub);}
        if (typeof setterInterface.event === "function") {event(self, val, oldVal);}
      }
    };
  }

  $L.Object = function(constructor){
    var self = $L.Map();
    var pub = $L.Map();

    self.pub = pub;
    self.pub.on = $L.Map();
    self.fire = $L.Map();
    self.attr = $L.Map();
    self._cls = $L.Object;

    self.event = function(name){
      var e = $L.Event();
      $L.Event.linkProperty(self.pub.on, name, e);
      self.fire[name] = e.fire;
    };

    self.event("change");
    self.event("delete");

    self.setMany = function(json){
      var property, i;
      var keys = Object.keys(json);
      var fireEnabled = self.fire.change.enabled;
      self.fire.change.enabled = false;
      for(i=keys.length-1; i>=0; i-=1){
        property = keys[i];
        if (Object.hasOwnProperty.call(self.pub, property)) {
          self.pub[property] = json[property];
        }
      }
      //todo: add test for fire.enabled = false before and after setAll
      self.fire.change.enabled = fireEnabled;
      self.fire.change(self.pub);
    };

    self.properties = function(properties, values){
      var property, val, i, desc;
      var keys = Object.keys(properties);
      for(i=keys.length-1; i>=0; i-=1){
        property = keys[i];
        val = properties[property];
        desc = {};

        if (val === undefined || val === null){
          throw new Error("Invalid value for '" + property + "'");
        } else if ($L.typeCheck.function(val)|| $L.typeCheck.string(val)){
          desc.set = _setter(self, property, val);
          desc.get = _getter(self, property);
        } else if (val.set !== undefined || val.get !== undefined) {
          if (val.set !== undefined){
            desc.set = _setter(self, property, val.set);
          }
          desc.get = (val.get !== undefined) ? _getter(self, val.get) : _getter(self, property);
        } else {
          throw new Error("Could not construct getter/setter for " + val);
        }

        Object.defineProperty(self.pub, property, desc);
      }
      if (values!== undefined){
        self.setMany(values);
      };
    };

    self.getter = function(getterFn){
      $L.Map.getter(self.pub, getterFn);
    };

    self.method = function(fn){
      $L.Map.method(self.pub, fn);
    };

    if ($L.typeCheck.function(constructor)){
      constructor.apply(self);
    }

    return self;
  };

  $L.Map.method($L, function argDict(){
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
  });

  var _newClassEvent = $L.Event();
  $L.Event.linkProperty($L.on, "class", _newClassEvent);
  $L.Class = function(fn, customObj){
    customObj = !!customObj;
    var newInstanceEvent = Lapiz.Event();
    var ret;

    if (customObj){
      ret = function(){
        var obj = fn.apply(this, arguments);
        if (obj === undefined) {throw new Error("Constructor did not return an object");}
        newInstanceEvent.fire(obj);
        return obj;
      };
    } else {
      ret = function(){
        var self = Lapiz.Object();
        var out = fn.apply(self, arguments);
        self = (out === undefined) ? self : out;
        newInstanceEvent.fire(self);
        return self;
      };
    }

    ret.on = $L.Map();
    $L.Event.linkProperty(ret.on, "create", newInstanceEvent);

    _newClassEvent.fire(ret);
    return ret;
  };
});
