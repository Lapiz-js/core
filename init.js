var Lapiz = (function($L) {
  return $L || Object.create(null);
}(Lapiz));

// > Lapiz.Module(moduleName, moduleFunction(Lapiz))
// > Lapiz.Module(moduleName, [dependencies...], moduleFunction(Lapiz))
// The module loader is useful when building Lapiz modules. It will invoke the
// moduleFunction and pass in Lapiz when all dependencies have been loaded. The
// moduleName is only used for dependency management.
/* >
Lapiz.Module("Foo", ["Events"], function($L){
  $L.set($L, "foo", "bar");
});
*/
var Lapiz = (function ModuleLoaderModule($L){
  var _loaded = Object.create(null);
  var _pending = [];

  function _checkReqs(reqs){
    var notLoaded = [];
    var i;
    for(i=0; i<reqs.length; i++){
      if (_loaded[reqs[i]] === undefined){
        notLoaded.push(reqs[i]);
      }
    }
    return notLoaded;
  };

  // > Lapiz.set(obj, name, value)
  // Defines a fixed propery on an object. Properties defined this way cannot be
  // overridden.
  /* >
  var x = {};
  x.foo = function(){...};
  //somewhere else
  x.foo = 12; //the method is now gone

  var y = {};
  Lapiz.set(y, "foo", function{...});
  y.foo = 12; // this will not override the method
  */
  function set(obj, name, value){
    Object.defineProperty(obj, name, { value: value });
  }
  set($L, "set", set);

  function _updatePending(name){
    var i, pending, idx;
    var stillPending = [];
    var ready = [];
    for(i=0; i<_pending.length; i++){
      pending = _pending[i];
      idx = pending.reqs.indexOf(name);
      if (idx !== -1){
        pending.reqs.splice(idx,1);
      }
      if (pending.reqs.length === 0){
        ready.push(pending);
      } else {
        stillPending.push(pending);
      }
    }
    _pending = stillPending;
    for(i=0; i<ready.length; i++){
      ready[i].module($L);
      _loaded[ready[i].name] = true;
      _updatePending(ready[i].name);
    }
  }

  $L.set($L, "Module", function(name, reqs, module){
    //Not doing detailed checks here. If you're writing a module, you should be able to load it correctly.
    if (module === undefined){
      module = reqs;
      reqs = [];
    }

    reqs = _checkReqs(reqs);
    if (reqs.length === 0){
      module($L);
      _loaded[name] = true;
      _updatePending(name);
    } else {
      _pending.push({
        module: module,
        name: name,
        reqs: reqs
      });
    }
  });

  // > Lapiz.Module.Loaded
  // Returns all the modules that have been loaded
  Object.defineProperty($L.Module, "Loaded",{
    "get": function(){
      return Object.keys(_loaded);
    }
  });
  Object.freeze(self.Module);

  // > Lapiz.typeCheck(obj, type)
  // > Lapiz.typeCheck(obj, type, err)
  // Checks if the type of obj matches type. If type is a string, typeof will be
  // used, if type is a class, instanceof will be used. To throw an error when
  // the types do not match, specify err as a string. Other wise, typeCheck will
  // return a boolean indicating if the types matched.
  /* >
  Lapiz.typeCheck([], Array); // true
  Lapiz.typeCheck("test", "string"); // true
  Lapiz.typeCheck("test", Array); // false
  Lapiz.typeCheck([], "string", "Expected string"); // throws an error
  */
  $L.set($L, "typeCheck", function(obj, type, err){
    var typeCheck = (typeof type === "string") ? (typeof obj === type) : (obj instanceof type);
    if (err !== undefined && !typeCheck){
      throw new Error(err);
    }
    return typeCheck;
  });

  // > Lapiz.typeCheck.func(obj)
  // > Lapiz.typeCheck.func(obj, err)
  // Checks if the object is a function. If a string is supplied for err, it
  // will throw err if obj is not a function.
  $L.set($L.typeCheck, "func", function(obj, err){return $L.typeCheck(obj, Function, err)});

  // > Lapiz.typeCheck.array(obj)
  // > Lapiz.typeCheck.array(obj, err)
  // Checks if the object is a array. If a string is supplied for err, it
  // will throw err if obj is not an array.
  $L.set($L.typeCheck, "array", function(obj, err){return $L.typeCheck(obj, Array, err)});

  // > Lapiz.typeCheck.string(obj)
  // > Lapiz.typeCheck.string(obj, err)
  // Checks if the object is a string. If a string is supplied for err, it
  // will throw err if obj is not an string.
  $L.set($L.typeCheck, "string", function(obj, err){return $L.typeCheck(obj, "string", err)});

  // > Lapiz.typeCheck.number(obj)
  // > Lapiz.typeCheck.number(obj, err)
  // Checks if the object is a number. If a string is supplied for err, it
  // will throw err if obj is not an number.
  $L.set($L.typeCheck, "number", function(obj, err){return $L.typeCheck(obj, "number", err)});

  // > Lapiz.typeCheck.nested(obj, nestedFields..., typeCheckFunction)
  // > Lapiz.typeCheck.nested(obj, nestedFields..., typeCheckFunctionName)
  // Checks that each nested field exists and that the last field matches the function type.
  // So this:
  // > if (collection.key !== undefined && collection.key.on !== undefined && Lapiz.typeCheck.func(collection.key.on.change)){
  // becomes:
  // > if (Lapiz.typeCheck.nested(collection, "key", "on", "change", "func")){
  $L.set($L.typeCheck, "nested", function(){
    var args = Array.prototype.slice.call(arguments);
    $L.assert(args.length >= 2, "Lapiz.typeCheck.nested requres at least 2 arguments");
    var typeCheckFn = args.pop();
    typeCheckFn = $L.typeCheck.string(typeCheckFn) ? $L.typeCheck[typeCheckFn] : typeCheckFn;
    $L.typeCheck.func(typeCheckFn, "Last argument to Lapiz.typeCheck.nested must be a function");
    var obj;
    for(obj = args.shift(); obj !== undefined && args.length > 0 ; obj = obj[args.shift()]);
    return typeCheckFn(obj);
  });

  // > Lapiz.assert(bool, err)
  // If bool evaluates to false, an error is thrown with err.
  $L.set($L, "assert", function(bool, err){
    if (!bool){
      throw new Error(err);
    }
  });

  return $L;
})(Lapiz);
