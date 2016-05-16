Lapiz.Module("Dictionary", function($L){
  $L.set("Dictionary", function(val){
    var _dict = {};
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

    var self = function(field, val){
      if (val === undefined){
        return _dict[field];
      }

      var event;
      if (!_dict.hasOwnProperty(field)){
        _length += 1;
        event = _insertEvent;
      } else {
        event = _changeEvent;
      }

      _dict[field] = val;
      event.fire(field, self.Accessor);
      return val;
    };

    self._cls = $L.Dictionary;

    Object.defineProperty(self, "len", {
      get: function(){return _length;}
    });

    self.remove = function(field){
      if (_dict.hasOwnProperty(field)){
        _length -= 1;
        var obj = _dict[field];
        delete _dict[field];
        _removeEvent.fire(field, obj, self.Accessor);
      }
    };

    self.on = $L.Map();
    $L.Event.LinkProperty(self.on, "insert", _insertEvent);
    $L.Event.LinkProperty(self.on, "change", _changeEvent);
    $L.Event.LinkProperty(self.on, "remove", _removeEvent);
    Object.freeze(self.on);

    self.has = function(field){ return _dict.hasOwnProperty(field); };

    self.each = function(fn){
      var keys = Object.keys(_dict);
      var key, i;
      for(i=keys.length-1; i>=0; i-=1){
        key = keys[i];
        if (fn(key, _dict[key])) { break; }
      }
    };

    Object.defineProperty(self, "keys", {
      get: function(){ return Object.keys(_dict); }
    });

    self.Sort = function(funcOrField){ return $L.Sort(self, funcOrField); };
    self.Filter = function(filterOrAttr, val){ return $L.Filter(self, filterOrAttr, val); };

    self.Accessor = function(key){
      return _dict[key];
    };
    self.Accessor.Accessor = self.Accessor; //meta, but necessary
    self.Accessor.len = self.len;
    self.Accessor.has = self.has;
    self.Accessor.each = self.each;
    self.Accessor.on = self.on;
    self.Accessor.Sort = self.Sort;
    self.Accessor.Filter = self.Filter;
    self.Accessor._cls = $L.Accessor;
    Object.defineProperty(self.Accessor, "keys", {
      get: function(){ return Object.keys(_dict); }
    });
    Object.defineProperty(self.Accessor, "len", {
      get: function(){ return _length; }
    });
    
    Object.freeze(self.Accessor);
    Object.freeze(self);

    return self;
  });

  $L.set("Accessor", function(accessor){
    return accessor.Accessor;
  });
});
