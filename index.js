// > .ModuleName "Index"
Lapiz.Module("Index", ["Collections"], function($L){
  // > Lapiz.Index(lapizClass)
  // > Lapiz.Index(lapizClass, primaryFunc)
  // > Lapiz.Index(lapizClass, primaryField)
  // > Lapiz.Index(lapizClass, primary, domain)
  // Adds an index to a class. If class.on.change and class.on.remove exist,
  // the index will use these to keep itself up to date.
  //
  // Index needs a primary key. Any to entries with the same primary key are
  // considered equivalent and one will overwrite the other. By default, Index
  // assumes a primary property of "id". To use another field, pass in a string
  // as primaryField. To generate a primary key from the data in the object,
  // pass in a function as primaryFunc.
  //
  // By default, the Index methods will be attached directly to the class. If
  // this would cause a namespace collision, a string can be provided as a
  // domain and all methods will be attached in that namespace.
  //
  // The class does not have to be a lapizClass, but it must have a similar
  // interface. Specifically, it must have cls.on.change and the instances of
  // the class must have obj.on.change and obj.on.remove.
  $L.set($L, "Index", function(cls, primaryFunc, domain){
    if (primaryFunc === undefined){
      primaryFunc = function(obj){return obj[$L.Index.defaultPrimary];};
    } else if ($L.typeCheck.str(primaryFunc)){
      primaryFunc = function(field){
        return function(obj){
          return obj[field];
        };
      }(primaryFunc);
    } else if ( !$L.typeCheck.func(primaryFunc) ){
      Lapiz.Err.toss("Expected a function or string");
    }

    if (domain === undefined) {
      domain = cls;
    } else {
      cls[domain] = $L.Map();
      domain = cls[domain];
    }

    var _primary = $L.Dictionary();

    // > indexedClass.each( function(val, key))
    domain.each = _primary.each;

    // > indexedClass.has(key)
    domain.has = _primary.has;

    // > indexedClass.Filter(filterFunc)
    // > indexedClass.Filter(filterField, val)
    domain.Filter = _primary.Filter;

    // > indexedClass.Sort(sortFunc)
    // > indexedClass.Sort(sortField)
    domain.Sort = _primary.Sort;

    // > indexedClass.remove(key)
    domain.remove = _primary.remove;

    // > indexedClass.keys
    Object.defineProperty(domain, "keys",{
      get: function(){ return _primary.keys; }
    });

    // > indexedClass.all
    Object.defineProperty(domain, "all",{
      get: function(){ return _primary.Accessor; }
    });

    function _upsert(obj){
      _primary(primaryFunc(obj), obj);
    }

    // > indexedClass.exclude
    // This can be set to a function that takes an instance of the class and
    // returns a boolean. If it returns true then the object will not be
    // indexed.

    cls.on.create(function(obj){
      if ($L.typeCheck.nested(domain, "exclude", "func") && domain.exclude(obj)) {
        return;
      }
      obj.on.change(_upsert);
      obj.on.remove(function(obj){
        if ($L.typeCheck.nested(obj, "on", "change", "deregister", "func")){
          obj.on.change.deregister(_upsert);
        }
        _primary.remove(primaryFunc(obj));
      });
      _upsert(obj);
    });

    // > indexedClass.get(primaryKey)
    // > indexedClass.get(field, val)
    domain.get = function(idFuncOrAttr, val){
      var matches = {};
      if (val !== undefined){
        _primary.each(function(obj, key){
          if (obj[idFuncOrAttr] === val) { matches[key] = obj; }
        });
        return matches;
      } else if (idFuncOrAttr instanceof Function){
        _primary.each(function(obj, key){
          if (idFuncOrAttr(obj)) { matches[key] = obj; }
        });
        return matches;
      }
      return _primary(idFuncOrAttr);
    };

    return cls;
  });

  // > Lapiz.Index.Class(constructor, primaryFunc, domain)
  // Shorthand helper, constructor for an indexed class.
  $L.set.meth($L.Index, function Cls(constructor, primaryFunc, domain){
    return Lapiz.Index(Lapiz.Cls(constructor), primaryFunc, domain);
  });

  // > Lapiz.Index.defaultPrimary
  // Sets the default primary key name. It defaults to "id".
  $L.Index.defaultPrimary = "id";

});
