// > .ModuleName "Obj"
Lapiz.Module("Obj", ["Events"], function($L){

  var _privProto = $L.Map();


  // > obj.properties(props, vals)
  // Sets properties on the public scopes and stores the attributes in
  // priv.attr.
  $L.set.binder(_privProto, function properties(props, vals){
    $L.set.setProperties(this.pub, this.attr, props, vals, this.fire.change);
  });

  // > obj.meth(obj, namedFunc)
  // > obj.meth(obj, name, function)
  // Sets properties on the public scopes and stores the attributes in
  // priv.attr.
  $L.set.binder(_privProto, function meth(name, fn){
    $L.set.meth(this.pub, name, fn);
  });

  // > obj.event(name)
  // Creates an event on an object. It automatically wires it up so that the
  // register function is obj.pub.on[name] and the fire event is obj.fire[name].
  $L.set.binder(_privProto, function event(name){
    this.fire[name] = $L.Event.linkProperty(this.pub.on, name).fire;
  });


  // > obj.setMany(props)
    // Takes a key/value collection (generally a Map or a JavaScript object) and
    // sets those properties in the object.
    /* >
    var obj = Lapiz.Object(function(){
      this.properties({
        "id": "int",
        "name": "string",
        "role": "string"
      });
    });
    obj.setMany({
      "id":12,
      "role": "admin"
    });
    */
    // Another technique is to attach setMany to the public interface
    /* >
    var obj = Lapiz.Object(function(){
      this.properties({
        "id": "int",
        "name": "string",
        "role": "string"
      });
      this.meth(this.setMany);
    }).pub;
    obj.setMany({
      "id":12,
      "role": "admin"
    });
    */
    // After setMany is done, the change event will fire once and array of all
    // the keys that were changed will be passed in.
  $L.set.binder(_privProto, function setMany(props){
    var property, i;
    var keys = Object.keys(props);
    var fireEnabled = this.fire.change.enabled;
    this.fire.change.enabled = false;
    for(i=keys.length-1; i>=0; i-=1){
      property = keys[i];
      // is there a way to check if the property is in the prototype chain?
      this.pub[property] = props[property];
    }
    //todo: add test for fire.enabled = false before and after setAll
    this.fire.change.enabled = fireEnabled;
    this.fire.change(this.pub, keys);
  });

  // > obj = Lapiz.Obj(proto)
  // Returns a Lapiz Object. The returned value is the private scope. The
  // prototype that is passed in will be attached to the public scope.
  // Generally, Obj should not be invoked directly, but through Cls.
  $L.set.meth($L, function Obj(proto){
    var obj = Object.create(_privProto);

    // > obj.pub
    // The public scope of a Lapiz Object. All the properties will be exposed
    // here as well as any public methods.
    obj.attr = $L.Map();

    // > obj.attr  
    // A map holding the private attribute scope of an object. This is where the
    // underlying values for properties are stored.
    obj.pub = Object.create(proto||null);

    _objPriv.set(obj.pub, obj);

    // > obj.fire
    // A map holding the fire controls for the object events.
    obj.fire = $L.Map();

    // > obj.pub.on
    // A map holding the register methods for object event listeners. 
    obj.pub.on = $L.Map();

    // > obj.pub.on.change
    // Fires when the object's properties change

    // > obj.fire.change
    // Fires the change event. It will automatically fire when properties
    // change.
    obj.fire['change'] = $L.Event.linkProperty(obj.pub.on, 'change').fire;

    // > obj.pub.on.remove
    // Fires when an object is being deleted. If you are holding a collection of
    // objects, you should remove the object when this fires to prevent memory
    // leaks or holding onto objects that are considered dead.

    // > obj.fire.remove
    // This should be called if you want to remove an object. It is build in,
    // but nothing is wired up to fire it automatically. It is your
    // responsibility to call it when you want the object deleted
    obj.fire['remove'] = $L.Event.linkProperty(obj.pub.on, 'remove').fire;
    return obj;
  });

  // _classBuilderWM WeakMaps the public classDef to the private data about that
  // class definition.
  var _classBuilderWM = new WeakMap();

  // _objPriv WeakMaps the public scope of an object to the private scope.
  var _objPriv = new WeakMap();

  // > classDef
  // A class definition is the object used to define a Lapiz Class.
  var _clsDefProto = $L.Map();

  // > classDef.properties(props, vals)
  // Defines properties on a class
  $L.set.binder(_clsDefProto, function properties(props){
    var priv = _classBuilderWM.get(this);
    $L.each(props, function(val, key){
      priv.props[key] = val;
    });
  });

  // > classDef.constructor(constructor)
  // Defines the constructor for a class.
  $L.set.binder(_clsDefProto, function constructor(constructor){
    $L.typeCheck.func(constructor, "Constructor for class must be a function");
    _classBuilderWM.get(this).constructor = constructor;
  });

  // > classDef.meth(namedFn)
  // > classDef.meth(name, fn)
  // Defines a method on the class. Methods are late-bound:
  /* >
    var Person = Lapiz.Cls(function(cls){
      cls.meth(function foo(){
        return "FOO"+this.pub.name;
      });
    });

    var adam = Person();
    adam.name = "Adam";
    adam.foo(); // returns "FOOAdam"
  */
  $L.set.binder(_clsDefProto, function meth(name, fn){
    if (fn === undefined){
      fn = name;
      name = $L.getFnName(fn);
    }
    _classBuilderWM.get(this).methods[name] = fn;
  });

  // > classDef.getter(namedFn)
  // > classDef.getter(name, fn)
  // Defines a getter on the class. Getter are late-bound:
  $L.set.binder(_clsDefProto, function getter(name, fn){
    if (fn === undefined){
      fn = name;
      name = $L.getFnName(fn);
    }
    _classBuilderWM.get(this).getters[name] = fn;
  });

  function lateBindProp(proto, name, val){
    var def = $L.Map();
    def[name] = val;
    if (name[0] === "*" || name[0] === "+"){
      name = name.slice(1);
    }
    $L.set.prop(proto, name, {
      get: function(){
        var priv = _objPriv.get(this);
        $L.set.setProperties(this, priv.attr, def, priv.fire.change);
        return this[name];
      },
      set: function(val){
        var vals = $L.Map();
        vals[name] = val;
        var priv = _objPriv.get(this);
        $L.set.setProperties(this, priv.attr, def, vals, priv.fire.change);
      },
    });
  }

  // lateBindMeth wires up the method to the private scope of the object for
  // late binding. Without it, inside of the methods, 'this' would refer to the
  // public scope. While it does create an extra function per method (and extra
  // functions are what we're trying to avoid with late binding), it may seem
  // like a poor approach, but it only creates one extra function per method
  // definition, not per method instance.
  function lateBindMeth(proto, name, fn){
    $L.set(proto, name, function(){
      // in this scope 'this' will be the public scope of an object. This
      // function will only be invoked the first time it is called.
      $L.set.meth(this, name, fn, _objPriv.get(this));
      return this[name].apply(this, arguments);
    });
  }

  function lateBindGetter(proto, name, fn){
    $L.set.prop(proto, name, {
      get: function(){
        var bfn = fn.bind(_objPriv.get(this))
        $L.set.getter(this, name, bfn);
        return bfn();
      }
    });
  }

  var _newClassEvent = $L.Event();
  // > Lapiz.on.Cls(fn)
  // > Lapiz.on.Cls = fn
  // Event registration, event will fire whenever a new Lapiz class is defined.
  $L.Event.linkProperty($L.on, "Cls", _newClassEvent);

  // > Lapiz.Cls( fn(classDef) )
  // Used to define a Lapiz Class. The function passed in will receive a
  // classDef object as both the 'this' object as well as the first argument.
  $L.set.meth($L, function Cls(classDef){
    var pub = Object.create(_clsDefProto); //exposed in classDef call
    var priv = $L.Map();
    priv.props = $L.Map();
    priv.methods = $L.Map();
    priv.getters = $L.Map();
    _classBuilderWM.set(pub, priv);

    classDef.apply(pub,[pub]);

    var _clsProto = $L.Map();
    $L.each(priv.props, function(val, key){
      lateBindProp(_clsProto, key, val);
    });

    $L.each(priv.methods, function(val, key){
      lateBindMeth(_clsProto, key, val);
    });

    $L.each(priv.getters, function(val, key){
      lateBindGetter(_clsProto, key, val);
    });

    var _constr = priv.constructor;

    var constructor = function(){
      var self = Lapiz.Obj(_clsProto);
      if (_constr){
        self = _constr.apply(self, arguments) || self.pub;
      } else {
        self = self.pub;
      }
      _createEvt(self);
      return self;
    };

    constructor.on = $L.Map();
    var _createEvt =  $L.Event.linkProperty(constructor.on, 'create').fire

    _newClassEvent.fire(constructor);
    return constructor;
  });
});