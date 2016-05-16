Lapiz.Module("Sorter", function($L){
  $L.Sort = function(accessor, funcOrField){
    var self = function(key){ return accessor(key); };
    self._cls = $L.Sort;

    var _index = accessor.keys;
    var _sortFn;
    var _insertEvent = Lapiz.Event();
    var _removeEvent = Lapiz.Event();
    var _changeEvent = Lapiz.Event();

    if (funcOrField === undefined){
      _sortFn = function(a, b){
        a = accessor(a);
        b = accessor(b);
        return (a > b ? 1 : (b > a ? -1 : 0));
      };
      _sortFn.range = function(a, b){
        a = accessor(a);
        return (a > b ? 1 : (b > a ? -1 : 0));
      };
    } else if (typeof(funcOrField) === "function"){
      _sortFn = function(a, b){
        return funcOrField(a, b, accessor);
      };
      if (funcOrField.range !== undefined){
        _sortFn.range = function(a,b){
          return funcOrField.range(a, b, accessor);
        };
      }
    } else if(typeof(funcOrField) === "string"){
      _sortFn = function(a, b){
        a = accessor(a)[funcOrField];
        b = accessor(b)[funcOrField];
        return (a > b ? 1 : (b > a ? -1 : 0));
      };
      _sortFn.range = function(a,b){
        a = accessor(a)[funcOrField];
        return (a > b ? 1 : (b > a ? -1 : 0));
      };
    }
    _index.sort(_sortFn);

    self.has = accessor.has;
    self.Accessor = accessor;
    self.Sort = accessor.Sort;
    self.Filter = accessor.Filter;
    Object.defineProperty(self, "keys",{
      get: function(){ return _index.slice(0); }
    });
    Object.defineProperty(self, "len",{
      get: function(){ return accessor.len; }
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
    $L.Event.LinkProperty(self.on, "insert", _insertEvent);
    $L.Event.LinkProperty(self.on, "change", _changeEvent);
    $L.Event.LinkProperty(self.on, "remove", _removeEvent);
    Object.freeze(self.on);

    Object.defineProperty(self, "func", {
      set: function(fn){
        _sortFn = fn;
        _index.sort(_sortFn);
        accessor.each( function(key, _){
          _changeEvent.fire(key, self);
        });
      }
    });

    var inFn = function(key, accessor){
      key = key.toString();
      _index.splice($L.Sort.locationOf(key, _index, _sortFn, accessor), 0, key);
      _insertEvent.fire(key, self);
    };
    var remFn = function(key, obj, accessor){
      $L.remove(_index, key.toString());
      _removeEvent.fire(key, obj, self);
    };
    var changeFn = function(key, accessor){
      key = key.toString();
      _index.splice(_index.indexOf(key),1);
      _index.splice($L.Sort.locationOf(key, _index, _sortFn, accessor), 0, key);
      _changeEvent.fire(key, self);
    };

    accessor.on.insert(inFn);
    accessor.on.remove(remFn);
    accessor.on.change(changeFn);

    self["delete"] = function(){
      accessor.on.insert.deregister(inFn);
      accessor.on.remove.deregister(remFn);
      accessor.on.change.deregister(changeFn);
    };

    if (_sortFn.range !== undefined){
      self.Range = function(a, b){
        b = b || a;
        var start = $L.Sort.locationOf(a, _index, _sortFn.range, accessor);
        var end = $L.Sort.gt(b, _index, _sortFn.range, accessor, start);
        var dict = Lapiz.Dictionary();
        var i, key;
        for(i=start; i<end; i+=1){
          key = _index[i];
          dict(key, accessor(key));
        }
        return dict;
      }
    }

    Object.freeze(self);
    return self;
  };

  //returns the index of the first value greater than or equal to the key
  $L.Sort.locationOf = function(key, index, fn, accessor, start, end) {
    start = start || 0;
    end = end || index.length;
    var pivot = Math.floor(start + (end - start) / 2);
    if (end-start === 0){
      return start;
    }
    if (end-start === 1) {
      // 1 := a>b      0 := a<=b
      if (fn(index[pivot],  key, accessor) >= 0 ) { return start; }
      return end;
    }
    if (fn(index[pivot], key, accessor) <= 0) {
      return $L.Sort.locationOf(key, index, fn, accessor, pivot, end);
    } else {
      return $L.Sort.locationOf(key, index, fn, accessor, start, pivot);
    }
  };

  //returns the index of the first value greater than key
  $L.Sort.gt = function (key, index, fn, accessor, start, end) {
    start = start || 0;
    end = end || index.length;
    var pivot = Math.floor(start + (end - start) / 2);
    if (end-start === 0){
      return start;
    }
    if (end-start === 1) {
      // 1 := a>b      0 := a<=b
      if (fn(index[pivot], key, accessor) < 0 ) { return start; }
      return end;
    }
    if (fn(index[pivot], key, accessor) < 0) {
      return $L.Sort.locationOf(key, index, fn, accessor, pivot, end);
    } else {
      return $L.Sort.locationOf(key, index, fn, accessor, start, pivot);
    }
  }
});
