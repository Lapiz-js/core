Lapiz.Module("Events", function($L){
  $L.Event = function(){
    var _listeners = [];
    var event = {
      register: function(fn){
        _listeners.push(fn);
        return fn;
      },
      deregister: function(fn){
        $L.remove(_listeners, fn);
        return fn;
      },
      enabled: true,
      fire: function(){
        if (!event.enabled) { return self; }
        var i;
        var l = _listeners.length;
        for(i=0; i<l; i+=1){
          _listeners[i].apply(this, arguments);
        }
        return self;
      },
      _cls: $L.Event
    };
    event.register.deregister = event.deregister;
    Object.defineProperty(event, "length", {
      get: function(){ return _listeners.length; }
    });
    return event;
  };

  $L.SingleEvent = function(){
    var _event = $L.Event();
    var _hasFired = false;
    var _args;
    var facade = {
      register: function(fn){
        if (_hasFired){
          fn.apply(this, _args);
        } else {
          _event.register(fn);
        }
      },
      deregister: function(fn){
        if (_hasFired) { return; }
        _event.deregister(fn);
      },
      fire: function(){
        if (_hasFired) { return; }
        _hasFired = true;
        _args = arguments;
        _event.fire.apply(this, _args);
        delete _event;
      },
      _cls: $L.SingleEvent
    };
    Object.defineProperty(facade, "enabled", {
      get: function(){ return _event.enabled; },
      set: function(val) { _event.enabled = !!val; }
    });
    return facade;
  };

  $L.Event.LinkProperty = function(obj, name, evt){
    Object.defineProperty(obj, name,{
      get: function(){ return evt.register; },
      set: function(fn){ evt.register(fn); }
    });
  };

  $L.on = {};
});
