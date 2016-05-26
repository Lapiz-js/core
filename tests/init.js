Lapiz.Test("Init/TypeCheck/String", function(t){
  var str = "Hello";
  Lapiz.typeCheck(str, "string")  || t.error("Expected true");
  !Lapiz.typeCheck(str, "object") || t.error("Expected false");
});

Lapiz.Test("Init/TypeCheck/Err", function(t){
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

Lapiz.Test("Init/TypeCheck/Array", function(t){
  var arr = [];
  Lapiz.typeCheck(arr, Array)    || t.error("Expected true");
  !Lapiz.typeCheck(arr, "array") || t.error("Expected false");
});

Lapiz.Test("Init/TypeCheck/Helpers", function(t){
  var fn = function(){};
  var str = "test";
  var arr = [3,1,4];
  var num = 12;

  Lapiz.typeCheck.func(fn)    || t.error("Expected true");
  Lapiz.typeCheck.array(arr)  || t.error("Expected true");
  Lapiz.typeCheck.string(str) || t.error("Expected true");
  Lapiz.typeCheck.number(num) || t.error("Expected true");

  !Lapiz.typeCheck.func(arr)  || t.error("Expected false");
  !Lapiz.typeCheck.array(fn)  || t.error("Expected false");
  !Lapiz.typeCheck.string(fn) || t.error("Expected false");
  !Lapiz.typeCheck.number(fn) || t.error("Expected false");
});

Lapiz.Test("Init/TypeCheck/Nested", function(t){
  var obj = {
    "foo": "bar",
    "adam": {
      "name": "Adam",
      "on":{
        "change": function(){}
      }
    }
  };

  Lapiz.typeCheck.nested(obj, "foo", "string") || t.error("obj.foo is a string");
  !Lapiz.typeCheck.nested(obj, "foo", Lapiz.typeCheck.func) || t.error("obj.foo is not a function");
  Lapiz.typeCheck.nested(obj, "adam", "on", "change", Lapiz.typeCheck.func) || t.error("obj.foo is not a function");
});

Lapiz.Test("Init/Modules", function(t){
  var hasRun = false;
  Lapiz.Module("Foo", ["Bar"], function(){
    hasRun = true;
  });
  !hasRun || t.error("Loaded module Foo before dependancy Bar");
  Lapiz.Module("Bar", function(){});
  hasRun || t.error("Did not load module Foo after dependancy Bar");

  Lapiz.Module.Loaded.indexOf("Bar") > -1 || t.error("Did not load module Bar");
});

Lapiz.Test("Init/Assert", function(t){
  var errMsg = false;
  try{
    Lapiz.assert(false, "Testing");
  } catch(err){
    errMsg = err.message;
  }
  errMsg === "Testing" || t.error("Expected error");
});

Lapiz.Test("Init/Set", function(t){
  var obj = {};
  Lapiz.set(obj, "foo", "bar");
  Lapiz.set(obj, function baz(){
    return "glorp";
  });

  obj.foo === "bar"     || t.error("Expected 'bar'");
  obj.baz() === "glorp" || t.error("Expected 'baz', got: "+obj.baz());

  var errMsg = false;
  try {
    obj.foo = "throw me an error";
  } catch(err){
    errMsg = err.message;
  }

  errMsg === "Attempting to set read-only property foo" || t.error("Did not throw error attempting to set foo");
});