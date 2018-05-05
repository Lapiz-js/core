// > .ModuleName "Sorter"
Lapiz.Module("Sorter", function($L){

  // > Lapiz.Sort(accessor, sorterFunc(keyA, keyB, accessor))
  // > Lapiz.Sort(accessor, fieldName)
  // > Lapiz.Sort(accessor)
  // Lapiz.Sort is an accessor that when sort.each or sort.keys is called, they
  // will be in the sorted order. If a sorterFunction is provided, that will be
  // used to sort the accessor, if a fieldName is provided, the values on that
  // field will be used. If nothing is given, the accessor will be sorted by
  // key.
  $L.set($L, "Sort", function(accessor, funcOrField){
    // sort(key)
    // Returns the value associated with the key 
    var self = function(key){ return accessor(key); };

    // sort._cls
    $L.set(self, "_cls", $L.Sort);

    var _index = accessor.keys;
    var _sortFn;

    function setSortFn(funcOrField){
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
      } else if ($L.typeCheck.func(funcOrField)){
        // > sortFunction(keyA, keyB, accessor)
        // When the sort function is called it will be given two keys and an
        // accessor. If the value associated with keyA should come after the value
        // associated with keyB, return a value greater than 0. If the values are
        // equal return 0 and if keyB should come after keyA, return a value less
        // than 0.
        _sortFn = function(a, b){
          return funcOrField(a, b, accessor);
        };
        // > sortFunction.range(keyA, valB, accessor)
        // In order to be able to select a range, there must be a way to compare
        // an object in the accessor to a value. To provide this to the sorter,
        // it must be attached to the sortfunction as .range. If this is provided
        // to the sorter, the .range method will be available on the sorter.
        if ($L.typeCheck.func(funcOrField.range)){
          _sortFn.range = function(a,b){
            return funcOrField.range(a, b, accessor);
          };
        }
      } else if($L.typeCheck.str(funcOrField)){
        _sortFn = function(a, b){
          a = accessor(a)[funcOrField];
          b = accessor(b)[funcOrField];
          return (a > b ? 1 : (b > a ? -1 : 0));
        };
        _sortFn.range = function(a,b){
          a = accessor(a)[funcOrField];
          return (a > b ? 1 : (b > a ? -1 : 0));
        };
      } else {
        Lapiz.Err.toss("Sorter function must be omitted, function or field name");
      }
    }
    setSortFn(funcOrField);
    _index.sort(_sortFn);

    // > sort.has(key)

    // > sort.Accessor

    // > sort.Sort(accessor, sorterFunc(keyA, keyB, accessor))
    // > sort.Sort(accessor, fieldName)
    // > sort.Sort(accessor)
    // It is possible to create a sorter on a sorter, but it is not recommended.
    // The sorting operations do not stack so this just passes the events
    // through unnecessary layers of events

    // > sort.Filter(accessor, filterFunc(key, accessor) )
    // > sort.Filter(accessor, field, val)
    // It is possible to create a filter on a sorter, but it is not recommended.
    // The sorting operations do not stack so this just passes the events
    // through unnecessary layers of events. Better to create a filter on the
    // sorters accessor.

    // > sort.length
    $L.set.copyProps(self, accessor, "has", "Accessor", "Sort", "Filter", "&length");

    // > sort.keys
    // Read-only property. The keys will be in the order that the sorter has
    // arranged them.
    $L.set.getter(self, function keys(){
      return _index.slice(0);
    });

    // > sort.each( function(val, key, sorter) )
    // Iterates over the collection in order
    self.each = function(fn){
      var i;
      var l = _index.length;
      for(i=0; i<l; i+=1){
        key = _index[i];
        if (fn(accessor(key), key, self)) { return key; }
      }
    };

    // > sort.on
    // Namespace for event registration
    $L.set(self, "on", $L.Map());

    // > sort.on.insert(fn)
    // > sort.on.insert = fn
    var _insertEvent = $L.Event.linkProperty(self.on, "insert");

    // > sort.on.change(fn)
    // > sort.on.change = fn
    var _changeEvent = $L.Event.linkProperty(self.on, "change");

    // > sort.on.remove(fn)
    // > sort.on.remove = fn
    var _removeEvent = $L.Event.linkProperty(self.on, "remove");
    Object.freeze(self.on);

    // > sort.func(sorterFunction)
    // > sort.func = sorterFunction
    // > sort.func(field)
    // > sort.func = field
    // Assign a new function or field to sort by;
    $L.set.setterMethod(self, function func(funcOrField){
      setSortFn(funcOrField)
      var oldIndex = _index.slice(0);
      _index.sort(_sortFn);
      $L.each(oldIndex, function(key, oldIndex){
        if (_index[oldIndex] !== key){
          _changeEvent.fire(key, self, self(key));
        }
      });
    });

    var inFn = function(key, accessor){
      key = key.toString();
      _index.splice($L.Sort.locationOf(key, _index, _sortFn, accessor), 0, key);
      _insertEvent.fire(key, self);
    };
    var remFn = function(key, accessor, oldVal){
      $L.remove(_index, key.toString());
      _removeEvent.fire(key, self, oldVal);
    };
    var changeFn = function(key, accessor, oldVal){
      key = key.toString();
      _index.splice(_index.indexOf(key),1);
      _index.splice($L.Sort.locationOf(key, _index, _sortFn, accessor), 0, key);
      _changeEvent.fire(key, self, oldVal);
    };

    accessor.on.insert(inFn);
    accessor.on.remove(remFn);
    accessor.on.change(changeFn);

    // > sort.kill()
    // After calling kill, a Sorter is no longer live. It will not receive
    // updates and can more easily be garbage collected (because it's
    // parent accessor no longer has any references to it).
    self["kill"] = function(){
      accessor.on.insert.deregister(inFn);
      accessor.on.remove.deregister(remFn);
      accessor.on.change.deregister(changeFn);
    };

    if (_sortFn.range !== undefined){
      // > sort.Range(val)
      // > sort.Range(start, stop)
      // Returns all values either equal to val (by the sorter compare function)
      // or between start and stop (start inclusive, stop exclusive). The result
      // is returned as a Dictionary, but it is not wired in to update.
      self.Range = function(a, b){
        b = b || a;
        var start = $L.Sort.locationOf(a, _index, _sortFn.range, accessor);
        var end = $L.Sort.gt(b, _index, _sortFn.range, accessor, start);
        var dict = $L.Dictionary();
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
  });

  // > Lapiz.Sort.locationOf(val, index, fn, accessor)
  // > Lapiz.Sort.locationOf(val, index, fn, accessor, start, end)
  // This is used by the sorter to sort it's contents. It is left exposed
  // because a generic bisecting search is useful in many context. It assumes
  // that the accessor is sorted. It returns the position in index of the first
  // key that is greater than or equal to val in the accessor.
  $L.set.meth($L.Sort, function locationOf(val, index, fn, accessor, start, end) {
    //todo: add test
    start = start || 0;
    end = end || index.length;
    var pivot = Math.floor(start + (end - start) / 2);
    if (end-start === 0){
      return start;
    }
    if (end-start === 1) {
      // 1 := a>b      0 := a<=b
      return (fn(index[pivot], val, accessor) >= 0 ) ? start : end; 
    }
    return (fn(index[pivot], val, accessor) <= 0) ?
      $L.Sort.locationOf(val, index, fn, accessor, pivot, end) :
      $L.Sort.locationOf(val, index, fn, accessor, start, pivot);
  });

  // > Lapiz.Sort.gt(key, index, fn, accessor)
  // > Lapiz.Sort.gt(key, index, fn, accessor, start, end)
  // This is used by the sorter to sort it's contents. It is left exposed
  // because a generic bisecting search is useful in many context. It assumes
  // that the accessor is sorted. It returns the position in index of the first
  // key that is greater than the val in the accessor.
  $L.set.meth($L.Sort, function gt(key, index, fn, accessor, start, end){
    //todo: add test
    start = start || 0;
    end = end || index.length;
    var pivot = Math.floor(start + (end - start) / 2);
    if (end-start === 0){
      return start;
    }
    if (end-start === 1) {
      // 1 := a>b      0 := a<=b
      return (fn(index[pivot], key, accessor) < 0 ) ? start : end; 
    }
    return (fn(index[pivot], key, accessor) < 0) ?
      $L.Sort.locationOf(key, index, fn, accessor, pivot, end) :
      $L.Sort.locationOf(key, index, fn, accessor, start, pivot);
  });
});