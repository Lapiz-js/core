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
  }
  $L.set($L, "Map", Map);

  // > Lapiz.Map.meth(obj, namedFunc)
  // > Lapiz.Map.meth(obj, name, function)
  // > Lapiz.Map.meth(obj, namedFunc, bind)
  // > Lapiz.Map.meth(obj, name, function, bind)
  // Attaches a method to an object. The method must be a named function.
  /* >
  var x = Lapiz.Map();
  Lapiz.Map.meth(x, function foo(){...});
  x.foo(); //calls foo
  Lapiz.Map.meth(x, "bar", function(){...});
  */
  // Providing a bind value will perminantly set the "this" value inside the
  // method.
  /* >
  var x = Lapiz.Map();
  x.name = "Test";
  Lapiz.Map.meth(x, function foo(){
    console.log(this.name);
  }, x);
  var y = Lapiz.Map();
  y.bar = x.foo;
  y.bar(); // calls x.foo with this set to x
  */
  $L.set(Map, function meth(obj, name, fn, bind){
    if (name === undefined && $L.typeCheck.func(obj)){
      // common special case: user forgot obj, attached named function
      // we can provide a very specific and helpful error
      $L.Err['throw']("Meth called without object: "+obj.name);
    }
    if ($L.typeCheck.func(fn) && $L.typeCheck.string(name)){
      $L.assert(name !== "", "Meth name cannot be empty string");
    } else if ($L.typeCheck.func(name) && name.name !== ""){
      bind = fn;
      fn = name;
      name = fn.name;
    } else {
      Lapiz.Err['throw']("Meth requires either name and func or named function");
    }
    if (bind !== undefined){
      fn = fn.bind(bind);
    }
    $L.set(obj, name, fn);
  });

  // > Lapiz.Map.prop(obj, name, desc)
  // Just a wrapper around Object.defineProperty
  Map.meth(Map, function prop(obj, name, desc){
    Object.defineProperty(obj, name, desc);
  });

  // > Lapiz.Map.setterMethod(obj, namedSetterFunc)
  // > Lapiz.Map.setterMethod(obj, name, setterFunc)
  // > Lapiz.Map.setterMethod(obj, namedSetterFunc, bind)
  // > Lapiz.Map.setterMethod(obj, name, setterFunc, bind)
  // Attaches a setter method to an object. The method must be a named function.
  /* >
  var x = Lapiz.Map();
  Lapiz.Map.meth(x, function foo(val){...});

  //these two calls are equivalent
  x.foo("bar");
  x.foo = "bar";
  */
  // If an object is supplied for bind, the "this" value will always be the bind
  // object, this can be useful if the method will be passed as a value.
  Map.meth(Map, function setterMethod(obj, name, fn, bind){
    if (name === undefined && $L.typeCheck.func(obj)){
      Lapiz.Err['throw']("SetterMethod called without object: "+obj.name);
    }
    if ($L.typeCheck.func(fn) && $L.typeCheck.string(name)){
      $L.assert(name !=="", "SetterMethod name cannot be empty string");
    } else if ($L.typeCheck.func(name) && name.name !== ""){
      bind = fn;
      fn = name;
      name = fn.name;
    } else {
      Lapiz.Err['throw']("SetterMethod requires either name and func or named function");
    }
    if (bind !== undefined){
      fn = fn.bind(bind);
    }
    Map.prop(obj, name, {
      "get": function(){ return fn; },
      "set": fn
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
      Lapiz.Err['throw']("Getter called without object: "+obj.name);
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
      Lapiz.Err['throw']("Getter requires either name and func or named function");
    }
    Map.prop(obj, name, {"get": fn} );
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
      var setterInterface = {"set": true};
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
            };
          })(prop),
          "set": (function(prop){
            return function(val){
              copyFrom[prop] = val;
            };
          })(prop)
        });
      } else {
        copyTo[prop] = copyFrom[prop];
      }
    }
  });

  // > Lapiz.Map.getterFactory(attr, property)
  // > Lapiz.Map.getterFactory(attr, func)
  // Used in generating properties on an object or namespace.
  Map.meth(Map, function getterFactory(attr, funcOrProp){
    if ($L.typeCheck.func(funcOrProp)) { return funcOrProp; }
    if ($L.typeCheck.string(funcOrProp)) { return function(){ return attr[funcOrProp]; }; }
    Lapiz.Err.throw("Getter value for property must be either a function or string");
  });

  // > Lapiz.Map.setterFactory(self, attr, field, func)
  // > Lapiz.Map.setterFactory(self, attr, field, func, callback)
  // Used in generating setters for objects or namespaces. It will create the
  // setterInterface which provides special controls to setters and call the
  // setter with the interface as "this". If setterInterface.set is true,
  // the returned value will be set in attr[field]. If callback is defined,
  // self will be passed into callback
  Map.meth(Map, function setterFactory(self, attr, field, func, callback){
    if ($L.typeCheck.string(func)){
      func = $L.parse(func);
    }
    return function(){
      //todo: add test for fireChange and event
      // > lapizObject.properties:setterInterface
      // The 'this' property of a setter will be the setter interface
      var setterInterface = {
        // > lapizObject.properties:setterInterface.set
        // Setting this to false will prevent the set and event fire
        set: true,
        // > lapizObject.properties:fire
        // setting this to false will prevent the fire event, but the value
        // will still be set to the return value
        fire: true,
        // > lapizObject.properties:setterInterface.event(obj.pub, val, oldVal)
        // Attaching an event here will cause this event to be fired after the
        // set operation
        callback: undefined,
      };
      var val = func.apply(setterInterface, arguments);
      if (setterInterface.set) {
        var oldVal = attr[field];
        attr[field] = val;
        if (setterInterface.fire && $L.typeCheck.func(callback)) {callback(self, field);}
        if ($L.typeCheck.func(setterInterface.callback)) {setterInterface.callback(self, field, val, oldVal);}
      }
    };
  });

  var _setReadOnly = function(){ $L.Err.throw("Cannot set readonly property"); };

  // > Lapiz.Map.setProperties(obj, attr, properties, values)
  // > Lapiz.Map.setProperties(obj, attr, properties)
  // Defines properties on an object and puts the underlying value in the
  // attributes collection.
  Map.meth(Map, function setProperties(obj, attr, properties, values){
    if (obj === undefined){
      $L.Err.throw("Got undefined for obj in setProperties");
    }
    var property, val, i, desc, getterProp, setterFn;
    var keys = Object.keys(properties);
    for(i=keys.length-1; i>=0; i-=1){
      property = keys[i];
      val = properties[property];
      desc = {};

      // If the property name begins with *, it is a getter, the setter will not
      // be defined on obj.
      getterProp = false;
      if (property[0] === "*"){
        property = property.slice(1);
        getterProp = true;
      }

      if (val === undefined || val === null){
        $L.Err.throw("Invalid value for '" + property + "'");
      } else if ($L.typeCheck.func(val) || $L.typeCheck.string(val)){
        desc.set = Map.setterFactory(obj, attr, property, val);
        desc.get = Map.getterFactory(attr, property);
      } else if (val.set !== undefined || val.get !== undefined) {
        if (val.set !== undefined){
          desc.set = Map.setterFactory(obj, attr, property, val.set);
        }
        desc.get = (val.get !== undefined) ? Map.getterFactory(obj, val.get) : Map.getterFactory(obj, property);
      } else {
        $L.Err.throw("Could not construct getter/setter for " + property);
      }

      // If this is a getter, we grab the setter before removing it. This allows
      // the setProperties method to be used in a set-once manor.
      setterFn = desc.set;
      if (getterProp) {
        desc.set = _setReadOnly;
      }

      Object.defineProperty(obj, property, desc);
      if (Object.hasOwnProperty.call(values, property) ){
        setterFn(values[property]);
      }
    }
  });

  // > Lapiz.Map.binder(proto, fn)
  // Handles late binding for prototype methods
  /* >
  var fooProto = {};
  binder(fooProto, function sayHi(){
    console.log("Hi, "+name);
  });
  var x = {};
  x.__proto__ = fooProto;
  var sh = x.sayHi;
  x.name = "Adam";
  sh(); // Hi, Adam
  */
  // This approach balances two concerns. Without binding, we need to eliminate
  // the use of 'this' with closures, which can add boilerplate code. But
  // without leveraging prototypes, we can create a lot of uncessary functions.
  // With late binding, 'this' will always refer to the original 'this' context,
  // but bound functions will only be generated when they are called or assigned
  Map.meth(Map, function binder(proto, fn){
    Object.defineProperty(proto, fn.name, {
      get: function(){
        var bfn = fn.bind(this)
        $L.Map.meth(this, bfn)
        return bfn;
      },
      set: function(){ $L.Err.throw("Cannot reassign method "+fn.name); },
    });
  });

  // This section builds up the namespace prototype
  var _nsProto = Map();

  // > namespace.properties(props, vals)
  Map.binder(_nsProto, function properties(props, vals){
    Map.setProperties(this.namespace, this.attr, props, vals);
  });

  // > namespace.meth(namedFn)
  // > namespace.meth(name, fn)
  Map.binder(_nsProto, function meth(name, fn){
    if (fn === undefined){
      $L.Map.meth(this.namespace, name, this);
    } else {  
      $L.Map.meth(this.namespace, name, fn, this);
    }
  });

  // > namespace.set(name, val)
  Map.binder(_nsProto, function set(name, val){
    Object.defineProperty(this.namespace, name, {'value': val});
  });

  // > namespace.setterMethod(namedFn)
  // > namespace.setterMethod(name, fn)
  Map.binder(_nsProto, function setterMethod(name, fn){
    if (fn === undefined){
      $L.Map.setterMethod(this.namespace, name, this);
    } else {  
      $L.Map.setterMethod(this.namespace, name, fn, this);
    }
  });

  // > Lapiz.Namespace()
  // > Lapiz.Namespace(constructor)
  // Returns a namespace. If a constructor is given, the inner namespace is
  // returned, otherwise the namespace wrapper is returned.
  $L.set($L, function Namespace(fn){
    var self = Object.create(_nsProto);
    self.__proto__ = _nsProto;

    // > namespace.namespace
    // The inner namespace is where all methods and properties are attached, the
    // outer wrapper holds the tools for attaching these.
    $L.set(self, 'namespace', $L.Map());

    // > namespace.attr
    // This is where the attributes for properties are stored.
    $L.set(self, 'attr', $L.Map());

    if ($L.typeCheck.func(fn)){
      fn.call(self);
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
    if ($L.typeCheck.array(obj)){
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
    return undefined; //makes linter happy
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
