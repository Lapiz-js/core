Lapiz.Test("Dependency/Reference", function(t){
  Lapiz.Dependency.Reference("tests/reference", {name:"Lapiz"});

  var first = Lapiz.Dependency("tests/reference");
  first.name === "Lapiz" || t.error("First instance of Dependency of 'tests/reference' should have property name equal to 'Lapiz'");
  first.name = "Test";

  var second = Lapiz.Dependency("tests/reference");
  second.name === "Test" || t.error("Second instance of Dependency of 'tests/reference' should have property name equal to 'Lapiz'");
  first.name === "Test"  || t.error("Object should have property name equal to 'Test'");
});

Lapiz.Test("Dependency/Factory", function(t){
  Lapiz.Dependency.Factory("tests/factory", function(){
    return {name:"Lapiz"};
  });

  var first = Lapiz.Dependency("tests/factory");
  first.name === "Lapiz"  || t.error("Dependency of 'tests/factory' should have property name equal to 'Lapiz'");
  first.name = "Test";

  var second = Lapiz.Dependency("tests/factory");
  second.name === "Lapiz" || t.error("Dependency of 'tests/factory' should have property name equal to 'Lapiz'");
  first.name === "Test"   || t.error("Object should have property name equal to 'Test'");
});

Lapiz.Test("Dependency/Service", function(t){
  function Person(name){
    if (name === undefined) {name = "";}
    this.name = name;
  }
  Person.prototype.getName = function(){ return this.name; };
  Lapiz.Dependency.Service("tests/service", Person);

  var first = Lapiz.Dependency("tests/service");
  first.name = "Lapiz";
  first.getName() === "Lapiz"   || t.error("Dependency of 'tests/service' should have method getName that returns 'Lapiz'");
  first.name = "Test";

  var second = Lapiz.Dependency("tests/service");
  second.name = "Lapiz2";
  second.getName() === "Lapiz2" || t.error("Dependency of 'tests/service' should have property name equal to 'Lapiz2'");
  first.getName() === "Test"    || t.error("Object should have property name equal to 'Test'");
});

Lapiz.Test("Dependency/Has", function(t){
  Lapiz.Dependency.Reference("tests/has", "Lapiz");

  Lapiz.Dependency.has("tests/has")          || t.error("Expected to find 'tests/has'");
  !Lapiz.Dependency.has("tests/doesNotHave") || t.error("Did not expected to find 'tests/doesNotHave'");
});

Lapiz.Test("Dependency/Remove", function(t){
  Lapiz.Dependency.Reference("tests/delete", "Lapiz");
  Lapiz.Dependency.has("tests/delete")  || t.error("Expected to find 'tests/delete'");
  Lapiz.Dependency.remove("tests/delete");
  !Lapiz.Dependency.has("tests/delete") || t.error("Did not expected to find 'tests/delete'");
});

Lapiz.Test("Dependency/NotFound", function(t){
  var errMsg = false;
  try {
    Lapiz.Dependency("foo");
  } catch(err){
    errMsg = err.message;
  }

  errMsg === "Cannot find Dependency foo" || t.error("Expected error: "+errMsg);
});