Lapiz.Test("CollectionsHelper/Namespace/Set", function(t){
  var ns = Lapiz.Namespace();
  ns.set("foo","bar");

  ns.namespace.foo === "bar" || t.error('Expected namespace.foo === "bar"');
});

Lapiz.Test("CollectionsHelper/Namespace/Getter", function(t){
  var ns = Lapiz.Namespace();
  var bar = "star";
  ns.getter(function foo(){
    return bar;
  });

  ns.namespace.foo === "star" || t.error('Expected namespace.foo === "star"');
  bar = "car";
  ns.namespace.foo === "car" || t.error('Expected namespace.foo === "car"');
});

Lapiz.Test("CollectionsHelper/Namespace/SetterGetter", function(t){
  var ns = Lapiz.Namespace();
  ns.setterGetter("foo", 12, "int");

  ns.namespace.foo === 12 || t.error('Expected namespace.foo === 12');

  ns.namespace.foo = 3.1415;
  ns.namespace.foo === 3 || t.error('Expected namespace.foo === 3');
});

Lapiz.Test("CollectionsHelper/Namespace/Method", function(t){
  var ns = Lapiz.Namespace();
  ns.meth(function foo(){
    return "bar";
  });

  ns.namespace.foo() === "bar" || t.error('Expected namespace.foo() === "bar"');
});

Lapiz.Test("CollectionsHelper/Namespace/Prop", function(t){
  var ns = Lapiz.Namespace();
  ns.prop("foo", {"value":"bar"});

  ns.namespace.foo === "bar" || t.error('Expected namespace.foo === "bar"');
});

Lapiz.Test("CollectionsHelper/Namespace/SetterMethod", function(t){
  var ns = Lapiz.Namespace();
  var test = false;
  ns.setterMethod(function foo(val){
    test = val;
  });

  ns.namespace.foo = "test 1";
  test === "test 1" || t.error('Expected "test 1"');

  ns.namespace.foo("test 2");
  test === "test 2" || t.error('Expected "test 2"');
});

Lapiz.Test("CollectionsHelper/Has", function(t){
  var foo = {"bar" : undefined};

  Lapiz.Map.has(foo, "bar") || t.error('Expected has bar');
});

Lapiz.Test("CollectionsHelper/Map", function(t){
  var map = Lapiz.Map();
  map['foo'] = 'bar'

  map.__proto__ === undefined || t.error('Map should not have __proto__');
  map.foo === "bar"           || t.error('Expected map.foo === "bar"');
});

Lapiz.Test("CollectionsHelper/Remove", function(t){
  var arr = [3,1,4,1,5,9];

  Lapiz.remove(arr,4);
  arr[1] === 1 || t.error('Should have removed 4: '+ arr.join(',') );
  arr[2] === 1 || t.error('Should have removed 4: '+ arr.join(',') );

  Lapiz.remove(arr,1);
  arr[1] === 1 || t.error('Should have removed 1: '+ arr.join(',') );
  arr[2] === 5 || t.error('Should have removed 1: '+ arr.join(',') );
});

Lapiz.Test("CollectionsHelper/ArrayEach", function(t){
  var arr = [3,1,4,5,9];
  var dbl = [];
  Lapiz.each(arr, function(v,i){
    dbl.push(v*2);
    arr[i] === v || t.error("Wrong value for index");
  });

  dbl[2] === 8 || t.error('Should have 8');
});

Lapiz.Test("CollectionsHelper/ArrayEachFind", function(t){
  var arr = [
    {
      "name": "Adam",
      "role": "admin",
    }, {
      "name": "Lauren",
      "role": "editor",
    },{
      "name": "Stephen",
      "role": "admin",
    }
  ];

  var idx = Lapiz.each(arr, function(v,i){
    return v.name === "Lauren";
  });
  idx === 1 || t.error("Expected 1");

  idx = Lapiz.each(arr, function(v,i){
    return v.name === "Chris";
  });
  idx === -1 || t.error("Expected -1");
});

Lapiz.Test("CollectionsHelper/ObjectEach", function(t){
  var obj = {
    "A":"apple",
    "B":"bannana",
    "C":"cantaloupe",
    "D":"dates",
  };
  Lapiz.each(obj, function(v,k){
    obj[k] === v || t.error("Wrong value for key");
  });
});

Lapiz.Test("CollectionsHelper/ObjectEachFind", function(t){
  var objs = {
      "Adam"   : "admin",
      "Lauren" : "editor",
      "Stephen": "admin",
  };

  var name = Lapiz.each(objs, function(role, name){
    return name === "Lauren";
  });
  name === "Lauren" || t.error("Expected 'Lauren', got: "+role);

  name = Lapiz.each(objs, function(v, i){
    return i === "Chris";
  });
  name === undefined || t.error("Expected undefined, got: "+role);
});

Lapiz.Test("CollectionsHelper/NamespaceConstructor", function(t){
  var foo = Lapiz.Namespace(function(){
    this.meth(function hello(name){
      return "Hello, "+name;
    });
    this.set("foo", "bar");
  });

  foo.hello("Adam") === "Hello, Adam" || t.error("Expected 'Hello, Adam'");
  foo.foo === "bar"                   || t.error("Expected 'bar'");
});

Lapiz.Test("CollectionsHelper/Method", function(t){
  var obj = {};
  var flag = "failed";
  function foo(val){
    flag = val;
  }
  Lapiz.Map.meth(obj, foo);
  Lapiz.Map.meth(obj, "bar", foo);

  obj.foo("pass A");
  flag === "pass A" || t.error("Expected 'pass A'");

  obj.bar("pass B");
  flag === "pass B" || t.error("Expected 'pass B'");
});

