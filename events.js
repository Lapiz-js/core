// > .ModuleName "Events"
Lapiz.Module("Events", ["Collections"], function($L){

  // > Lapiz.Event()
  /* >
  var event = Lapiz.Event();
  e.register(function(val){
    console.log(val);
  });
  var fn2 = function(val){
    alert(val);
  };
  e.register = fn2;
  e.fire("Test 1"); //will log "Test 1" to the console and pop up an alert
  e.register.deregister(fn2);
  e.fire("Test 2"); //will log "Test 2" to the console
  */
  $L.set($L, "Event", function(){
    var _listeners = [];
    var event = Lapiz.Map();

    // > event.register(fn)
    // > event.register = fn
    // The event.register method takes a function. All registered functions will
    // be called when the event fires.
    $L.set.setterMethod(event, function register(fn){
      $L.typeCheck.func(fn, "Event registration requires a function");
      _listeners.push(fn);
      return fn;
    });

    // > event.register.deregister(fn)
    // > event.register.deregister = fn
    // The event.register.deregister method takes a function. If that function
    // has been registered with the event, it will be removed.
    $L.set.setterMethod(event.register, function deregister(fn){
      $L.remove(_listeners, fn);
      return fn;
    });


    // > event.register.length
    // The event.register.length is a read-only property that returns the number
    // of listeners registered with the event.
    $L.set.getter(event.register, function length(){ return _listeners.length; });

    // > event.fire(args...)
    // The event.fire method will call all functions that have been registered
    // with the event. The arguments that are passed into fire will be passed
    // into the registered functions.
    $L.set.meth(event, function fire(){
      if (!event.fire.enabled) { return event; }
      var i;
      // make a copy in case _listeners changes during fire event
      var listeners = _listeners.slice(0);
      var l = listeners.length;
      for(i=0; i<l; i+=1){
        listeners[i].apply(this, arguments);
      }
      return event;
    });

    // > event.fire.enabled
    // > event.fire.enabled = x
    // The event.enabled is a boolean that can be set to enable or disable the
    // fire method. If event.fire.enable is false, even if event.fire is called,
    // it will not call the registered functions.
    $L.set.setterGetter(event.fire, "enabled", true, function(enable){ return !!enable; });

    $L.set(event, "_cls", $L.Event);

    return event;
  });

  // > Lapiz.SingleEvent()
  // A single event is an instance that will only fire once. Registering a
  // function after the event has fired will result in the function being
  // immedatly invoked with the arguments that were used when the event fired.
  $L.set($L, "SingleEvent", function(){
    var _event = $L.Event();
    var _hasFired = false;
    var _args;
    var facade = $L.Map();

    // > singleEvent.register
    $L.set.meth(facade, function register(fn){
      if (_hasFired){
        fn.apply(this, _args);
      } else {
        _event.register(fn);
      }
    });

    // > singleEvent.register.deregister
    $L.set.meth(facade.register, function deregister(fn){
      if (_hasFired) { return; }
      _event.register.deregister(fn);
    });

    // > singleEvent.fire
    $L.set.meth(facade, function fire(){
      if (_hasFired || !_event.fire.enabled) { return; }
      _hasFired = true;
      _args = arguments;
      _event.fire.apply(this, _args);
      delete _event;
    });
    $L.set(facade, "_cls", $L.SingleEvent);

    // > singleEvent.fire.enabled
    Object.defineProperty(facade.fire, "enabled", {
      get: function(){ return _event.fire.enabled; },
      set: function(val) { _event.fire.enabled = val; }
    });

    return facade;
  });

  // > Lapiz.Event.linkProperty(obj, name, evt)
  // > Lapiz.Event.linkProperty(obj, name)
  // This is a helper function for linking an event to an object. It will be
  // linked like a setter method:
  /* >
  var map = Lapiz.Map();
  var e = Lapiz.Event.linkProperty(map, "foo");
  // These two are the same
  map.foo(function(){...});
  map.foo = function(){...};

  // To deregister
  map.foo.deregister(fn);
  */
  // If no event is given, one is created. The even is returned (either way).
  $L.set($L.Event, "linkProperty", function(obj, name, evt){
    if (evt === undefined){
      evt = $L.Event();
    }
    Object.defineProperty(obj, name, {
      get: function(){ return evt.register; },
      set: function(fn){ evt.register(fn); }
    });
    return evt;
  });

  $L.set($L, "on", $L.Map());
});
