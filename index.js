Lapiz.Module("Index", function($L){
  $L.Index = function(cls, primaryFunc, domain){
    if (primaryFunc === undefined){
      primaryFunc = function(obj){return obj.id;};
    } else if (typeof primaryFunc === "string"){
      primaryFunc = function(field){
        return function(obj){
          return obj[field];
        };
      }(primaryFunc);
    } else if ( !(primaryFunc instanceof  Function) ){
      throw("Expected a function or string");
    }
    
    if (domain === undefined) {
      domain = cls;
    } else {
      cls[domain] = {};
      domain = cls[domain];
    }

    var _primary = $L.Dictionary();

    domain.each = _primary.each;
    domain.has = _primary.has;
    domain.Filter = _primary.Filter;
    domain.Sort = _primary.Sort;
    domain.remove = _primary.remove;

    Object.defineProperty(domain, "keys",{
      get: function(){ return _primary.keys; }
    });
    Object.defineProperty(domain, "all",{
      get: function(){ return _primary.Accessor; }
    });

    function _upsert(obj){
      _primary(primaryFunc(obj), obj);
    }

    cls.on.create(function(obj){
      obj.on.change(_upsert);
      obj.on["delete"](function(obj){
        obj.on.change.deregister(_upsert);
        _primary.remove(primaryFunc(obj));
      });
      _upsert(obj);
    });

    domain.get = function(idFuncOrAttr, val){
      var matches = {};
      if (val !== undefined){
        _primary.each(function(key, obj){
          if (obj[idFuncOrAttr] === val) { matches[key] = obj; }
        });
        return matches;
      } else if (idFuncOrAttr instanceof Function){
        _primary.each(function(key, obj){
          if (idFuncOrAttr(obj)) { matches[key] = obj; }
        });
        return matches;
      }
      return _primary(idFuncOrAttr);
    };
  };
});
