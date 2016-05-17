Lapiz.Test("CollectionsHelper/Namespace-Set", function(t){
  var ns = Lapiz.Namespace();
  ns.set("foo","bar");

  ns.namespace.foo === "bar" || t.error('Expected namespace.foo === "bar"');
});

Lapiz.Test("CollectionsHelper/Namespace-Method", function(t){
  var ns = Lapiz.Namespace();
  ns.meth(function foo(){
    return "bar";
  });

  ns.namespace.foo() === "bar" || t.error('Expected namespace.foo() === "bar"');
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
  Lapiz.each(arr, function(i,v){
    dbl.push(v*2);
    arr[i] === v || t.error("Wrong value for index");
  });

  dbl[2] === 8 || t.error('Should have 8');
});

Lapiz.Test("CollectionsHelper/ObjectEach", function(t){
  var obj = {
    "A":"apple",
    "B":"bannana",
    "C":"cantaloupe",
    "D":"dates",
  };
  Lapiz.each(obj, function(k,v){
    obj[k] === v || t.error("Wrong value for key");
  });
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
  Lapiz.Map.meth(obj, function foo(val){
    flag = val;
  });

  obj.foo("pass");
  flag === "pass" || t.error("Expected 'pass'");
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

Lapiz.Test("CollectionsHelper/Getter", function(t){
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

Lapiz.Test("CollectionsHelper/SetterGetter", function(t){
  var obj = {};
  Lapiz.Map.setterGetter(obj, "foo", function(i){return parseInt(i);});

  obj.foo = 12;
  obj.foo === 12 || t.error("Expected 12");

  obj.foo = "22";
  obj.foo === 22 || t.error("Expected 22");
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

Lapiz.Test("TypeCheck/String", function(t){
  var str = "Hello";
  Lapiz.typeCheck(str, "string")  || t.error("Expected true");
  !Lapiz.typeCheck(str, "object") || t.error("Expected false");
});

Lapiz.Test("TypeCheck/Err", function(t){
  var str = "Hello";
  var msgRcv = "";
  var msg = "This is an expected error";
  try {
    Lapiz.typeCheck(str, "force error", "This is an expected error");
  } catch(err){
    msgRcv = err.message;
  }

  msgRcv === msg || t.error("Did not receive expected error");
});

Lapiz.Test("TypeCheck/Array", function(t){
  var arr = [];
  Lapiz.typeCheck(arr, Array)    || t.error("Expected true");
  !Lapiz.typeCheck(arr, "array") || t.error("Expected false");
});

Lapiz.Test("TypeCheck/Helpers", function(t){
  var fn = function(){};
  var str = "test";
  var arr = [3,1,4];
  var num = 12;

  Lapiz.typeCheck.func(fn) || t.error("Expected true");
  Lapiz.typeCheck.array(arr)   || t.error("Expected true");
  Lapiz.typeCheck.string(str)  || t.error("Expected true");
  Lapiz.typeCheck.number(num)  || t.error("Expected true");

  !Lapiz.typeCheck.func(arr) || t.error("Expected false");
  !Lapiz.typeCheck.array(fn)     || t.error("Expected false");
  !Lapiz.typeCheck.string(fn)    || t.error("Expected false");
  !Lapiz.typeCheck.number(fn)    || t.error("Expected false");

});
