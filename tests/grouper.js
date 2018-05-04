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

  var fruit = ["apple" ,"bananna" ,"cantaloup" ,"dates" ,"elderberry"];

  Lapiz.Test("Group/AddRemove", ["Dictionary/"], function(t){
    var dict = Lapiz.Dictionary(data);
    var group = Lapiz.Group(dict);

    !group.has(1)               || t.error("Did not expect 1");
    group.Add(1);
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
})();