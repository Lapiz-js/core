Lapiz.Module("Dictionary", function($L){
  $L.set($L, "Dictionary", function(val){
    var _dict = $L.Map();
    var _length = 0;
    var _insertEvent = Lapiz.Event();
    var _removeEvent = Lapiz.Event();
    var _changeEvent = Lapiz.Event();

    if (val !== undefined) {
      if (val.hasOwnProperty("each")){
        val.each(function(i, val){
          _dict[i] = val;
          _length += 1;
        });
      } else {
        $L.each(val, function(i, val){
          _dict[i] = val;
          _length += 1;
        });
      }
    }

    var self = function(key, val){
      if (val === undefined){
        return _dict[key];
      }

      var event;
      if (_dict[key] === undefined){
        _length += 1;
        event = _insertEvent;
      } else {
        event = _changeEvent;
      }

      _dict[key] = val;
      event.fire(key, self.Accessor);
      return val;
    };

    self._cls = $L.Dictionary;

    $L.Map.getter(self, function length(){
      return _length;
    });

    self.remove = function(key){
      if (_dict[key] !== undefined){
        _length -= 1;
        var obj = _dict[key];
        delete _dict[key];
        _removeEvent.fire(key, obj, self.Accessor);
      }
    };

    self.on = $L.Map();
    $L.Event.linkProperty(self.on, "insert", _insertEvent);
    $L.Event.linkProperty(self.on, "change", _changeEvent);
    $L.Event.linkProperty(self.on, "remove", _removeEvent);
    Object.freeze(self.on);

    self.has = function(key){ return _dict[key] !== undefined; };

    self.each = function(fn){
      var keys = Object.keys(_dict);
      var key, i;
      for(i=keys.length-1; i>=0; i-=1){
        key = keys[i];
        if (fn(key, _dict[key])) { break; }
      }
    };

    $L.Map.getter(self, function keys(){
      return Object.keys(_dict);
    });

    self.Sort = function(funcOrField){ return $L.Sort(self, funcOrField); };
    self.Filter = function(filterOrAttr, val){ return $L.Filter(self, filterOrAttr, val); };

    self.Accessor = function(key){
      return _dict[key];
    };
    $L.Map.copyProps(self.Accessor, self, "Accessor", "&length", "has", "each", "on", "Sort", "Filter", "&keys");
    self.Accessor._cls = $L.Accessor;

    Object.freeze(self.Accessor);
    Object.freeze(self);

    return self;
  });

  $L.set($L, "Accessor", function(accessor){
    return accessor.Accessor;
  });
});
