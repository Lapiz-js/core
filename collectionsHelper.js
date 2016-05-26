Lapiz.Module("Collections", function($L){
  // > Lapiz.Map()
  // Returns a key value store that inherits no properties or methods. Useful to
  // bypass calling "hasOwnProperty". This is just a wrapper around
  // Object.create(null);
  //
  // Lapiz.Map also serves as a namespace for the following helper methods.
  // They can be called on any object. They all use Object.defineProperty to
  // create a proptery that cannot be overridden.
  function Map(){
    return Object.create(null);
  };
  $L.set($L, "Map", Map);

  // > Lapiz.Map.meth(obj, namedFunc)
  // Attaches a method to an object. The method must be a named function.
  /* >
  var x = Lapiz.Map();
  Lapiz.Map.meth(x, function foo(){...});
  x.foo(); //calls foo
  */
  $L.set(Map, "meth", function(obj, name, fn){
    if (name === undefined && $L.typeCheck.func(obj)){
      $L.Err.throw("Meth called without object: "+obj.name);
    }
    if ($L.typeCheck.func(fn) && $L.typeCheck.string(name)){
      $L.assert(name !=="", "Meth name cannot be empty string");
    } else if ($L.typeCheck.func(name) && name.name !== ""){
      fn = name;
      name = fn.name;
    } else {
      Lapiz.Err.throw("Meth requires either name and func or named function");
    }
    $L.set(obj, name, fn);
  });

  // > Lapiz.Map.prop(obj, name, desc)
  // Just a wrapper around Object.defineProperty
  Map.meth(Map, function prop(obj, name, desc){
    Object.defineProperty(obj, name, desc);
  });

  // > Lapiz.Map.setterMethod(obj, namedSetterFunc)
  // Attaches a setter method to an object. The method must be a named function.
  /* >
  var x = Lapiz.Map();
  Lapiz.Map.meth(x, function foo(val){...});

  //these two calls are equivalent
  x.foo("bar");
  x.foo = "bar";
  */
  Map.meth(Map, function setterMethod(obj, name, fn){
    if (name === undefined && $L.typeCheck.func(obj)){
      Lapiz.Err.throw("SetterMethod called without object: "+obj.name);
    }
    if ($L.typeCheck.func(fn) && $L.typeCheck.string(name)){
      $L.assert(name !=="", "SetterMethod name cannot be empty string");
    } else if ($L.typeCheck.func(name) && name.name !== ""){
      fn = name;
      name = fn.name;
    } else {
      Lapiz.Err.throw("SetterMethod requires either name and func or named function");
    }
    Map.prop(obj, name, {
      "get": function(){ return fn; },
      "set": fn,
    });
  });

  // > Lapiz.Map.has(obj, field)
  // Wrapper around Object.hasOwnProperty, useful for maps.
  Map.meth(Map, function has(obj, field){
    return Object.hasOwnProperty.call(obj, field);
  });

  // > Lapiz.Map.getter(object, namedGetterFunc() )
  // > Lapiz.Map.getter(object, name, getterFunc() )
  // > Lapiz.Map.getter(object, [namedGetterFuncs...] )
  // > Lapiz.Map.getter(object, {name: getterFunc...} )
  // Attaches a getter method to an object. The method must be a named function.
  /* >
  var x = Lapiz.Map();
  var ctr = 0;
  Lapiz.Map.getter(x, function foo(){
    var c = ctr;
    ctr +=1;
    return c;
  });
  console.log(x.foo); //0
  console.log(x.foo); //1
  */
  Map.meth(Map, function getter(obj, name, fn){
    if (name === undefined && $L.typeCheck.func(obj)){
      Lapiz.Err.throw("Getter called without object: "+obj.name);
    }
    if ($L.typeCheck.func(fn) && $L.typeCheck.string(name)){
      $L.assert(name !=="", "Getter name cannot be empty string");
    } else if ($L.typeCheck.func(name) && name.name !== ""){
      fn = name;
      name = fn.name;
    } else if ($L.typeCheck.array(name)){
      $L.each(name, function(getterFn){
        Map.getter(obj, getterFn);
      });
      return;
    } else if ($L.typeCheck.obj(name)){
      $L.each(name, function(getterFn, name){
        Map.getter(obj, name, getterFn);
      });
      return;
    } else {
      Lapiz.Err.throw("Getter requires either name and func or named function");
    }
    Map.prop(obj, name, {"get": fn,} );
  });

  // > Lapiz.Map.setterGetter(obj, name, val, setterFunc, getterFunc)
  // > Lapiz.Map.setterGetter(obj, name, val, setterFunc)
  // Creates a setter/getter property via a closure. A setter function is
  // required, if no getter is provided, the value will be returned. This is the
  // reason the method is named setterGetter rather than the more traditional
  // arrangement of "getterSetter" because the arguments are arranged so that
  // the first 4 are required and the last is optional.
  /* >
  var x = Lapiz.Map();
  Lapiz.Map.setterGetter(x, "foo", 12, function(i){return parseInt(i);});
  console.log(x.foo); // will log 12 as an int
  */
  // The value 'this' is always set to a special setterInterface for the setter
  // method. This can be used to cancel the set operation;
  /* >
  var x = Lapiz.Map();
  Lapiz.Map.setterGetter(x, "foo", 0, function(i){
    i = parseInt(i);
    this.set = !isNaN(i);
    return i;
  });

  x.foo = "12";
  console.log(x.foo); // will log 12 as an int
  x.foo = "hello";
  console.log(x.foo); // value will still be 12

  */
  Map.meth(Map, function setterGetter(obj, name, val, setter, getter){
    if ($L.typeCheck.string(setter)){
      setter = $L.parse(setter);
    }
    $L.typeCheck.func(setter, "Expected function or string reference to parser for setterGetter (argument 4)");
    var desc = {};
    if (getter === undefined){
      desc.get = function(){ return val; };
    } else {
      $L.typeCheck.func(getter, "Getter must be undefined or a function");
      desc.get = function() {
        return getter(val, obj);
      };
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
    Map.prop(obj, name, desc);
  });

  // > Lapiz.Map.copyProps(copyTo, copyFrom, props...)
  // Copies the properties from the copyFrom object to the copyTo obj. The
  // properties should be strings. By default, the property will be copied with
  // basic assignment. If the property is preceeded by &, it will be copied by
  // reference.
  /* >
  var A = {"x": 12, "y": "foo", z:[]};
  var B = {};
  Lapiz.Map.copyProps(B, A, "x", "&y");
  A.x = 314;
  console.log(B.x); // 12
  B.y = "Test";
  console.log(A.y); // Test
  */
  Map.meth(Map, function copyProps(copyTo, copyFrom){
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

  // > Lapiz.Namespace()
  // > Lapiz.Namespace(constructor)
  // Namespace is a closure around all of the Map methods (plus Lapiz.set). It
  // provides syntactic sugar so that the obj argument doesn't need to be
  // supplied each time.
  //
  // The constructor is optional. If not given the outer layer of the namespace
  // is returned.
  /* >
  var x = Lapiz.Namespace();
  x.set("foo", "bar");
  x.meth(function sayHello(name){
    console.log("Hello, "+name);
  });
  console.log(x.namespace.foo); // bar
  x.namespace.sayHello("World"); // Hello, World
  */
  // If a constructor is provided, it will be invoked with "this" as the outer
  // layer of the namespace and will return in the inner namespace.
  /* >
  var x = Lapiz.Namespace(function(){
    this.set("foo", "bar");
    this.meth(function sayHello(name){
      console.log("Hello, "+name);
    });
  });

  console.log(x.foo); // bar
  x.sayHello("World"); // Hello, World
  */
  // * namespace.set(name, value)
  // * namespace.prop(name, desc)
  // * namespace.meth(namedFunc)
  // * namespace.setterMethod(namedSetterFunc)
  // * namespace.getter(namedGetterFunc)
  // * namespace.setterGetter(name, val, setter, getter)
  // * namespace.setterGetter(name, val, setter)
  Map.meth($L, function Namespace(fn){
    var self = $L.Map();
    self.namespace = $L.Map();

    Map.meth(self, function set(name, value){Map.prop(self.namespace, name, { value: value });});
    Map.meth(self, function prop(name, desc){Map.prop(self.namespace, name, desc);});
    Map.meth(self, function meth(name, fn){Map.meth(self.namespace, name, fn);});
    Map.meth(self, function setterMethod(name, fn){Map.setterMethod(self.namespace, name, fn);});
    Map.meth(self, function getter(name, fn){Map.getter(self.namespace, name, fn);});
    Map.meth(self, function setterGetter(name, val, setter, getter){Map.setterGetter(self.namespace, name, val, setter, getter);});

    if ($L.typeCheck.func(fn)){
      fn.apply(self);
      return self.namespace;
    }
    return self;
  });

  // > Lapiz.remove(arr, el, start)
  // > Lapiz.remove(arr, el)
  // Removes the one instance of the given element from the array. If start is
  // not specified, it will be the first instance, otherwise it will be the
  // first instance at or after start.
  /* >
  var arr = [3,1,4,1,5,9];
  Lapiz.remove(arr,1);
  console.log(arr); //[3,4,1,5,9]
  */
  Map.meth($L, function remove(arr, el, start){
    var i = arr.indexOf(el, start);
    if (i > -1) { arr.splice(i, 1); }
  });

  // > Lapiz.each(collection, fn(val, key, collection))
  // Iterates over the collection, calling func(key, val) for each item in the
  // collection. If the collection is an array, key will be the index. If func
  // returns true (or an equivalent value) the Lapiz.each will return the
  // current key allowing each to act as a search.
  /* >
  var arr = [3,1,4,1,5,9];
  Lapiz.each(arr, function(val, key){
    console.log(key, val);
  });
  var gt4 = Lapiz.each(arr, function(val, key){return val > 4;});

  var kv = {
    "A":"apple",
    "B":"banana",
    "C":"cantaloupe"
  };
  Lapiz.each(kv, function(val, key){
    console.log(key, val);
  });
  */
  Map.meth($L, function each(obj, fn){
    var i;
    if (obj instanceof Array){
      var l = obj.length;
      for(i=0; i<l; i+=1){
        if (fn(obj[i], i)) {return i;}
      }
      return -1;
    } else {
      var keys = Object.keys(obj);
      for(i=keys.length-1; i>=0; i-=1){
        if (fn(obj[keys[i]], keys[i], obj)) {return keys[i];}
      }
    }
  });

  // > Lapiz.ArrayConverter(accessor)
  // Takes an accessor and provides an array. The events on the accessor will be
  // used to keep the array up to date. However, if the array is modified, the
  // results can be unpredictable. This primarily provided as a tool for
  // interfacing with other libraries and frameworks. Use the accessor interface
  // whenever possible.
  Map.meth($L, function ArrayConverter(accessor){
    var arr = [];
    var index = [];
    accessor.each(function(obj, key){
      arr.push(obj);
      index.push(key);
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
