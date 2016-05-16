(function(){
  var dict = Lapiz.Dictionary({
    1: {
      name: "Stephen",
      fruit:"apple"
    },
    2: {
      name: "Lauren",
      fruit: "bananna"
    },
    3: {
      name: "Adam", 
      fruit: "cantaloup"
    },
    4: {
      name: "Alex", 
      fruit: "dates"
    }
  });

  Lapiz.Test("Filter/Filter", ["Dictionary/"], function(t){
    var nameFilter = Lapiz.Filter(dict, function(key, accessor){
      return accessor(key).name > "B";
    });

    nameFilter.has(1)  || t.error("Expected 1");
    nameFilter.has(2)  || t.error("Expected 2");
    !nameFilter.has(3) || t.error("Did not expected 3");
    !nameFilter.has(4) || t.error("Did not expected 4");
  });

  Lapiz.Test("Filter/Insert", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(4,"bananna");
    dict(2,"dates");
    dict(5,"elderberry");
    var filter = Lapiz.Filter(dict, function(key, accessor){
      return accessor(key) > "b";
    });

    var flag = false;
    filter.on.insert = function(key, sorter){
      flag = true;
    };
    dict(6,"cantaloup");
    dict(3,"apricot");

    flag                   || t.error("filter insert event did not fire");
    filter.has(6)          || t.error("cantaloup is not in the list");
    !filter.has(3)         || t.error("apricot is in the list, but should not be");
  });

  Lapiz.Test("Filter/Remove", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(2,"bananna");
    dict(3,"cantaloup");
    dict(4,"dates");
    dict(5,"elderberry");
    var filter = Lapiz.Filter(dict, function(key, accessor){
      return accessor(key) > "b";
    });

    var flag = false;
    filter.on.remove = function(key, obj, sorter){
      flag = true;
    };

    dict.remove(1);
    !flag          || t.error("Remove was fired and should not have been");

    dict.remove(3);
    flag           || t.error("Remove was not fired")
    !filter.has(3) || t.error("Filter still has 3:cantaloup");
  });

  Lapiz.Test("Filter/Change", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(2,"bananna");
    dict(3,"cantaloup");
    dict(4,"dates");
    dict(5,"elderberry");
    var filter = Lapiz.Filter(dict, function(key, accessor){
      return accessor(key) > "b";
    });

    var flags = {
      change: false,
      insert: false,
      remove: false
    };

    filter.on.change = function(){ flags.change = true;};
    filter.on.insert = function(){ flags.insert = true;};
    filter.on.remove = function(){ flags.remove = true;};

    dict(1, "watermelon"); //insert
    dict(2, "apricot"); //remove
    dict(3, "cherry"); //change

    flags.change || t.error("Change flag not set");
    flags.insert || t.error("Insert flag not set");
    flags.remove || t.error("Remove flag not set");
  });

  Lapiz.Test("Filter/Func", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(2,"bananna");
    dict(3,"cantaloup");
    dict(4,"dates");
    dict(5,"elderberry");
    var filter = Lapiz.Filter(dict, function(key, accessor){
      return accessor(key) > "b";
    });

    filter.has(3)  || t.error("Expected 3");
    !filter.has(1) || t.error("Did not expect 1");

    filter.func = function(key, accessor){
      return accessor(key) < "b";
    };

    !filter.has(3)  || t.error("Did not expect 3");
    filter.has(1) || t.error("Expect 1");
  });
  Lapiz.Test("Filter/FuncOnChange", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(2,"bananna");
    dict(3,"cantaloup");
    dict(4,"dates");
    dict(5,"elderberry");

    var gt = "b";
    var filterFn = function(key, accessor){
      return accessor(key) > gt;
    };
    var gtEvent = Lapiz.Event();
    filterFn.on = Lapiz.Map();
    filterFn.on.change = gtEvent.register;

    var filter = Lapiz.Filter(dict, filterFn);

    filter.has(5)  || t.error("Expected 5");
    filter.has(3)  || t.error("Expected 3");
    !filter.has(1) || t.error("Did not expect 1");

    gt = "d";
    gtEvent.fire();

    filter.has(5)  || t.error("Expected 5");
    !filter.has(3)  || t.error("Did not expect 3");
    !filter.has(1) || t.error("Did not expect 1");
  });
})();