Lapiz.Test("Obj/Cls", function(t){
  var Person = Lapiz.Cls(function(cls){
    // note that this === cls
    cls.properties({
      "*id":  "int",
      "name": "string",
      "age":  "int",
      "role": "string"
    });

    cls.constructor(function(id, name){
      this.setMany(Lapiz.argMap());
      this.meth(this.setMany);
    });

    cls.meth(function sayHi(){
      return "Hi, "+this.pub.name;
    });
  });

  var lastIdCreated;
  Person.on.create = function(person){
    lastIdCreated = person.id;
  }

  var adam = Person(314, "adam");
  var fieldChanged;
  adam.on.change = function(self, field){
    fieldChanged = field;
  };

  adam.id   === 314     || t.error('Wrong id');
  adam.name === "adam"  || t.error('Wrong name: '+adam.name);
  lastIdCreated === 314 || t.error('Person.on.create did not fire correctly');

  errStr = false;
  try {
    adam.id = 123;
  } catch(err){
    errStr = err.message;
  }

  errStr === "Cannot set readonly property" || t.error("Expected error");
  adam.id === 314                           || t.error('Wrong id');
  fieldChanged === undefined                || t.error("Change should not have fired");

  adam.age = "55";
  adam.age === 55        || t.error('Wrong age' );
  fieldChanged === "age" || t.error("Change should have fired");

  adam.role === undefined || t.error('Role should be undefined');

  adam.name = "Adam";
  adam.name === "Adam"        || t.error('Wrong name: '+adam.name);
  adam.sayHi() === "Hi, Adam" || t.error('Method failure');
  fieldChanged === "name"     || t.error("Change should have fired");


  adam.setMany({
    "age": 123,
    "role": "admin"
  });
  fieldChanged.indexOf('age') > -1    || t.error("Change should include age");
  fieldChanged.indexOf('role') > -1   || t.error("Change should include role");
  fieldChanged.indexOf('name') === -1 || t.error("Change should not include name");

});

Lapiz.Test("Obj/Obj", function(t){
  var proto = Lapiz.Map();
  Lapiz.set.meth(proto, function sayHi(){
    return "Hi, "+this.name;
  });
  var obj = Lapiz.Obj(proto).pub;
  obj.name = "Adam"
  obj.sayHi() == "Hi, Adam" || t.error('Method failure');
});

Lapiz.Test("Obj/Event", function(t){
  var obj = Lapiz.Obj();
  obj.event("test");

  var fired = false;
  obj.pub.on.test = function(){
    fired = true;
  };
  obj.fire.test();

  fired || t.error('Test event did not fire');
});

Lapiz.Test("Obj/Change", function(t){
  var obj = Lapiz.Obj();
  
  obj.properties({"age": "int"});
  var changeFired = false;
  obj.pub.on.change = function(){
    changeFired = true;
  }
  obj.pub.age = "55";

  obj.pub.age === 55 || t.error("Expected 55");
  changeFired        || t.error('Change event did not fire');
});

(function(){
  var _Person = function(cls){
    cls.properties({
      "*id": "int",
      "name": "string",
      "role": "string",
      "active": "bool",
    });

    cls.constructor(function(id, name, role, active){
      this.setMany(Lapiz.argMap());
    });

    cls.meth(function setMany(props){this.setMany(props);});
  };

  Lapiz.Test("Obj/Index", function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(6, "Adam", "admin", true);

    var person = Person.get(6);
    person.name === "Adam"  || t.error("Expected 'Adam', got " + person.name);
  });

  Lapiz.Test("Obj/Statics", function(t){
    var Person = Lapiz.Cls(_Person);
    Person(6, "Adam", "admin", true);
  });

  Lapiz.Test("Obj/SetMany", ["Event/", "CollectionsHelper/ArgMap"], function(t){
    var Person = Lapiz.Cls(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);

    person.setMany({
      "name": "Lauren",
      "role": "editor",
      "active": true
    });

    person.name === "Lauren" || t.error("Name was not set correctly");
    person.role === "editor" || t.error("Role was not set correctly");
    person.active === true   || t.error("Active was not set correctly");
  });

  Lapiz.Test("Obj/ChangeOnSetAll", ["Event/", "Obj/SetMany"], function(t){
    var Person = Lapiz.Cls(_Person);

    var name, role, active;
    var person = Person(6, "Adam", "admin", false);
    var changeCounter = 0;

    person.on.change(function(person){
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

  Lapiz.Test("Obj/ChangeOnSet", ["Event/"], function(t){
    var Person = Lapiz.Cls(_Person);

    var person = Person(6, "Adam", "admin", false);
    var name = person.name;
    var role = person.role;
    var active = person.active;
    var flags = {
      name: false,
      role: false,
      active: false
    };

    person.on.change(function(person, field){
      if (name !== person.name){
        flags.name = true;
        name = person.name;
        field === "name" || t.error("Expected field to be 'name'");
      }
      if (role !== person.role){
        flags.role = true;
        role = person.role;
        field === "role" || t.error("Expected field to be 'role'");        
      }
      if (active !== person.active){
        flags.active = true;
        active = person.active;
        field === "active" || t.error("Expected field to be 'active'");
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

  Lapiz.Test("Obj/Getter", ["Event/"], function(t){
    var lg = Lapiz.Err.logTo
    Lapiz.Err.logTo = console;
    var Person = Lapiz.Cls(function(){
      _Person(this);
      this.properties({
        "+foo": function(){
          return "Foo: "+this.id;
        }
      });
    });

    var adam = Person(6, "Adam", "admin", false);
    adam.foo === "Foo: 6" || t.error("Bad response from getter");
    Lapiz.Err.logTo = lg;
  });
})();