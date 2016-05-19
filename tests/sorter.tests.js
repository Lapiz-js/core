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

  Lapiz.Test("Sorter/Sort", ["Dictionary/"], function(t){
    var nameSorter = Lapiz.Sort(dict, "name");

    var flag, k;

    flag = true;
    k = nameSorter.keys;
    Lapiz.each(['3','4','2','1'], function(i, val){
      flag = flag && val === k[i];
    })
    flag || t.error("Expected" + ['3','4','2','1'] + ", got " + nameSorter.keys);

    var fruitSorter = Lapiz.Sort(dict, function(a,b){
      return (a.fruit > b.fruit ? 1 : (b.fruit > a.fruit ? -1 : 0));
    });

    flag = true;
    k = fruitSorter.keys;
    Lapiz.each(['1','2','3','4'], function(i, val){
      flag = flag && val === k[i];
    })
    flag || t.error("Expected" + ['1','2','3','4'] + ", got " + nameSorter.keys);
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
    sorter.delete();


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
    Lapiz.each(['b','d','a','c'], function(i, val){
      flag = flag && val === k[i];
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
    Lapiz.each(['d','a','c','b'], function(i, val){
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
})();

