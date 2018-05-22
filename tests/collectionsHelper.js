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

Lapiz.Test("CollectionsHelper/each/Array", function(t){
  var arr = [3,1,4,5,9];
  var dbl = [];
  Lapiz.each(arr, function(v,i){
    dbl.push(v*2);
    arr[i] === v || t.error("Wrong value for index");
  });

  dbl[2] === 8 || t.error('Should have 8');
});

Lapiz.Test("CollectionsHelper/each/ArrayFind", function(t){
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

Lapiz.Test("CollectionsHelper/each/Object", function(t){
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

Lapiz.Test("CollectionsHelper/each/nullOrUndefined", function(t){
  var x = Lapiz.each(null, function(v,k){
    t.error("Invoked each function for null");
  });
  x === undefined || t.error("Expected undefined for null");

  x = Lapiz.each(undefined, function(v,k){
    t.error("Invoked each function for undefined");
  });
  x === undefined || t.error("Expected undefined for undefined");
});

Lapiz.Test("CollectionsHelper/each/ObjectFind", function(t){
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

Lapiz.Test("CollectionsHelper/Method", function(t){
  var obj = {};
  var flag = "failed";
  function foo(val){
    flag = val;
  }
  Lapiz.set.meth(obj, foo);
  Lapiz.set.meth(obj, "bar", foo);

  obj.foo("pass A");
  flag === "pass A" || t.error("Expected 'pass A'");

  obj.bar("pass B");
  flag === "pass B" || t.error("Expected 'pass B'");
});

Lapiz.Test("CollectionsHelper/SetterMethod", function(t){
  var obj = {};
  var flag = "failed";
  Lapiz.set.setterMethod(obj, function foo(val){
    flag = val;
  });

  obj.foo("pass A");
  flag === "pass A" || t.error("Expected 'pass A'");

  obj.foo = "pass B";
  flag === "pass B" || t.error("Expected 'pass B'");
});

Lapiz.Test("CollectionsHelper/BindSetterMethod", function(t){
  var obj = {
    flag: "failed"
  };
  Lapiz.set.setterMethod(obj, function foo(val){
    this.flag = val;
  }, obj);

  var fn = obj.foo
  fn("pass A");
  obj.flag === "pass A" || t.error("Expected 'pass A': got: " + obj.flag);

  obj.foo = "pass B";
  obj.flag === "pass B" || t.error("Expected 'pass B' got: " + obj.flag);
});

Lapiz.Test("CollectionsHelper/Getter/NamedFunc", function(t){
  var obj = {};
  var ctr = 0;
  Lapiz.set.getter(obj, function foo(){
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
  Lapiz.set.getter(obj, "foo", function(){
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
  Lapiz.set.getter(obj, [
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
  Lapiz.set.getter(obj, {
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
  Lapiz.set.setterGetter(obj, "foo", 12, function(i){return parseInt(i);});
  Lapiz.set.setterGetter(obj, "money", 5.67333, "number", function(val){
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
  Lapiz.set.copyProps(objTo, objFrom, "A", "C");

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
  Lapiz.set.copyProps(objTo, objFrom, "&A", "&C");

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

  errMsg(function(){Lapiz.set.meth(function foo(){});}) === "Meth called without object: foo" || t.error("Expected meth error");
  errMsg(function(){Lapiz.set.meth({}, function(){});}) === "Meth requires either name and func or named function" || t.error("Expected meth error");
  errMsg(function(){Lapiz.set.setterMethod(function foo(){});}) === "SetterMethod called without object: foo" || t.error("Expected setterMethod error");
  errMsg(function(){Lapiz.set.setterMethod({}, "", function(){});}) === "SetterMethod name cannot be empty string" || t.error("Expected setterMethod error");
  errMsg(function(){Lapiz.set.getter(function foo(){});}) === "Getter called without object: foo" || t.error("Expected getter error");
  errMsg(function(){Lapiz.set.getter({}, "", function(){});}) === "Getter name cannot be empty string" || t.error("Expected setterMethod error");
  errMsg(function(){Lapiz.set.setProperties();}) === "Got undefined for obj in setProperties" || t.error("Expected setProperties error");
  errMsg(function(){Lapiz.set.binder({},function(){});}) === "Expected named function, got anonymous" || t.error("Expected 'Expected named function, got anonymous' error");
  errMsg(function(){Lapiz.set.binder({},"",function foo(){});}) === "Invalid name for binder function" || t.error("Expected 'Invalid name for binder function' error");
  errMsg(function(){Lapiz.Namespace().getter();}) === "Namespace getter requires at least one argument" || t.error("Expected 'Invalid name for binder function' error");
  
  var em = errMsg(function(){
    var p = {};
    Lapiz.set.binder(p, function foo(){});
    p.foo = "test";
  })
  em === "Cannot reassign method foo" || t.error("Expected binder error");
});

Lapiz.Test("CollectionsHelper/SetProperties", function(t){
  var obj = Lapiz.Map();
  var attr = Lapiz.Map();
  var change = Lapiz.Event();
  var setterEvt = Lapiz.Event();
  Lapiz.set.setProperties(obj, attr, {
    "*id": "int",
    "name": "string", 
    "foo": function(val){
      if (val === attr['foo']){
        this.set = false;
      }
      this.callback = setterEvt.fire;
      return val;
    }
  }, change.fire);

  var inc = 0;
  change.register(function(){
    inc++;
  });

  var setterEvtCalled = false;
  setterEvt.register(function(){
    setterEvtCalled = true;
  })

  obj.id = 21;
  obj.id === 21    || t.error("Wrong ID");
  inc === 1        || t.error("inc should be 1");
  !setterEvtCalled || t.error("SetterEvt should not have been called")

  obj.foo = 'test';
  obj.foo === 'test' || t.error("Expected 'test'");
  inc === 2          || t.error("inc should be 2");
  setterEvtCalled    || t.error("SetterEvt should have been called")
  obj.foo = 'test';
  inc === 2          || t.error("inc should still be 2");
});

Lapiz.Test("CollectionsHelper/SetterFactory", function(t){
  var self = {};
  var attr = {};

  var flag1 = false;
  function callback1(){
    flag1 = "Test 1";
  };

  var flag2 = false;
  function callback2(){
    flag2 = "Test 2";
  }

  function setter(val){
    this.callback = callback2;
    return Lapiz.parse.int(val);
  }

  self.foo = Lapiz.set.setterFactory(self, attr, "foo", setter, callback1)
  self.foo("22");

  attr.foo === 22    || t.error("Expected 22");
  flag1 === "Test 1" || t.error("Expected 'Test 1'");
  flag2 === "Test 2" || t.error("Expected 'Test 2'");
});

Lapiz.Test("CollectionsHelper/Namespace/Set", function(t){
  var ns = Lapiz.Namespace(function(){
    this.set("A", "apple");
  });
  ns.A === "apple" || t.error("Expected 'apple', got "+ns.A);
  ns.A = "banana"
  ns.A === "apple" || t.error("Still expected 'apple', got "+ns.A);
});

Lapiz.Test("CollectionsHelper/Namespace/Getter", function(t){
  var ns = Lapiz.Namespace(function(){
    var inc = 0
    this.getter(function Inc(){
      inc++
      return inc;
    });
  });
  ns.Inc === 1 || t.error("Expected 1");
  ns.Inc === 2 || t.error("Expected 2");
});

Lapiz.Test("CollectionsHelper/Namespace/SetterMethod", function(t){
  var bar;
  var ns = Lapiz.Namespace(function(){
    this.setterMethod(function foo(val){
      bar = val;
    });
  });

  ns.foo = "A";
  bar === "A" || t.error("Expected 'A'");
  ns.foo("B");
  bar === "B" || t.error("Expected 'B'");
});

Lapiz.Test("CollectionsHelper/Namespace/Meth", function(t){
  var ns = Lapiz.Namespace(function(){
    this.meth(function foo(){
      return "Foo";
    });
  });
  ns.foo() === "Foo" || t.error("Expected 'Foo'");
});

Lapiz.Test("CollectionsHelper/Namespace/Properties", function(t){
  var errStr = false;

  var ns = Lapiz.Namespace(function(){
    this.properties({
      "*id"  : "int",
      "name" : {
        "get": function(){ return this.attr.name; },
        "set": Lapiz.parse.string
      },
      "age"  : "int",
      "+foo" : function(){ return "Foo"; },
      "+baz" : null
    },{
      "id"   : 12,
      "name" : "Adam",
      "age"  : 32,
      "baz"  : "enders eye"
    });

    try {
      this.properties({
        "bar": undefined
      });
    } catch(err){
      errStr = err.message;
    }
  });

  ns.foo === "Foo"                     || t.error("Expected 'Foo', got " + ns.foo);
  ns.id === 12                         || t.error("Expected 12, got " + ns.id);
  errStr === "Invalid value for 'bar'" || t.error("Expected error");
  ns.baz === "enders eye"              || t.error("Expected 'enders eye'");

  errStr = false;
  try {
    ns.foo = "test";
  } catch(err){
    errStr = err.message;
  }
  errStr === "Cannot set readonly property" || t.error("Expected error");
  ns.foo === "Foo"                          || t.error("Expected 'Foo', got " + ns.foo);

  errStr = false;
  try {
    ns.id = 123;
  } catch(err){
    errStr = err.message;
  }
  ns.id === 12 || t.error("Expected 12, got " + ns.id);
  errStr === "Cannot set readonly property" || t.error("Expected error");
});

Lapiz.Test("CollectionsHelper/ArgMap", function(t){
  var coord = function(x,y){
    return Lapiz.argMap();
  }(3,4);

  coord['x'] === 3 || t.error("expected 3");
  coord['y'] === 4 || t.error("expected 4");
});

Lapiz.Test("CollectionsHelper/ArgMapLevels", function(t){
  var coord = function(x,y){
    return function(){
      return Lapiz.argMap(1);
    }();
  }(3,4);

  coord['x'] === 3 || t.error("expected 3");
  coord['y'] === 4 || t.error("expected 4");
  Object.keys(coord).length === 2 || t.error("expected 2 values");
});

Lapiz.Test("CollectionsHelper/TooManyArgMapLevels", function(t){
  var coord = function(x,y){
    return function(){
      return Lapiz.argMap(100);
    }();
  }(3,4);

  Object.keys(coord).length === 0 || t.error("expected empty map");
});