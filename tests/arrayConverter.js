Lapiz.Test("ArrayConverter/ArrayConverter", ["Dictionary/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");
  var arr = Lapiz.ArrayConverter(dict);

  arr.length === 3          || t.error("Length is not correct");
  arr.indexOf("adam") > -1  || t.error("Did not find adam in array");
  arr.indexOf("bob") > -1   || t.error("Did not find bob in array");
  arr.indexOf("chris") > -1 || t.error("Did not find chris in array");
});

Lapiz.Test("ArrayConverter/OnInsert", ["Dictionary/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");
  var arr = Lapiz.ArrayConverter(dict);

  arr.length === 3          || t.error("Length is not correct");
  arr.indexOf("adam") > -1  || t.error("Did not find adam in array");
  arr.indexOf("bob") > -1   || t.error("Did not find bob in array");
  arr.indexOf("chris") > -1 || t.error("Did not find chris in array");
});

Lapiz.Test("ArrayConverter/OnRemove", ["Dictionary/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");
  var arr = Lapiz.ArrayConverter(dict);
  dict.remove("b")

  arr.length === 2          || t.error("Length is not correct");
  arr.indexOf("adam") > -1  || t.error("Did not find adam in array");
  arr.indexOf("bob") === -1 || t.error("Found bob, should have been removed");
  arr.indexOf("chris") > -1 || t.error("Did not find chris in array");
});

Lapiz.Test("ArrayConverter/OnChange", ["Dictionary/"], function(t){
  var dict = Lapiz.Dictionary();
  dict("a", "adam");
  dict("b", "bob");
  dict("c", "chris");
  var arr = Lapiz.ArrayConverter(dict);
  dict("a","alan")

  arr.length === 3           || t.error("Length is not correct");
  arr.indexOf("alan") > -1   || t.error("Did not find alan in array");
  arr.indexOf("adam") === -1 || t.error("Found adam, should have been removed");
  arr.indexOf("bob") > -1    || t.error("Did not find bob in array");
  arr.indexOf("chris") > -1  || t.error("Did not find chris in array");
});