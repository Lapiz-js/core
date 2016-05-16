Lapiz.Test("Dictionary/InsertAndGet", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("5", "foo");

  dict("5") === "foo" || t.error("Expected 'foo', got " + dict("5"));
});

Lapiz.Test("Dictionary/Length", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("5", "foo");

  dict.length === 1 || t.error("Expected 1, got " + dict.length);
});

Lapiz.Test("Dictionary/Delete", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("5", "foo");
  dict.remove("5");

  dict.length === 0       || t.error("Expected 0, got " + dict.length);
  dict("5") === undefined || t.error("Expected undefined, got " + dict("5"));
});

Lapiz.Test("Dictionary/OnInsert", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var flag = false;
  dict.on.insert(function(key, dict){
    flag = key === "5";
  });

  dict("5", "foo");

  flag || t.error("Flag was not set");
});

Lapiz.Test("Dictionary/OnChange", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var flag = false;
  dict.on.change(function(key, dict){
    flag = key === "5";
  });

  dict("5", "foo");
  !flag || t.error("Flag was set on insert");

  dict("5", "bar");
  flag || t.error("Flag was not set on change");
});

Lapiz.Test("Dictionary/OnRemove", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var removeFlag = false;
  var changeFlag = false;

  dict.on.remove(function(){
    removeFlag = true;
  });

  dict("5", "foo");
  !removeFlag || t.error("Flag was set on insert");

  dict("5", "bar");
  !removeFlag || t.error("Flag was set on change");

  dict.on.change(function(){
    changeFlag = true;
  })

  dict.remove("5");
  removeFlag  || t.error("Flag was not set on remove");
  !changeFlag  || t.error("Change flag was set on remove");
});

Lapiz.Test("Dictionary/Has", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("5", "foo");

  dict.has("5") || t.error("Dict should have '5'");
});

Lapiz.Test("Dictionary/Each", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var flags = {
    "a": false,
    "b": false,
    "c": false
  };
  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");

  dict.each(function(key, val){
    flags[key] = true;
  });

  flags.a || t.error("Flag 'a' was not set");
  flags.b || t.error("Flag 'b' was not set");
  flags.c || t.error("Flag 'c' was not set");
});

Lapiz.Test("Dictionary/Accessor", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var accessor = dict.Accessor;

  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");

  accessor("d", "dan");
  accessor("d") === undefined || t.error("Key 'd' should not be set");
});

Lapiz.Test("Dictionary/AccessorEvents", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var accessor = dict.Accessor;
  var flags = {
    insert: false,
    change: false,
    remove: false
  };

  accessor.on.insert(function(key, dict){
    flags.insert = dict(key) === "adam"
  });

  accessor.on.change(function(key, dict){
    flags.change = dict(key) === "alex"
  });

  accessor.on.remove(function(key, obj, dict){
    flags.remove = obj === "alex" && key === "a" && !dict.has("a");
  });

  dict("a", "adam");
  dict("a", "alex");
  dict.remove("a")

  flags.insert || t.error("Insert event failed");
  flags.change || t.error("Change event failed");
  flags.remove || t.error("Remove event failed");
});

Lapiz.Test("Dictionary/AccessorEventsProtected", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var accessor = dict.Accessor;

  accessor.on.change(function(key, dict){
    dict("change", true);
  });

  accessor.on.remove(function(key, obj, dict){
    dict("remove", true);
  });

  dict("a", "adam");
  dict("a", "alex");
  dict.remove("a")

  !dict.has("change") || t.error("Gained access through change event");
  !dict.has("remove") || t.error("Gained access through remove event");
});

Lapiz.Test("Dictionary/Keys", ["Event/"], function(t){
  var dict = Lapiz.Dictionary();
  var accessor = dict.Accessor;

  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");

  var dictKeys = dict.keys;
  var accKeys = accessor.keys;

  dictKeys.indexOf("a") > -1 || t.error("Dictionary keys does not contain 'a'");
  dictKeys.indexOf("b") > -1 || t.error("Dictionary keys does not contain 'b'");
  dictKeys.indexOf("c") > -1 || t.error("Dictionary keys does not contain 'c'");

  accKeys.indexOf("a") > -1 || t.error("Accessor keys does not contain 'a'");
  accKeys.indexOf("b") > -1 || t.error("Accessor keys does not contain 'b'");
  accKeys.indexOf("c") > -1 || t.error("Accessor keys does not contain 'c'");
});

Lapiz.Test("Dictionary/FromArray", ["Event/"], function(t){
  var arr = ["Apple", "Bannana", "Cantaloup", "Dates", "Elderberry"];
  var dict = Lapiz.Dictionary(arr);

  dict(0) === "Apple" || t.error("Key 0 is incorrect");
  dict(1) === "Bannana" || t.error("Key 1 is incorrect");
  dict(2) === "Cantaloup" || t.error("Key 2 is incorrect");
});

Lapiz.Test("Dictionary/FromJson", ["Event/"], function(t){
  var arr = {
    "a": "Apple",
    "b": "Bannana",
    "c": "Cantaloup",
    "d": "Dates",
    "e": "Elderberry"
  };
  var dict = Lapiz.Dictionary(arr);

  dict('a') === "Apple" || t.error("Key 0 is incorrect");
  dict('b') === "Bannana" || t.error("Key 1 is incorrect");
  dict('c') === "Cantaloup" || t.error("Key 2 is incorrect");
});