Lapiz.Test("CollectionsHelper/SetterMethod", function(t){
  var obj = {};
  var flag = "failed";
  Lapiz.Map.setterMethod(obj, function foo(val){
    flag = val;
  });

  obj.foo("pass A");
  flag === "pass A" || t.error("Expected 'pass A'");

  obj.foo = "pass B";
  flag === "pass B" || t.error("Expected 'pass B'");
});

Lapiz.Test("CollectionsHelper/Getter/NamedFunc", function(t){
  var obj = {};
  var ctr = 0;
  Lapiz.Map.getter(obj, function foo(){
    var c = ctr;
    ctr +=1;
    return c;
  });

  obj.foo === 0 || t.error("Expected 0");
  obj.foo === 1 || t.error("Expected 1");
  obj.foo === 2 || t.error("Expected 2");
});

Lapiz.Test("CollectionsHelper/Getter/NamedStr", function(t){
  var obj = {};
  var ctr = 0;
  Lapiz.Map.getter(obj, "foo", function(){
    var c = ctr;
    ctr +=1;
    return c;
  });

  obj.foo === 0 || t.error("Expected 0");
  obj.foo === 1 || t.error("Expected 1");
  obj.foo === 2 || t.error("Expected 2");
});

Lapiz.Test("CollectionsHelper/Getter/Array", function(t){
  var obj = {};
  var ctr = 0;
  Lapiz.Map.getter(obj, [
    function foo(){
      var c = ctr;
      ctr +=1;
      return c;
    },
    function bar(){
      return "bar";
    }
  ]);

  obj.foo === 0     || t.error("Expected 0");
  obj.foo === 1     || t.error("Expected 1");
  obj.foo === 2     || t.error("Expected 2");
  obj.bar === "bar" || t.error("Expected 'bar'");
});

Lapiz.Test("CollectionsHelper/Getter/Object", function(t){
  var obj = {};
  var ctr = 0;
  Lapiz.Map.getter(obj, {
    "foo": function(){
      var c = ctr;
      ctr +=1;
      return c;
    },
    "bar": function(){
      return "bar";
    }
  });

  obj.foo === 0     || t.error("Expected 0");
  obj.foo === 1     || t.error("Expected 1");
  obj.foo === 2     || t.error("Expected 2");
  obj.bar === "bar" || t.error("Expected 'bar'");
});

Lapiz.Test("CollectionsHelper/SetterGetter", function(t){
  var obj = {};
  Lapiz.Map.setterGetter(obj, "foo", 12, function(i){return parseInt(i);});
  Lapiz.Map.setterGetter(obj, "money", 5.67333, "number", function(val){
    return "$" + (val.toFixed(2));
  });

  obj.foo === 12 || t.error("Expected 12");
  obj.foo = "22";
  obj.foo === 22 || t.error("Expected 22");

  obj.money === "$5.67" || t.error ("Expected $5.67 got: " + obj.money);
  obj.money = 13;
  obj.money === "$13.00" || t.error ("Expected $13.00 got: " + obj.money);
});

Lapiz.Test("CollectionsHelper/CopyPropVal", function(t){
  var objTo = {};
  var objFrom = {
    "A": "apple",
    "B": "banana",
    "C": "cantaloupe",
  };
  Lapiz.Map.copyProps(objTo, objFrom, "A", "C");

  objTo.A === "apple"      || t.error("Expected 'apple'");
  objTo.C === "cantaloupe" || t.error("Expected 'cantaloupe'");
});

Lapiz.Test("CollectionsHelper/CopyPropRef", function(t){
  var objTo = {};
  var objFrom = {
    "A": "apple",
    "B": "banana",
    "C": "cantaloupe",
  };
  Lapiz.Map.copyProps(objTo, objFrom, "&A", "&C");

  objTo.A === "apple"      || t.error("Expected 'apple', got "+objTo.A);
  objTo.C === "cantaloupe" || t.error("Expected 'cantaloupe'");

  objTo.A = "apricot";
  objTo.A === "apricot"   || t.error("Expected 'apricot', got "+objTo.A);
  objFrom.A === "apricot" || t.error("Expected 'apricot', got "+objFrom.A);
});

Lapiz.Test("CollectionsHelper/BadConstructorsTest", function(t){
  function errMsg(fn){
    try{
      fn();
    } catch(err){
      return err.message;
    }
  }

  errMsg(function(){Lapiz.Map.meth(function foo(){});}) === "Meth called without object: foo" || t.error("Expected meth error");
  errMsg(function(){Lapiz.Map.meth({}, function(){});}) === "Meth requires either name and func or named function" || t.error("Expected meth error");
  errMsg(function(){Lapiz.Map.setterMethod(function foo(){});}) === "SetterMethod called without object: foo" || t.error("Expected setterMethod error");
  errMsg(function(){Lapiz.Map.setterMethod({}, "", function(){});}) === "SetterMethod name cannot be empty string" || t.error("Expected setterMethod error");
  errMsg(function(){Lapiz.Map.getter(function foo(){});}) === "Getter called without object: foo" || t.error("Expected getter error");
  errMsg(function(){Lapiz.Map.getter({}, "", function(){});}) === "Getter name cannot be empty string" || t.error("Expected setterMethod error");
});
