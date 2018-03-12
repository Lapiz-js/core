Lapiz.Module("Filter", function($L){

  // > Lapiz.Filter(accessor, filterFunc(key, accessor) )
  // > Lapiz.Filter(accessor, field, val)
  // Filters an accessor based on a function or field.
  //
  // One edge case is that an accessor cannot filter by field
  // for undefined. To do that, you have to create a function
  // to check the field.
  $L.set($L, "Filter", function(accessor, filterOrField, val){
    var _index = [];

    // > filter(key)
    // Returns the value associated with key, if it exists in the filter
    var self = function(key){
      if (_index.indexOf(key) > -1) { return accessor(key); }
    };

    // > filter._cls
    // Return Lapiz.Filter
    $L.set(self, "_cls", $L.Filter);

    // if filterOrField is a string, and val is set, create a function
    // to check that field against the val
    var filterFn = filterOrField;
    if ($L.typeCheck.str(filterOrField) && val !== undefined){
      filterFn = function(key, accessor){
        return accessor(key)[filterOrField] === val;
      };
    }

    $L.typeCheck.func(filterFn, "Filter must be invoked with function or attriubte and value");

    accessor.each(function(val, key){
      if (filterFn(key, accessor)) { _index.push(key); }
    });

    // > filter.Accessor
    // Returns a reference to self
    $L.set(self, "Accessor", self);

    // > filter.Sort(sorterFunction)
    // > filter.Sort(fieldName)
    // Returns a Sorter
    $L.set.meth(self, function Sort(funcOrField){ return $L.Sort(self, funcOrField); });

    // > filter.Filter(filterFunction)
    // > filter.Filter(field, val)
    // Returns a filter.
    $L.set.meth(self, function Filter(filterOrField, val){ return $L.Filter(self, filterOrField, val); });

    // > filter.has(key)
    // Returns a bool indicating if the filter contains the key
    $L.set.meth(self, function has(key){
      return _index.indexOf(key.toString()) > -1;
    });

    // > filter.keys
    // Returns an array of keys
    $L.set.getter(self, function keys(){
      return _index.slice(0);
    });

    // > filter.length
    // Read-only property that returns the length
    $L.set.getter(self, function length(){
      return _index.length;
    });

    $L.set.meth(self, function each(fn){
      var i;
      var l = _index.length;
      for(i=0; i<l; i+=1){
        key = _index[i];
        if (fn(accessor(key), key)) { return key; }
      }
    });

    // > filter.on
    // Namespace for filter events
    $L.set(self, "on", $L.Map());

    // > filter.on.insert( function(key, accessor) )
    // > filter.on.insert = function(key, accessor)
    // Registration for insert event which fires when a new value is added to
    // the filter
    var _insertEvent = $L.Event.linkProperty(self.on, "insert");

    // > filter.on.change( function(key, accessor) )
    // > filter.on.change = function(key, accessor)
    // Registration of change event which fires when a new value is assigned to
    // an existing key
    var _changeEvent = $L.Event.linkProperty(self.on, "change");

    // > filter.on.remove( function(key, val, accessor) )
    // > filter.on.remove = function(key, val, accessor)
    // Registration for remove event which fires when a value is removed
    var _removeEvent = $L.Event.linkProperty(self.on, "remove");
    Object.freeze(self.on);

    function inFn(key, accessor){
      key = key.toString();
      if (filterFn(key, accessor)){
        _index.push(key);
        _insertEvent.fire(key, self);
      }
    }
    function remFn(key, accessor, oldVal){
      key = key.toString();
      var i = _index.indexOf(key);
      if (i > -1){
        _index.splice(i, 1);
        _removeEvent.fire(key, self, oldVal);
      }
    }
    function changeFn(key, accessor, oldVal){
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
    }

    accessor.on.insert(inFn);
    accessor.on.remove(remFn);
    accessor.on.change(changeFn);

    // > filter.ForceRescan()
    // Rescans all values from parent access and fires insert and remove events
    $L.set.meth(self, function ForceRescan(){
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
    $L.set.setterMethod(self, function func(fn){
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

    // > filter.kill()
    // After calling kill, a Filter is no longer live. It will not receive
    // updates and can more easily be garbage collected (because it's
    // parent accessor no longer has any references to it).
    $L.set.meth(self, function kill(){
      accessor.on.insert.deregister(inFn);
      accessor.on.remove.deregister(remFn);
      accessor.on.change.deregister(changeFn);
      if ($L.typeCheck.nested(filterFn, "on", "change", "deregister", "func")){
        filterFn.on.change.deregister(self.ForceRescan);
      }
    });

    Object.freeze(self);
    return self;
  });
});
