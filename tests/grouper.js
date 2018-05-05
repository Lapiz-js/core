(function(){
  var data = {
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
  };

  Lapiz.Test("Group/AddRemove", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);

    !group.has(1)               || t.error("Did not expect 1");
    group.Add(1);
    group.Add(1); // test double add
    group.has(1)                || t.error("Expected 1");
    group.keys.length === 1     || t.error("Expected length 1");
    group(1).name === "Stephen" || t.error("Expected 'Stephen'");
    group.Add(2);
    group.length === 2          || t.error("Expected length 2");
    group.has(2)                || t.error("Expected 2");
    group.Remove(2);
    group.length === 1          || t.error("Expected length 2");
    !group.has(2)               || t.error("Did not expected 2");
  });

  Lapiz.Test("Group/Sort", ["Group/AddRemove"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(2);
    group.Add(4);

    var sort = group.Sort("name");
    
    sort.keys.length === 3 || t.error("Expected length 3");
    sort.keys[0] === "4"   || t.error("Expected '4'");
    sort.keys[1] === "2"   || t.error("Expected '4'");
    sort.keys[2] === "1"   || t.error("Expected '4'");
  });

  Lapiz.Test("Group/Filter", ["Group/AddRemove"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(3);
    group.Add(4);

    var filter = group.Filter(function(key, accessor){
    	return accessor(key).name[0] === "A";
    });

    !filter.has(1) || t.error("Did not expected 1");
    filter.has(3)  || t.error("Expected 3");
    filter.has(4)  || t.error("Expected 4");
  });

  Lapiz.Test("Group/Each", ["Group/AddRemove"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(3);
    group.Add(4);
    var count = 0;
    var found = group.each(function(val, key){
    	count++;
    	return key==='4';
    })

    count === 3 || t.error("Expected 3");
    found       || t.error("Did not find 4");
  });

  Lapiz.Test("Group/Remove", ["Group/AddRemove"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(3);
    group.Add(4);
    var removed = false;
    group.on.remove(function(key){
    	removed = key === '4';
    });
    dict.remove(4);

    removed || t.error("Did not remove 4");
  });

  Lapiz.Test("Group/Change", ["Group/AddRemove"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(3);
    group.Add(4);
    var changed = false;
    group.on.change(function(key){
    	changed = key === '4';
    });
    dict(4, {
      name: "Alexander", 
      fruit: "dragon fruit"
    });

    changed || t.error("Did not change 4");
  });

  Lapiz.Test("Group/Kill", ["Group/Change"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(3);
    group.Add(4);
    var changed = false;
    group.on.change(function(key){
    	changed = true;
    });
    group.kill();
    dict(4, {
      name: "Alexander", 
      fruit: "dragon fruit"
    });

    !changed                      || t.error("Should not have fired change");
    group(4).name === "Alexander" || t.error("Should still reference accessor");
  });

  Lapiz.Test("Group/DoNotListen", ["Group/Change"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict, {"DoNotListen": true});
    group.Add(1);
    group.Add(3);
    group.Add(4);
    var changed = false;
    group.on.change(function(key){
    	changed = true;
    });
    dict(4, {
      name: "Alexander", 
      fruit: "dragon fruit"
    });

    !changed                      || t.error("Should not have fired change");
    group(4).name === "Alexander" || t.error("Should still reference accessor");
    group.kill === undefined      || t.error("Should not have kill method");
  });

  Lapiz.Test("Group/Accessor", ["Group/AddRemove"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);
    group.Add(1);
    group.Add(2);
    group.Add(4);

    var acc = group.Accessor;
    group.Add !== undefined || t.error("Should be defined");
    acc.Add === undefined   || t.error("Should be undefined");
    acc(4).name === "Alex"  || t.error("Expected 'Alex'");
  });
})();

(function(){
  var data = {
    37: {
      name: "Stephen",
      role: "admin"
    },
    66: {
      name: "Lauren",
      role: "editor"
    },
    19: {
      name: "Adam", 
      role: "admin"
    },
    38:{
      name: "anonymous"
    },
    68: {
      name: "Alex", 
      role: "user"
    },
    39: {
      name: "Nathan",
      role: "editor"
    },
    53: {
      name: "unregistered",
    },
    76: {
      name: "Chris",
      role: "user"
    }
  };

  Lapiz.Test("GroupBy/GroupBy", ["Group/"], function(t){
    var dict = Lapiz.Dictionary(data);
    var groupBy = Lapiz.GroupBy(dict, "role");
    
    var admins = groupBy("admin");
    admins.length === 2 || t.error("Expected two admins");

    groupBy.has("editor") || t.error("Expected 'editor' group");
    !groupBy.has("hr")    || t.error("Did not expect 'hr' group");

    groupBy.keys.indexOf("user") > -1 || t.error("Expected keys to contain user");
    groupBy.keys.length === 3 || t.error("Expected three keys");
    groupBy.length === 3      || t.error("Expected length of three");
  });

  Lapiz.Test("GroupBy/Events", ["GroupBy/GroupBy"], function(t){
    var dict = Lapiz.Dictionary();
    var groupBy = Lapiz.GroupBy(dict, "role");
    
    var admins = groupBy("admin");
    var added, removed, changed;
    admins.on.insert = function(key, accessor){
      added = accessor(key);
    };
    admins.on.remove = function(key, accessor, oldVal){
      removed = oldVal;
    };
    admins.on.change = function(key, accessor, oldVal){
      changed = key;
    };

    // just testing that some paths don't blow up
    dict(53, data[53]);
    dict(91, {name: "anonymous"});
    dict(53, {name: "anonymous"});
    dict(91, {name: "anonymous", role: "editor"});

    dict(68, data[68]);
    groupBy("user").length === 1 || t.error("Expected one user");

    dict(37, data[37]);
    added === data[37]   || t.error("Expected added to be Stephen");

    dict(66, data[66]);
    added === data[37]   || t.error("Expected added to be still be Stephen");

    dict(19, data[19]);
    added === data[19]   || t.error("Expected added to be Adam");

    dict.remove(53);

    dict.remove(37);
    removed === data[37] || t.error("Expected removed to be Stephen");

    dict(19, {
      name: "The Beast",
      role: "admin"
    });
    changed === "19"     || t.error("Expected changed to be 19");
  });

  Lapiz.Test("GroupBy/Rescan", ["GroupBy/Events"], function(t){
    var dict = Lapiz.Dictionary(data);
    var groupBy = Lapiz.GroupBy(dict, "role");
    
    var admins = groupBy("admin");
    var editors = groupBy("editor");
    admins.length === 2  || t.error("Expected two admins");
    editors.length === 2 || t.error("Expected two editors");

    var added = 0;
    var removed = 0;
    admins.on.insert = function(key, accessor){
      added++;
    }
    editors.on.remove = function(key, accessor, oldVal){
      removed++;
    }

    data[66].role = "admin";
    data[39].role = "avenger";
    admins.length === 2 || t.error("Still expected two admins");
    groupBy.ForceRescan();
    admins.length === 3 || t.error("Expected three admins");
    removed === 2       || t.error("Expected remove to fire twice, got "+removed);
    added === 1         || t.error("Expected added to fire once, got "+added);
    
    // reset data
    data[66].role = "editor";
  });
})();