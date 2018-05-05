Lapiz.Module("Dictionary", function($L){

  // > Lapiz.Dictionary()
  // > Lapiz.Dictionary(seed)
  // Dictionaries allow for the storage of key/value pairs in a container that
  // will emit events as the contents change.
  //
  // If seed values are specified, they will start as the contents of the
  // dictionary, otherwise the dictionary will start off empty.
  /* >
  var emptyDict = Lapiz.Dictionary();
  var fruitDict = Lapiz.Dictionary({
    "A": "apple",
    "B": "banana",
    "C": "cantaloupe"
  });
  console.log(fruitDict("A")); // apple
  fruitDict("A", "apricot");
  console.log(fruitDict("A")); // apricot
  emptyDict(12, "zebra");
  console.log(emptyDict(12)); // apricot
  */
  $L.set($L, "Dictionary", function(val){
    var _dict = $L.Map();
    var _length = 0;

    if (val !== undefined) {
      if ($L.typeCheck.func(val.each)){
        val.each(function(val, key){
          _dict[key] = val;
          _length += 1;
        });
      } else {
        $L.each(val, function(val, key){
          _dict[key] = val;
          _length += 1;
        });
      }
    }
    val = undefined; // not sure if this matters for GC

    // > dict(key)
    // > dict(key, val)
    // If only key is given, the value currently associated with that key will
    // be returned. If key and val are both given, val is associated with key
    // and the proper event (change or insert) will fire. For chaining, the
    // val is returned when dict is called as a setter.
    var self = function(key, val){
      if (val === undefined){
        try {
          return _dict[key];
        } catch (err){
          Lapiz.Err.toss(err);
        }
      }

      var oldVal = _dict[key];
      _dict[key] = val;
      if ( oldVal === undefined){
        _length += 1;
        _insertEvent.fire(key, self.Accessor);
      } else {
        _changeEvent.fire(key, self.Accessor, oldVal);
      }

      return val;
    };

    // > dict._cls
    $L.set(self, "_cls", $L.Dictionary);

    // > dict.on
    // Namespace for dictionary events
    self.on = $L.Map();

    // > dict.on.insert(fn(key, accessor))
    // Event will fire when a new key is added to the dictionary
    var _insertEvent = $L.Event.linkProperty(self.on, "insert");

    // > dict.on.remove(fn(key, accessor, oldVal))
    // Event will fire when a key is removed.
    var _removeEvent = $L.Event.linkProperty(self.on, "remove");

    // > dict.on.change(fn(key, accessor, oldVal))
    // Event will fire when a new key has a new value associated with it.
    //
    // One poentential "gotcha":
    /* >
      var d = Dict();
      d.on.change = function(key, acc){
        console.log(key, acc(key));
      };
      //assume person is a Lapiz Class
      d(5, Person(5, "Adam", "admin")); // does not fire change, as it's an insert
      d(5).role = "editor"; // this will fire person.on.change, but not dict.on.change
      d(5, Person(5, "Bob", "editor")); // this will fire dict.on.change
    */
    // To create a change listener for a class on a dict (or other accessor)
    /*
      function chgFn(key, acc){...}
      d.on.insert(function(key, acc){
        acc(key).on.change(chgFn);
      });
      d.on.remove(function(key, acc){
        acc(key).on.change(chgFn);
      });
      d.on.change(function(key, acc, old){
        old.on.change.deregister(chgFn);
        var val = acc(key);
        val.on.change(chgFn);
        chgFn(key, acc);
      });
    */
    var _changeEvent = $L.Event.linkProperty(self.on, "change", _changeEvent);

    Object.freeze(self.on);

    // > dict.length
    // A read-only property that returns the length of a dictionary
    /* >
    var fruitDict = Lapiz.Dictionary({
      "A": "apple",
      "B": "banana",
      "C": "cantaloupe"
    });
    console.log(fruitDict.length); // 3
    */
    $L.set.getter(self, function length(){
      return _length;
    });

    // > dict.remove(key)
    // The remove method will remove a key from the dictionary and the remove
    // event will fire.
    /* >
    var fruitDict = Lapiz.Dictionary({
      "A": "apple",
      "B": "banana",
      "C": "cantaloupe"
    });
    fruitDict.remove("B");
    console.log(fruitDict.length); // 2
    console.log(fruitDict("B")); // undefined
    */
    self.remove = function(key){
      if (_dict[key] !== undefined){
        _length -= 1;
        var obj = _dict[key];
        delete _dict[key];
        _removeEvent.fire(key, self.Accessor, obj);
      }
    };

    // > dict.has(key)
    // The has method returns a boolean stating if the dictionary has the given
    // key.
    /* >
    var fruitDict = Lapiz.Dictionary({
      "A": "apple",
      "B": "banana",
      "C": "cantaloupe"
    });
    console.log(fruitDict.has("B")); // true
    console.log(fruitDict.has(12)); // false
    */
    self.has = function(key){ return _dict[key] !== undefined; };

    // > dict.each(fn(key, val))
    // The each method takes a function and calls it for each key/value in the
    // collection. The function will be called with two arguments, the key and
    // the corresponding value. If any invocation of the function returns True,
    // that will signal the each loop to break. The order is not guarenteed.
    /* >
    var fruitDict = Lapiz.Dictionary({
      "A": "apple",
      "B": "banana",
      "C": "cantaloupe"
    });
    fruitDict(function(key, val){
      console.log(key, val);
      return key === "A";
    });
    */
    self.each = function(fn){
      var keys = Object.keys(_dict);
      var key, i;
      for(i=keys.length-1; i>=0; i-=1){
        key = keys[i];
        if (fn(_dict[key], key)) { return key; }
      }
    };

    // > dict.keys
    // A read-only property that will return the keys as an array.
    /* >
    var fruitDict = Lapiz.Dictionary({
      "A": "apple",
      "B": "banana",
      "C": "cantaloupe"
    });
    console.log(fruitDict.keys); // ["C", "A", "B"] in some order
    */
    $L.set.getter(self, function keys(){
      return Object.keys(_dict);
    });

    // > dict.Sort(sorterFunction)
    // > dict.Sort(attribute)
    // Returns a Sorter with the dictionary as the accessor
    self.Sort = function(funcOrField){ return $L.Sort(self, funcOrField); };

    // > dict.Filter(filterFunction)
    // > dict.Filter(attribute, val)
    // Returns a Filter with the dictionary as the accessor
    self.Filter = function(filterOrAttr, val){ return $L.Filter(self, filterOrAttr, val); };

    // > dict.Accessor
    // > dict.Accessor(key)
    // The accessor is a read-only interface to the dictionary
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
    self.Accessor = function(key){
      return _dict[key];
    };
    $L.set.copyProps(self.Accessor, self, "Accessor", "&length", "has", "each", "on", "Sort", "Filter", "&keys");
    self.Accessor._cls = $L.Accessor;

    Object.freeze(self.Accessor);
    Object.freeze(self);

    return self;
  });

  $L.set($L, "Accessor", function(accessor){
    return accessor.Accessor;
  });
});
