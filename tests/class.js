(function(){
  var _Person = function(id, name, role, active){
    this.properties({
      "id": "int",
      "name": "string",
      "role": "string",
      "active": "bool",
    }, Lapiz.argDict());
  };

   Lapiz.Test("Class/ArgDict", ["Event/"], function(t){
    var Person = Lapiz.Class(function(id, name){
      var argDict = Lapiz.argDict();

      argDict['name'] === "Adam" || t.error("Name is wrong");
      argDict['id'] === 5        || t.error("Id is wrong");
    });

    Person(5, "Adam");
  });

  Lapiz.Test("Class/SetMany", ["Event/", "Class/ArgDict"], function(t){
    var Person = Lapiz.Class(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);

    person.setMany({
      "name": "Lauren",
      "role": "editor",
      "active": true
    });
    test  = person;
    person = person.pub;

    person.name === "Lauren" || t.error("Name was not set correctly");
    person.role === "editor" || t.error("Role was not set correctly");
    person.active === true   || t.error("Active was not set correctly");
  });

  Lapiz.Test("Class/ChangeOnSetAll", ["Event/", "Class/SetMany"], function(t){
    var Person = Lapiz.Class(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);
    var changeCounter = 0;

    person.pub.on.change(function(person){
      name = person.name;
      role = person.role;
      active = person.active;
      changeCounter += 1;
    });

    person.setMany({
      name: "Lauren",
      role: "editor",
      active: true
    });

    name === "Lauren"   || t.error("Name was not set correctly");
    role === "editor"   || t.error("Role was not set correctly");
    active === true     || t.error("Active was not set correctly");
    changeCounter === 1 || t.error("person.on.change should have run 1 time, ran " + changeCounter + " times");
  });

  Lapiz.Test("Class/ChangeOnSet", ["Event/"], function(t){
    var Person = Lapiz.Class(_Person);

    var person = Person(6, "Adam", "admin", false).pub;
    var name = person.name;
    var role = person.role;
    var active = person.active;
    var flags = {
      name: false,
      role: false,
      active: false
    };

    person.on.change(function(person){
      if (name !== person.name){
        flags.name = true;
        name = person.name;
      }
      if (role !== person.role){
        flags.role = true;
        role = person.role;
      }
      if (active !== person.active){
        flags.active = true;
        active = person.active;
      }
    });

    person.name = "Lauren";
    person.role = "editor";
    person.active = true;

    name === "Lauren" || t.error("Name was not set correctly");
    flags.name        || t.error("Name flag was not tripped");
    role === "editor" || t.error("Role was not set correctly");
    flags.role        || t.error("Role flag was not tripped");
    active === true   || t.error("Active was not set correctly");
    flags.active      || t.error("Active flag was not tripped");
  });
})();

Lapiz.Test("Class/GetterSetterObj", ["Event/"], function(t){
  var PositiveInt = Lapiz.Class(function(val){
    var self = this;
    self.properties({
      "val": {
        "set": function(v){
          return Math.abs(v);
        },
        "get": function(){
          return self.attr.val;
        }
      }
    }, Lapiz.argDict());

    return self.pub;
  });

  var p5 = PositiveInt(5);
  var p6 = PositiveInt(-6);

  p5.val === 5 || t.error("Expected 5, got " + p5.val);
  p6.val === 6 || t.error("Expected 6");
});

Lapiz.Test("Class/GetterObj", ["Event/"], function(t){
  var RelationalKey = Lapiz.Class(function(valKey){
    var self = Lapiz.Object();
    var _strIndex = ["apple","bannana","cantaloup"];

    self.properties({
      "valKey": "int",
      "valStr": {
        get: function(){
          return _strIndex[self.attr.valKey];
        }
      }
    }, Lapiz.argDict());

    return self.pub;
  }, true);

  var r2 = RelationalKey(2);
  var r0 = RelationalKey(0);

  r2.valKey === 2     || t.error("r2 error: "+ r2.valKey);
  r2.valStr === "cantaloup"     || t.error("r2 error: "+ r2.valStr);
  r0.valStr === "apple" || t.error("r0 error");
});

Lapiz.Test("Class/OverrideSetter", ["Event/"], function(t){
  var Test = Lapiz.Class(function(){
    this.properties({
      "test": function(val){
        if (val === "skip"){
          this.set = false;
        }
        return val;
      }
    }, {"test": "test"});
    return this.pub;
  });

  var test = Test();

  test.test === "test" || t.error("Expected test");
  test.test = "skip";
  test.test === "test" || t.error("Expected test");
  test.test = "test2";
  test.test === "test2" || t.error("Expected test2");
});

Lapiz.Test("Class/Getter", ["Event/"], function(t){
  var Person = Lapiz.Class(function(id, name, role, active){
    this.properties({
      id     : "int",
      name   : "string",
      role   : "string",
      active : "bool",
    }, Lapiz.argDict());

    this.getter(function foo(){
      return "foo " + this.id;
    });
    return this.pub;
  });

  p = Person("1", "Adam", "admin", true);

  p.foo === "foo 1" || t.error("Expected 'foo 1'");
});

Lapiz.Test("Class/Method", ["Event/"], function(t){
  var Person = Lapiz.Class(function(id, name, role, active){
    this.properties({
      id     : "int",
      name   : "string",
      role   : "string",
      active : "bool",
    }, Lapiz.argDict());

    var self = this.pub;
    this.method(function foo(arg){
      return arg + " foo " + self.id;
    });
    return self;
  });

  p = Person("1", "Adam", "admin", true);
  var indirect = p.foo; //despite indirect call 'this' is consistant within method

  p.foo("A")    === "A foo 1" || t.error("Expected 'A foo 1'");
  indirect("B") === "B foo 1" || t.error("Expected 'B foo 1'");
});

Lapiz.Test("Class/ObjectConstructor", ["Event/"], function(t){
  var Foo = Lapiz.Object(function(){
    this.properties({
      "id":"int"
    },{
      "id": 12
    })

    this.method(function bar(){
      return "bar";
    }, true);
  }).pub;

  Foo.bar() === "bar" || t.error("Expected 'bar'");
  Foo.id === 12       || t.error("Expected 12");
  Foo.id = "23.3"
  Foo.id === 23       || t.error("Expected 23");
});
