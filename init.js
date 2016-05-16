/**
 * @namespace Lapiz
 */
var Lapiz = (function($L) {
  return $L || Object.create(null);
}(Lapiz));

/**
 * @namespace ModuleLoaderModule
 * @memberof Lapiz
 *
 * Loads modules into Lapiz, allowing them to declare dependencies
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

  $L.Module.Loaded = function(){
    return Object.keys(_loaded);
  };
  Object.freeze(self.Module);

  $L.set($L, "typeCheck", function(obj, type, err){
    var typeCheck = (typeof type === "string") ? (typeof obj === type) : (obj instanceof type);
    if (err !== undefined && !typeCheck){
      throw new Error(err);
    }
    return typeCheck;
  });
  $L.set($L.typeCheck, "function", function(obj, err){return $L.typeCheck(obj, Function, err)});
  $L.set($L.typeCheck, "array", function(obj, err){return $L.typeCheck(obj, Array, err)});
  $L.set($L.typeCheck, "string", function(obj, err){return $L.typeCheck(obj, "string", err)});
  $L.set($L.typeCheck, "number", function(obj, err){return $L.typeCheck(obj, "number", err)});

  $L.set($L, "assert", function(bool, err){
    if (!bool){
      throw new Error(err);
    }
  });

  return $L;
})(Lapiz);
