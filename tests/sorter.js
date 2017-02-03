/*
== IE Bug ==
Given:
  arr = [3,4,1,2];
Most browsers will correctly sort the list with
  arr.sort(function(a,b){
    return a > b;
  });
However, IE expects a ternary value with 1 = a>b, 0 = a==b and -1 = a<b
For that reason, the following pattern appears through out these tests
as well as withing the Lapiz sorter module
  return (a > b ? 1 : (b > a ? -1 : 0));
*/

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
  var dict = Lapiz.Dictionary(data);

  Lapiz.Test("Sorter/Sort", ["Dictionary/"], function(t){
    var nameSorter = Lapiz.Sort(dict, "name");
    var flag = true;
    var k = nameSorter.keys;
    Lapiz.each(['3','4','2','1'], function(val, i){
      flag = flag && val === k[i];
    })
    flag || t.error("Expected" + ['3','4','2','1'] + ", got " + nameSorter.keys);

    var fruitSorter = Lapiz.Sort(dict, function(a,b){
      return (a.fruit > b.fruit ? 1 : (b.fruit > a.fruit ? -1 : 0));
    });

    flag = true;
    k = fruitSorter.keys;
    Lapiz.each(['1','2','3','4'], function(val, i){
      flag = flag && val === k[i];
    })
    flag || t.error("Expected" + ['1','2','3','4'] + ", got " + nameSorter.keys);
    nameSorter('3').name === "Adam" || t.error("Expected 'Adam'");
  });

  Lapiz.Test("Sorter/SortByField", ["Sorter/Sort"], function(t){
    var nameSorter = dict.Sort("name");
    nameSorter.keys[0] === "3" || t.error("First item in list storted by name should be 3, got " + nameSorter.keys[0]);

    var fruitSorter = Lapiz.Sort(dict, "fruit");
    fruitSorter.keys[0] === "1" || t.error("First item in list storted by fruit should be 1, got " + fruitSorter.keys[0]);
  });

  Lapiz.Test("Sorter/SortByKey", ["Sorter/Sort"], function(t){
    var keySorter = Lapiz.Sort(dict);
    keySorter.keys[0] === "1" || t.error("First item in list storted by keys should be 1, got " + fruitSorter.keys[0]);
  });

  Lapiz.Test("Sorter/Insert", ["Sorter/Sort"], function(t){
    // this is a bad test - it is unclear if sorting on key or value.
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(4,"bananna");
    dict(2,"dates");
    dict(5,"elderberry");
    var sorter = Lapiz.Sort(dict);

    var flag = false;
    sorter.on.insert = function(key, sorter){
      flag = true;
    };
    dict(6,"cantaloup");
    dict(3,"figs");

    flag                   || t.error("sorter insert event did not fire");
    sorter.keys[2] === "6" || t.error("cantaloup is not in the correct position; expected '1,4,6,2,5,3', got " + sorter.keys);
    sorter.keys[5] === "3" || t.error("figs is not in the correct position");
  });

  Lapiz.Test("Sorter/Remove", ["Sorter/Sort"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(2,"bananna");
    dict(3,"cantaloup");
    dict(4,"dates");
    dict(5,"elderberry");
    var sorter = Lapiz.Sort(dict);

    var flag = false;
    sorter.on.remove = function(key, obj, sorter){
      flag = true;
    };
    dict.remove(3);
    var keys = sorter.keys;

    flag                     || t.error("sorter remove event did not fire");
    keys.indexOf("3") === -1 || t.error("key 3 is still in the list");
    keys[0] === "1"          || t.error("key 1 is in the wrong position")
    keys[1] === "2"          || t.error("key 2 is in the wrong position")
    keys[2] === "4"          || t.error("key 4 is in the wrong position")
    keys[3] === "5"          || t.error("key 5 is in the wrong position")
  });

  Lapiz.Test("Sorter/Delete", ["Sorter/Sort"], function(t){
    var dict = Lapiz.Dictionary();
    dict(1,"apple");
    dict(2,"bananna");
    dict(3,"cantaloup");
    dict(4,"dates");
    var sorter = Lapiz.Sort(dict);
    sorter.kill();


    var removeFlag = false;
    var insertFlag = false;
    sorter.on.remove = function(key, obj, sorter){
      removeFlag = true;
    };
    sorter.on.insert = function(key, sorter){
      insertFlag = true;
    };

    dict(5,"elderberry");
    dict.remove(4);
    var keys = sorter.keys;

    !removeFlag || t.error("Remove was called");
    !insertFlag || t.error("Insert was called");
  });

  Lapiz.Test("Sorter/SortDirect", ["Sorter/Sort"], function(t){
    var dict = Lapiz.Dictionary({'a': 'Dan', 'b':'Adam', 'c': 'Jack', 'd':'Bob'});
    var sorted = Lapiz.Sort(dict);

    var flag, k;

    flag = true;
    k = sorted.keys;
    var i=0;
    sorted.each(function(val, key, acc){
      flag = flag && key === k[i];
      i += 1;
    })
    flag || t.error("Expected " + ['b','d','a','c'] + ", got " + k);
  });

  Lapiz.Test("Sorter/OnChange", ["Sorter/Sort"], function(t){
    var dict = Lapiz.Dictionary({'a': 'Dan', 'b':'Adam', 'c': 'Jack', 'd':'Bob'});
    var sorted = Lapiz.Sort(dict);

    dict('b', 'Zachary');

    var flag, k;

    flag = true;
    k = sorted.keys;
    Lapiz.each(['d','a','c','b'], function(val, i){
      flag = flag && val === k[i];
    })
    flag || t.error("Expected " + ['d','a','c','b'] + ", got " + k);
  });

  Lapiz.Test("Sorter/Range", ["Sorter/Sort"], function(t){
    var dict = Lapiz.Dictionary({'a': 'Dan', 'b':'Adam', 'c': 'Jack', 'd':'Bob'});
    var sorted = Lapiz.Sort(dict);
    var range = sorted.Range('B','E');

    range('a') === 'Dan' || t.error("Expected 'Dan'");
    !range.has('b')      || t.error("b:Adam should not be in the list");
  });

  Lapiz.Test("Sorter/Each", ["Sorter/Sort"], function(t){
    var sorted = Lapiz.Sort(Lapiz.Dictionary(data));
    var key = sorted.each(function(val){
      return val.name === "Adam";
    });
    key === '3' || t.error("Wrong key");
  });

  Lapiz.Test("Sorter/Func", ["Sorter/Sort"], function(t){
    var sorted = Lapiz.Sort(Lapiz.Dictionary(data));
    sorted.keys[0] === '1' || t.error("Wrong key init");
    sorted.func = "name";
    sorted.keys[0] === '3' || t.error("Wrong key after");
  });

  Lapiz.Test("Sorter/RangeFn", ["Sorter/Sort"], function(t){
    function sortFn(a, b, acc){
      a = acc(a);
      b = acc(b);
      return (a.name > b.name ? 1 : (b.name > a.name ? -1 : 0));
    }
    Lapiz.set.meth(sortFn, function range(key, name, acc){
      var obj = acc(key);
      return (obj.name > name ? 1 : (name > obj.name ? -1 : 0)); 
    });
    var sorted = Lapiz.Sort(Lapiz.Dictionary(data), sortFn);
    var range = sorted.Range('A','B');

    range.length === 2       || t.error("Wrong number of keys");
    range(3).name === 'Adam' || t.error("Expected 'Adam'");
  });

  Lapiz.Test("Sorter/RangeField", ["Sorter/Sort"], function(t){
    var sorted = Lapiz.Sort(Lapiz.Dictionary(data), "name");
    var range = sorted.Range('A','B');

    range.length === 2       || t.error("Wrong number of keys");
    range(3).name === 'Adam' || t.error("Expected 'Adam'");
  });

  Lapiz.Test("Sorter/LocationOf", ["Sorter/Sort"], function(t){
    // this test forces some of the edge cases in locationOf and gt
    var sort = Lapiz.Sort(Lapiz.Dictionary([{i:2}]), "i");
    var range = sort.Range(2);
    (range.length === 1 && range.keys[0] === "0") || t.error("Range(2) failed");
    
    range = sort.Range(3);
    range.length === 0 || t.error("Range(3) failed");
  });
})();

