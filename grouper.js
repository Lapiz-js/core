// > .ModuleName "Group"
Lapiz.Module("Group", function($L){

  // > settings
  // Settings to change the behavior of the group

  // > Lapiz.Group(accessor, settings)
  // Creates a sub-group of values from an accessor. This is essentially an
  // actively managed filter.
  $L.set($L, "Group", function(accessor, settings){
    var _index = [];

    // > group(key)
    // Returns the value associated with key, if it exists in the group
    var self = function(key){
      if (_index.indexOf(key.toString()) > -1) { return accessor(key); }
    };

    // > group._cls
    // Return Lapiz.Group
    $L.set(self, "_cls", $L.Group);

    // > group.Sort(sorterFunction)
    // > group.Sort(fieldName)
    // Returns a Sorter
    $L.set.meth(self, function Sort(funcOrField){ return $L.Sort(self, funcOrField); });

    // > group.Filter(filterFunction)
    // > group.Filter(field, val)
    // Returns a filter.
    $L.set.meth(self, function Filter(filterOrField, val){ return $L.Filter(self, filterOrField, val); });

    // > group.GroupBy(attribute)
    // > group.GroupBy(groupByFunction)
    // Returns a GroupBy with the group as the accessor
    $L.set.meth(self, function GroupBy(funcOrField){ return $L.GroupBy(self, funcOrField); });

    // > group.has(key)
    // Returns a bool indicating if the group contains the key
    $L.set.meth(self, function has(key){
      return _index.indexOf(key.toString()) > -1;
    });

    // > group.keys
    // Returns an array of keys
    $L.set.getter(self, function keys(){
      return _index.slice(0);
    });

    // > group.length
    // Read-only property that returns the length
    $L.set.getter(self, function length(){
      return _index.length;
    });

    // > group.each(fn)
    // Iterates over the collection and calls fn(val, key) on each member.
    $L.set.meth(self, function each(fn){
      var i;
      var l = _index.length;
      for(i=0; i<l; i+=1){
        key = _index[i];
        if (fn(accessor(key), key)) { return key; }
      }
    });

    // > group.on
    // Namespace for group events
    $L.set(self, "on", $L.Map());

    // > group.on.insert( function(key, accessor) )
    // > group.on.insert = function(key, accessor)
    // Registration for insert event which fires when a new value is added to
    // the group
    var _insertEvent = $L.Event.linkProperty(self.on, "insert");

    // > group.on.change( function(key, accessor) )
    // > group.on.change = function(key, accessor)
    // Registration of change event which fires when a new value is assigned to
    // an existing key
    var _changeEvent = $L.Event.linkProperty(self.on, "change");

    // > group.on.remove( function(key, val, accessor) )
    // > group.on.remove = function(key, val, accessor)
    // Registration for remove event which fires when a value is removed
    var _removeEvent = $L.Event.linkProperty(self.on, "remove");
    Object.freeze(self.on);

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
      if (_index.indexOf(key) > -1){
        _changeEvent.fire(key, self, oldVal);
      }
    }

    // > settings.DoNotListen
    if (settings === undefined || settings.DoNotListen !== true ){
      accessor.on.remove(remFn);
      accessor.on.change(changeFn);

      // > group.kill()
      // After calling kill, a Filter is no longer live. It will not receive
      // updates and can more easily be garbage collected (because it's
      // parent accessor no longer has any references to it).
      $L.set.meth(self, function kill(){
        accessor.on.remove.deregister(remFn);
        accessor.on.change.deregister(changeFn);
      });
    }


    // > group.Add(key)
    // If the key exists in the accessor, it is added to the group.
    $L.set.meth(self, function Add(key){
      key = key.toString();
      if (accessor.has(key) && _index.indexOf(key) === -1){
        _index.push(key);
        _insertEvent.fire(key, self);
      }
    });

    // > group.Remove(key)
    // > group.Remove(key, oldVal)
    // Removes the key. The oldVal parameter is only needed if the Group is not
    // listening on it's underlying Accessor and the value has been removed.
    $L.set.meth(self, function Remove(key, oldVal){
      key = key.toString();
      var i = _index.indexOf(key);
      if (oldVal === undefined){
        oldVal = accessor(key);
      }
      if (i > -1){
        _index.splice(i, 1);
        _removeEvent.fire(key, self, oldVal);
      }
    });

    // > group.Change(key, oldVal)
    // Fires the change event.
    $L.set.meth(self, function Change(key, oldVal){
      changeFn(key, accessor, oldVal)
    })

    // > group.Accessor
    // > group.Accessor(key)
    // The accessor is a read-only iterface to the group
    //
    // * accessor.length
    // * accessor.keys
    // * accessor.has(key)
    // * accessor.each(fn(val, key))
    // * accessor.on.insert
    // * accessor.on.change
    // * accessor.on.remove
    // * accessor.Sort
    // * accessor.Filter
    $L.set(self, function Accessor(){
      return self(key);
    });
    $L.set.copyProps(self.Accessor, self, "Accessor", "&length", "has", "each", "on", "Sort", "Filter", "&keys");
    self.Accessor._cls = $L.Accessor;

    Object.freeze(self.Accessor);
    Object.freeze(self);
    return self;
  });
});

