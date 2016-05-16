Lapiz.Module("Filter", function($L){
  $L.set($L, "Filter", function(accessor, filterOrAttr, val){
    var _index = [];
    var self = function(key){
      if (_index.indexOf(key) > -1) { return accessor(key); }
    };
    self._cls = $L.Filter;

    var filterFn = filterOrAttr;
    if ($L.typeCheck.string(filterOrAttr) && val !== undefined){
      filterFn = function(key, accessor){
        return accessor(key)[filterOrAttr] === val;
      };
    }

    var _insertEvent = Lapiz.Event();
    var _removeEvent = Lapiz.Event();
    var _changeEvent = Lapiz.Event();

    accessor.each(function(key, val){
      if (filterFn(key, accessor)) { _index.push(key); }
    });

    self.Accessor = self;
    self.Sort = function(funcOrField){ return $L.Sort(self, funcOrField); };
    self.Filter = function(filterOrAttr, val){ return $L.Filter(self, filterOrAttr, val); };

    self.has = function(key){
      return _index.indexOf(key.toString()) > -1;
    };

    $L.Map.getter(self, function keys(){
      return _index.slice(0);
    });
    $L.Map.getter(self, function length(){
      return _index.length;
    });

    self.each = function(fn){
      var i;
      var l = _index.length;
      for(i=0; i<l; i+=1){
        key = _index[i];
        if (fn(key, accessor(key))) { break; }
      }
    };

    self.on = $L.Map();
    $L.Event.linkProperty(self.on, "insert", _insertEvent);
    $L.Event.linkProperty(self.on, "change", _changeEvent);
    $L.Event.linkProperty(self.on, "remove", _removeEvent);
    Object.freeze(self.on);

    var inFn = function(key, accessor){
      key = key.toString();
      if (filterFn(key, accessor)){
        _index.push(key);
        _insertEvent.fire(key, self);
      }
    };
    var remFn = function(key, obj, accessor){
      key = key.toString();
      var i = _index.indexOf(key);
      if (i > -1){
        _index.splice(i, 1);
        _removeEvent.fire(key, obj, self);
      }
    };
    var changeFn = function(key, accessor){
      key = key.toString();
      var i = _index.indexOf(key);
      var f = filterFn(key, accessor);
      if (i > -1){
        if (f) {
          // was in the list, still in the list, but changed
          _changeEvent.fire(key, self);
        } else {
          // was in the list, is not now
          _index.splice(i, 1);
          _removeEvent.fire(key, accessor(key), self);
        }
      } else {
        if (f){
          // was not in the list, is now
          _index.push(key);
          _insertEvent.fire(key, self);
        }
      }
    };

    accessor.on.insert(inFn);
    accessor.on.remove(remFn);
    accessor.on.change(changeFn);

    Object.defineProperty(self, "func", {
      set: function(fn){
        if (filterFn.on !== undefined && filterFn.on.change !== undefined && filterFn.on.change.deregister !== undefined){
          filterFn.on.change(self.ForceRescan);
        }
        filterFn = fn;
        self.ForceRescan();
      }
    })

    self.ForceRescan = function(){
      accessor.each(function(key, val){
        key = key.toString();
        var willBeInSet = filterFn(key, accessor);
        var idx = _index.indexOf(key)
        var isInSet = (idx !== -1);
        if (willBeInSet && !isInSet){
          _index.push(key);
          _insertEvent.fire(key, self);
        } else if (!willBeInSet && isInSet){
          _index.splice(idx, 1);
          _removeEvent.fire(key, accessor(key), self);
        }
      });
    };

    //todo: potential conflict if filter function is set using filter.func = function(){...}
    if (filterFn.on !== undefined && filterFn.on.change !== undefined){
      filterFn.on.change(self.ForceRescan);
    }

    self["delete"] = function(){
      accessor.on.insert.deregister(inFn);
      accessor.on.remove.deregister(remFn);
      accessor.on.change.deregister(changeFn);
      if (filterFn.on !== undefined && filterFn.on.change !== undefined && filterFn.on.change.deregister !== undefined){
        filterFn.on.change(self.ForceRescan);
      }
    };

    Object.freeze(self);
    return self;
  });
});
