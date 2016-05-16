(function(){
  var _Person = function(id, name, role, active){
    var self = Lapiz.Object();
    var p = Lapiz.parse;

    self.priv.properties({
      "id": p.int,
      "name": "string",
      "role": p.string,
      "active": p.bool,
    }, self.priv.argDict());

    return self;
  };

   Lapiz.Test("Class/ArgDict", function(t){
    var Person = Lapiz.Class(function(id, name){
      var self = Lapiz.Object();
      var argDict = self.priv.argDict();

      argDict['name'] === "Adam" || t.error("Name is wrong");
      argDict['id'] === 5        || t.error("Id is wrong");
      
      return self;
    });

    Person(5, "Adam");
  });

  Lapiz.Test("Class/Lock", function(t){
    var Person = Lapiz.Class(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);

    person.hasOwnProperty("priv")  || t.error("'priv' was expected");
    person.priv.lock();
    !person.hasOwnProperty("priv") || t.error("'priv' was expected");

    
  });

  Lapiz.Test("Class/SetAll", function(t){
    var Person = Lapiz.Class(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);

    person.priv.setAll({
      name: "Lauren",
      role: "editor",
      active: true
    });

    person.name === "Lauren" || t.error("Name was not set correctly");
    person.role === "editor" || t.error("Role was not set correctly");
    person.active === true   || t.error("Active was not set correctly");
  });

  Lapiz.Test("Class/ChangeOnSetAll", function(t){
    var Person = Lapiz.Class(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);
    var changeCounter = 0;

    person.on.change(function(person){
      name = person.name;
      role = person.role;
      active = person.active;
      changeCounter += 1;
    });

    person.priv.setAll({
      name: "Lauren",
      role: "editor",
      active: true
    });

    name === "Lauren"   || t.error("Name was not set correctly");
    role === "editor"   || t.error("Role was not set correctly");
    active === true     || t.error("Active was not set correctly");
    changeCounter === 1 || t.error("person.on.change should have run 1 time, ran " + changeCounter + " times");
  });

  Lapiz.Test("Class/ChangeOnSet", function(t){
    var Person = Lapiz.Class(_Person);

    var person = Person(6, "Adam", "admin", false);
    var name = person.name;
    var role = person.role;
    var active = person.active;
    var flags = {
      name: false,
      role: false,
      active: false
    }

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

Lapiz.Test("Class/GetterSetterArray", function(t){
  var PositiveInt = Lapiz.Class(function(val){
    var self = Lapiz.Object();
    var priv = self.priv;
    var p = Lapiz.parse;

    self.priv.properties({
      "val": [
        function(v){
          return Math.abs(v);
        },
        function(){
          return priv.attr.val;
        }
      ]
    }, self.priv.argDict());

    return self; 
  });

  var p5 = PositiveInt(5);
  var p6 = PositiveInt(-6);

  p5.val === 5 || t.error("Expected 5, got " + p5.val);
  p6.val === 6 || t.error("Expected 6");
});

Lapiz.Test("Class/GetterSetterObj", function(t){
  var PositiveInt = Lapiz.Class(function(val){
    var self = Lapiz.Object();
    var priv = self.priv;
    var p = Lapiz.parse;

    self.priv.properties({
      "val": {
        set: function(v){
          return Math.abs(v);
        },
        get: function(){
          return priv.attr.val;
        }
      }
    }, self.priv.argDict());

    return self; 
  });

  var p5 = PositiveInt(5);
  var p6 = PositiveInt(-6);

  p5.val === 5 || t.error("Expected 5, got " + p5.val);
  p6.val === 6 || t.error("Expected 6");
});

Lapiz.Test("Class/GetterObj", function(t){
  var RelationalKey = Lapiz.Class(function(valKey){
    var self = Lapiz.Object();
    var priv = self.priv;
    var p = Lapiz.parse;
    var _strIndex = ["apple","bannana","cantaloup"];

    self.priv.properties({
      "valKey": p.int,
      "valStr": {
        get: function(){
          return _strIndex[priv.attr.valKey];
        }
      }
    }, self.priv.argDict());

    return self; 
  });

  var r2 = RelationalKey(2);
  var r0 = RelationalKey(0);

  r2.valKey === 2     || t.error("r2 error: "+ r2.valKey);
  r2.valStr === "cantaloup"     || t.error("r2 error: "+ r2.valStr);
  r0.valStr === "apple" || t.error("r0 error");
});

var Foo;

Lapiz.Test("Class/Constructor", function(t){
  var Person = Lapiz.Constructor(function(id, name, role, active){
    this.priv.properties({
      id     : "int",
      name   : "string",
      role   : "string",
      active : "bool",
    }, this.priv.argDict());
  });

  Foo = Person;

  p = Person("1", "Adam", "admin", true);

  typeof p.id === "number" || t.error("Expected a number");
});

Lapiz.Test("Class/OverrideSetter", function(t){
  var Test = Lapiz.Constructor(function(){
    this.priv.properties({
      test: function(val){
        if (val === "skip"){
          this.set = false;
        }
        return val;
      }
    }, {test: "test"});
  });

  var test = Test();

  test.test === "test" || t.error("Expected test");
  test.test = "skip";
  test.test === "test" || t.error("Expected test");
  test.test = "test2";
  test.test === "test2" || t.error("Expected test2");
});

Lapiz.Test("Class/ConstructorProperties", function(t){
  var PersonProperties = {
    id     : "int",
    name   : "string",
    role   : "string",
    active : "bool",
  };
  var Person = Lapiz.Constructor(function(id, name, role, active){
    this.priv.setAll(this.priv.argDict());
  },PersonProperties);

  p = Person("1", "Adam", "admin", true);

  typeof p.id === "number" || t.error("Expected a number");
});