// > .ModuleName "GroupBy"
Lapiz.Module("GroupBy", ["Collections"], function($L){
  var _groupSettings = $L.Map();
  _groupSettings.DoNotListen = true;

  // > Lapiz.GroupBy(accessor, field)
  // > Lapiz.GroupBy(accessor, groupKeyFn(key, accessor) )
  // Creates a set of sub-groups from an accessor. While not limited to this, it
  // is particularly useful in representing one-to-many relationships. The
  // accessor containing all the instances of the child class can be grouped by
  // their parent key.
  //
  // The same thing could be accomplished with Filters, one per parent. The
  // advantage of this is that it is more efficient. Using filters, when a child
  // is added, removed or changed, each Filter instance will be invoked to
  // handle the event - O(N) where N is the number of Filters which is the
  // number of parent keys. With this, the event is handled once and on the
  // groups that need to be notified of the change are. This is O(1) regardless
  // of the number of parent keys.
  //
  // Undefined group keys will not be used, they will just be skipped and not
  // belong to any group.
  //
  // The second argument can be a group key function. This needs to return a
  // string that represents the group key. This can be used to normalize values,
  // group by multiple fields or replace undefined with a string value so that
  // those values are grouped.
  $L.set($L, "GroupBy", function(accessor, fieldOrFunc){
    var _groups = $L.Map();
    var _keymap = $L.Map();

    var _groupByFn = fieldOrFunc;
    if ($L.typeCheck.str(fieldOrFunc)){
      _groupByFn = function(key, accessor){
        return accessor(key)[fieldOrFunc];
      };
    }
    $L.typeCheck.func(_groupByFn, "GroupBy must be invoked with function or attriubte name");

    // > groupBy(key)
    // Returns the group associated with key, if it exists.
    var self = function(key){
      key = key.toString();
      var group = _groups[key];
      if (group === undefined){
        group = $L.Group(accessor, _groupSettings);
        _groups[key] = group;
      }
      return group.Accessor;
    };

    // > groupBy._cls
    // Return Lapiz.GroupBy
    $L.set(self, "_cls", $L.GroupBy);

    // > groupBy.has(key)
    // Returns a bool indicating if the groupBy contains a group for the key
    $L.set.meth(self, function has(key){
      return _groups[key] !== undefined;
    });

    // > groupBy.keys
    // Returns an array of the keys.
    $L.set.getter(self, function keys(){
      return Object.keys(_groups);
    });

    // > groupBy.length
    // Read-only property that returns the length
    $L.set.getter(self, function length(){
      return Object.keys(_groups).length;
    });

    function inFn(key, accessor){
      key = key.toString();
      var groupKey = _groupByFn(key, accessor);
      if (groupKey === undefined){
        return;
      }
      var group = _groups[groupKey];
      if (group === undefined){
        group = $L.Group(accessor, _groupSettings);
        _groups[groupKey] = group;
      }
      group.Add(key);
      _keymap[key] = groupKey;
    }

    function remFn(key, accessor, oldVal){
      key = key.toString();
      var groupKey = _keymap[key];
      if (groupKey === undefined){
        return;
      }
      var group = _groups[groupKey];
      group.Remove(key, oldVal);
      delete _keymap[key];
    }

    function changeFn(key, accessor, oldVal){
      key = key.toString();
      var group;
      
      var oldGroupKey = _keymap[key];
      var newGroupKey = _groupByFn(key, accessor);

      if (oldGroupKey !== undefined){
        group = _groups[oldGroupKey];
        if (oldGroupKey === newGroupKey){
          group.Change(key, oldVal);
          return;
        }
        group.Remove(key, oldVal);
      }
      
      if (newGroupKey === undefined){
        return;
      }
      group = _groups[newGroupKey];
      if (group === undefined){
        group = $L.Group(accessor, _groupSettings);
        _groups[newGroupKey] = group;
      }
      group.Add(key);
      _keymap[key] = newGroupKey;
    }

    accessor.on.insert(inFn);
    accessor.on.remove(remFn);
    accessor.on.change(changeFn);

    // > groupBy.ForceRescan()
    // Rescans all values from parent access and fires insert and remove events
    $L.set.meth(self, function ForceRescan(){
      accessor.each(function(val, key){
        var oldGroupKey, group;
        key = key.toString();
        var newGroupKey = _groupByFn(key, accessor);

        if ($L.Map.has(_keymap, key)){
          oldGroupKey = _keymap[key];
          if (oldGroupKey === newGroupKey){
            return;
          }

          group = _groups[oldGroupKey];
          group.Remove(key);
        }

        if (newGroupKey === undefined){
          return;
        }
        group = _groups[newGroupKey];
        if (group === undefined){
          group = $L.Group(accessor, _groupSettings);
          _groups[newGroupKey] = group;
        }
        group.Add(key);
        _keymap[key] = newGroupKey;
      });
    });

    accessor.each(function(val, key){
      key = key.toString();
      var groupKey = _groupByFn(key, accessor);
      if (groupKey === undefined){
        return;
      }
      var group = _groups[groupKey];
      if (group === undefined){
        group = $L.Group(accessor, _groupSettings);
        _groups[groupKey] = group;
      }
      group.Add(key);
      _keymap[key] = groupKey;
    });

    return self;
  });
});