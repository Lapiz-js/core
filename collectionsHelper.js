Lapiz.Module("Collections", function($L){
  $L.each = function(obj, fn){
    var i;
    if (obj instanceof Array){
      var l = obj.length;
      for(i=0; i<l; i+=1){
        if (fn(i, obj[i])) {return i;}
      }
    } else {
      var keys = Object.keys(obj);
      for(i=keys.length-1; i>=0; i-=1){
        if (fn(keys[i], obj[keys[i]])) {return keys[i];}
      }
    }
    return null;
  };

  $L.remove = function(arr, el){
    var i = arr.indexOf(el);
    if (i > -1) { arr.splice(i, 1); }
  }

  $L.ArrayConverter = function(accessor){
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
  };

  $L.Map = function(){
    return Object.create(null);
  }

  $L.Namespace = function(){
    var self = $L.Map();
    self.namespace = $L.Map();
    function set(name, value){
      Object.defineProperty(self.namespace, name, { value: value });
    }
    function method(fn){
      if (typeof fn !== "function") {
        throw new Error("Expected function");
      }
      if (fn.name === ""){
        throw new Error("Methods require named functions");
      }
      self.set(fn.name, fn);
    }
    Object.defineProperty(self, "set", { value: set });
    Object.defineProperty(self, "method", { value: method });
    return self;
  }
});
