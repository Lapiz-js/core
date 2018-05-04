// > .ModuleName "Group"
Lapiz.Module("Group", function($L){

  // > Lapiz.Group(accessor)
  // Creates a sub-group of values from an accessor.
  $L.set($L, "Group", function(accessor){
    var _index = [];

    // > group(key)
    // Returns the value associated with key, if it exists in the group
    var self = function(key){
      if (_index.indexOf(key.toString()) > -1) { return accessor(key); }
    };

    // > group._cls
    // Return Lapiz.Group
    $L.set(self, "_cls", $L.Group);

    // > group.Accessor
    // Returns a reference to self
    $L.set(self, "Accessor", self);

    // > group.Sort(sorterFunction)
    // > group.Sort(fieldName)
    // Returns a Sorter
    $L.set.meth(self, function Sort(funcOrField){ return $L.Sort(self, funcOrField); });

    // > group.Filter(filterFunction)
    // > group.Filter(field, val)
    // Returns a filter.
    $L.set.meth(self, function Filter(filterOrField, val){ return $L.Filter(self, filterOrField, val); });

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


    // > group.Add(key)
    // If the key exists in the accessor, it is added to the group.
    $L.set.meth(self, function Add(key){
      key = key.toString();
      if (accessor.has(key)){
        _index.push(key);
        _insertEvent.fire(key, self);
      }
    });

    // > group.Remove(key)
    $L.set.meth(self, function Remove(key){
      key = key.toString();
      var i = _index.indexOf(key);
      if (i > -1){
        _index.splice(i, 1);
        _removeEvent.fire(key, self, accessor(key));
      }
    });

    Object.freeze(self);
    return self;
  });
});
