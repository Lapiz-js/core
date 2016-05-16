Lapiz.Module("Collections", function($L){
  function Map(){
    return Object.create(null);
  };
  $L.set($L, "Map", Map);

  $L.set(Map, "method", function(obj, fn){
    $L.typeCheck.function(fn, "Expected function");
    $L.assert(fn.name !== "", "Require named function for method");
    $L.set(obj, fn.name, fn);
  });

  Map.method(Map, function setterMethod(obj, fn){
    $L.typeCheck.function(fn, "Expected function for setterMethod");
    $L.assert(fn.name !== "", "Require named function for setterMethod");
    Object.defineProperty(obj, fn.name, {
      "get": function(){ return fn; },
      "set": fn,
    });
  });

  Map.method(Map, function prop(obj, name, desc){
    Object.defineProperty(obj, name, desc);
  });

  Map.method(Map, function getter(obj, fn){
    $L.typeCheck.function(fn, "Expected function for getter");
    $L.assert(fn.name !== "", "Require named function for getter");
    Object.defineProperty(obj, fn.name, {"get": fn,} );
  });

  Map.method(Map, function setterGetter(obj, name, setter, getter){
    $L.typeCheck.function(setter, "Expected function for setterGetter");
    var val;
    var desc = {};
    if (getter === undefined){
      desc.get = function(){ return val; };
    } else {
      desc.get = function() {
        return getter(val, obj);
      };
    }
    if ($L.typeCheck.string(setter)){
      setter = $L.parse[setter];
    }
    desc.set = function(newVal){
      var setterInterface = {
        "set": true,
      };
      newVal = setter.apply(setterInterface, [newVal, val, obj]);
      if (setterInterface.set){
        val = newVal;
      }
    };
    Object.defineProperty(obj, name, desc);
  });

  Map.method(Map, function copyProps(copyTo, copyFrom){
    //todo: write tests for this
    var i = 2;
    var l = arguments.length;
    var prop;
    for(; i<l; i+=1){
      prop = arguments[i];
      if (prop[0] === "&"){
        prop = prop.substr(1);
        Object.defineProperty(copyTo, prop, {
          "get": (function(prop){
            return function(){
              return copyFrom[prop];
            }
          })(prop),
          "set": (function(prop){return function(val){copyFrom[prop] = val}})(prop),
        });
      } else {
        copyTo[prop] = copyFrom[prop];
      }
    }
  });

  Map.method($L, function Namespace(fn){
    var self = $L.Map();
    self.namespace = $L.Map();

    Map.method(self, function set(name, value){Object.defineProperty(self.namespace, name, { value: value });});
    Map.method(self, function prop(name, desc){Object.defineProperty(self.namespace, name, desc);});
    Map.method(self, function method(fn){Map.method(self.namespace, fn);});
    Map.method(self, function setterMethod(fn){Map.setterMethod(self.namespace, fn);});
    Map.method(self, function getter(fn){Map.getter(self.namespace, fn);});
    Map.method(self, function setterGetter(name, setter, getter){Map.setterGetter(self.namespace, name, setter, getter);});

    if ($L.typeCheck.function(fn)){
      fn.apply(self);
      return self.namespace;
    }
    return self;
  });

  Map.method($L, function remove(arr, el, start){
    var i = arr.indexOf(el, start);
    if (i > -1) { arr.splice(i, 1); }
  });

  Map.method($L, function each(obj, fn){
    var i;
    if (obj instanceof Array){
      var l = obj.length;
      for(i=0; i<l; i+=1){
        if (fn(i, obj[i])) {return i;}
      }
      return -1;
    } else {
      var keys = Object.keys(obj);
      for(i=keys.length-1; i>=0; i-=1){
        if (fn(keys[i], obj[keys[i]])) {return keys[i];}
      }
    }
  });

  Map.method($L, function ArrayConverter(accessor){
    var arr = [];
    var index = [];
    accessor.each(function(i, obj){
      arr.push(obj);
      index.push(i);
    });

    accessor.on.insert(function(key, accessor){
      arr.push(accessor(key));
      index.push(key);
    });

    accessor.on.remove(function(key, obj, accessor){
      var i = index.indexOf(key);
      index.splice(i,1);
      arr.splice(i,1);
    });

    accessor.on.change(function(key, accessor){
      var i = index.indexOf(key);
      arr[i] = accessor(key);
    });

    return arr;
  });

});
