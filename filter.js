Lapiz.Module("Filter", function($L){

  // > Lapiz.Filter(accessor, filterFunc(key, accessor) )
  // > Lapiz.Filter(accessor, attribute, val)
  $L.set($L, "Filter", function(accessor, filterOrField, val){
    var _index = [];

    // > filter(key)
    // Returns the value associated with key
    var self = function(key){
      if (_index.indexOf(key) > -1) { return accessor(key); }
    };

    // > filter._cls
    // Return Lapiz.Filter
    $L.set($L, "_cls", $L.Filter);

    var filterFn = filterOrField;
    if ($L.typeCheck.string(filterOrField) && val !== undefined){
      filterFn = function(key, accessor){
        return accessor(key)[filterOrField] === val;
      };
    }

    $L.typeCheck.func(filterFn, "Filter must be invoked with function or attriubte and value");

    var _insertEvent = Lapiz.Event();
    var _removeEvent = Lapiz.Event();
    var _changeEvent = Lapiz.Event();

    accessor.each(function(val, key){
      if (filterFn(key, accessor)) { _index.push(key); }
    });

    // > filter.Accessor
    // Returns a reference to self
    $L.set(self, "Accessor", self);

    // > filter.Sort(sorterFunction)
    // > filter.Sort(fieldName)
    // Returns a Sorter
    $L.Map.meth(self, function Sort(funcOrField){ return $L.Sort(self, funcOrField); });

    // > filter.Filter(filterFunction)
    // > filter.Filter(field, val)
    // Returns a filter.
    $L.Map.meth(self, function Filter(filterOrField, val){ return $L.Filter(self, filterOrField, val); });

    // > filter.has(key)
    // Returns a bool indicating if the filter contains the key
    $L.Map.meth(self, function has(key){
      return _index.indexOf(key.toString()) > -1;
    });

    // > filter.keys
    // Returns an array of keys
    $L.Map.getter(self, function keys(){
      return _index.slice(0);
    });

    // > filter.length
    // Read-only property that returns the length
    $L.Map.getter(self, function length(){
      return _index.length;
    });

    $L.Map.meth(self, function each(fn){
      var i;
      var l = _index.length;
      for(i=0; i<l; i+=1){
        key = _index[i];
        if (fn(key, accessor(key))) { break; }
      }
    });

    // > filter.on
    // Namespace for filter events
    $L.set(self, "on", $L.Map());

    // > filter.on.insert( function(key, accessor) )
    // > filter.on.insert = function(key, accessor)
    // Registration for insert event which fires when a new value is added to
    // the filter
    $L.Event.linkProperty(self.on, "insert", _insertEvent);

    // > filter.on.change( function(key, accessor) )
    // > filter.on.change = function(key, accessor)
    // Registration of change event which fires when a new value is assigned to
    // an existing key
    $L.Event.linkProperty(self.on, "change", _changeEvent);

    // > filter.on.remove( function(key, val, accessor) )
    // > filter.on.remove = function(key, val, accessor)
    // Registration for remove event which fires when a value is removed
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
    var changeFn = function(key, accessor, oldVal){
      key = key.toString();
      var i = _index.indexOf(key);
      var f = filterFn(key, accessor);
      if (i > -1){
        if (f) {
          // was in the list, still in the list, but changed
          _changeEvent.fire(key, self, oldVal);
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

    // > filter.ForceRescan()
    // Rescans all values from parent access and fires insert and remove events
    $L.Map.meth(self, function ForceRescan(){
      accessor.each(function(val, key){
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
    });

    // > filter.func(filterFunc(key, accessor))
    // > filter.func = filterFunc(key, accessor)
    // Changes the function used for the filter. The insert and remove events
    // will fire as the members are scanned to check if they comply with the
    // new members
    $L.Map.setterMethod(self, function func(fn){
      if ($L.typeCheck.nested(filterFn, "on", "change", "deregister", "func")){
        filterFn.on.change.deregister(self.ForceRescan);
      }
      filterFn = fn;
      if ($L.typeCheck.nested(filterFn, "on", "change", "func")){
        filterFn.on.change(self.ForceRescan);
      }
      self.ForceRescan();
    });

    // > filter.func.on.change
    // If the function supplied for filter function has a change event,
    // then when that event fires, it will force a rescan.
    if ($L.typeCheck.nested(filterFn, "on", "change", "func")){
      filterFn.on.change(self.ForceRescan);
    }

    $L.set(self, "delete", function(){
      accessor.on.insert.deregister(inFn);
      accessor.on.remove.deregister(remFn);
      accessor.on.change.deregister(changeFn);
      if (filterFn.on !== undefined && filterFn.on.change !== undefined && filterFn.on.change.deregister !== undefined){
        filterFn.on.change(self.ForceRescan);
      }
    });

    Object.freeze(self);
    return self;
  });
});
