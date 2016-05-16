Lapiz.Module("Events", ["Collections"], function($L){
  $L.set($L, "Event", function(){
    var _listeners = [];
    var event = Lapiz.Map();

    $L.Map.setterMethod(event, function register(fn){
      _listeners.push(fn);
      return fn;
    });

    $L.Map.setterMethod(event.register, function deregister(fn){
      $L.remove(_listeners, fn);
      return fn;
    });

    $L.Map.method(event, function fire(){
      if (!event.fire.enabled) { return event; }
      var i;
      var l = _listeners.length;
      for(i=0; i<l; i+=1){
        _listeners[i].apply(this, arguments);
      }
      return event;
    });
    $L.Map.setterGetter(event.fire, "enabled", function(enable){ return !!enable; });
    event.fire.enabled = true;

    $L.Map.getter(event.fire, function length(){ return _listeners.length; });

    $L.set(event, "_cls", $L.Event);

    return event;
  });

  $L.set($L, "SingleEvent", function(){
    var _event = $L.Event();
    var _hasFired = false;
    var _args;
    var facade = $L.Map();
    $L.Map.method(facade, function register(fn){
      if (_hasFired){
        fn.apply(this, _args);
      } else {
        _event.register(fn);
      }
    });
    $L.Map.method(facade.register, function deregister(fn){
      if (_hasFired) { return; }
      _event.register.deregister(fn);
    });
    $L.Map.method(facade, function fire(){
      if (_hasFired) { return; }
      _hasFired = true;
      _args = arguments;
      _event.fire.apply(this, _args);
      delete _event;
    });
    $L.set(facade, "_cls", $L.SingleEvent);

    Object.defineProperty(facade.fire, "enabled", {
      get: function(){ return _event.fire.enabled; },
      set: function(val) { _event.fire.enabled = val; }
    });

    return facade;
  });

  $L.set($L.Event, "linkProperty", function(obj, name, evt){
    Object.defineProperty(obj, name, {
      get: function(){ return evt.register; },
      set: function(fn){ evt.register(fn); }
    });
  });

  $L.on = $L.Map();
});
