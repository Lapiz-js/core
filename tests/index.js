(function(){
  var _Person = function(cls){
    cls.properties({
      "id": "int",
      "name": "string",
      "role": "string",
      "active": "bool",
    });

    cls.constructor(function(id, name, role, active){
      this.setMany(Lapiz.argMap());
    });

    cls.meth(function remove(){
      this.fire.remove(this.pub);
    });
  };

  Lapiz.Test("Index/Index", ["Event/"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(6, "Adam", "admin", true);

    var person = Person.get(6);
    person.name === "Adam"  || t.error("Expected 'Adam', got " + person.name);
  });

  Lapiz.Test("Index/PrimaryByString", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);
    var errMsg = false;
    try{
      Lapiz.Index(Person, ["name"]);
    } catch(err){
      errMsg = err.message;
    }

    errMsg === "Expected a function or string" || t.error("Expected error");
  });

  Lapiz.Test("Index/CatchBadConstructor", ["Index/Index"], function(t){
    var Person = Lapiz.Index.Cls(_Person, "name");

    Person(50, "Stephen", "admin", true);
    Person(70, "Lauren", "editor", true);
    Person(60, "Adam", "admin", true);

    var stephen = Person.get("Stephen");
    stephen.name === "Stephen" || t.error("Expected stephen");
  });

  Lapiz.Test("Index/GetByValue", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(50, "Stephen", "admin", true);
    Person(70, "Lauren", "editor", true);
    Person(60, "Adam", "admin", true);

    var admins = Person.get("role", "admin");

    admins[50] !== undefined || t.error("Expected id 50 in list");
    admins[60] !== undefined || t.error("Expected id 60 in list");
    admins[70] === undefined || t.error("Did not expected id 70 in list");
  });

  Lapiz.Test("Index/GetByFunc", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", false);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);
    Person(9, "Alex", "editor", false);
    Person(15, "Chris", "admin", true);

    var activeAdmins = Person.get(function(person){
      return person.active && person.role == "admin";
    });

    Object.keys(activeAdmins).length === 2 || t.error("Wrong number of active admins");
    activeAdmins[6]  !== undefined         || t.error("Expected id 6 in list");
    activeAdmins[15] !== undefined         || t.error("Expected id 15 in list");
  });

  Lapiz.Test("Index/Filter", ["Event/"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);
    var activeAdmins = Person.Filter(function(key, acc){
      var p = acc(key);
      return p.role === "admin" && p.active;
    });

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);
    Person(9, "Alex", "editor", false);
    Person(15, "Chris", "admin", false);

    activeAdmins.has(5)   || t.error("Expected entity 5 from query");
    activeAdmins.has(6)   || t.error("Expected entity 6 from query");
    !activeAdmins.has(15) || t.error("Composite should not return entity 15");
    !activeAdmins.has(7)  || t.error("Composite should not return entity 7");
    !activeAdmins.has(9)  || t.error("Composite should not return entity 9");
  });

  Lapiz.Test("Index/IndexChangeEvent", ["Event/"], function(t){
    var Person = Lapiz.Cls(_Person);
    var name;


    Lapiz.Index(Person);

    Person.Filter("role", "admin").on.insert = function(id, collection){
      name = collection(id).name;
    };

    Person(5, "Stephen", "admin", true);
    name === "Stephen" || t.error("Expected Stephen");

    Person(6, "Adam", "editor", true);
    name === "Stephen" || t.error("Expected Stephen");

    Person(7, "Lauren", "admin", true);
    name === "Lauren" || t.error("Expected Lauren");
  });

  Lapiz.Test("Index/FilterFunc", ["Index/Filter"], function(t){
    var Person = Lapiz.Cls(_Person);
    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);
    Person(9, "Alex", "editor", false);
    Person(15, "Chris", "admin", false);
    var filter = Person.Filter(function(k,a){return a(k).id > 6;});

    !filter.has(5) || t.error("Filter should not return entity 5");
    !filter.has(6) || t.error("Filter should not return entity 6");
    filter.has(7)  || t.error("Expected entity 7 from filter");
    filter.has(9)  || t.error("Expected entity 9 from filter");
    filter.has(15) || t.error("Expected entity 15 from filter");
  });

  Lapiz.Test("Index/Protected", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);

    var admins = Person.Filter("admin", "role");
    admins.isProtected = "testing";
    !admins.hasOwnProperty("isProtected") || t.error("Should not be able to modify admins")
  });

  Lapiz.Test("Index/All", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);

    Person.all instanceof Function || t.error("Person.all should be a function")
  });

  Lapiz.Test("Index/remove", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);

    Person.get(5).remove();
  });

  Lapiz.Test("Index/OnInsert", ["Event/"], function(t){
    var Person = Lapiz.Cls(_Person);
    var flag = false;

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);

    var admins = Person.Filter("role", "admin");
    admins.on.insert(function(){
      flag = true;
    });
    Person.get(7).role = "admin";

    flag || t.error("Admins insert event did not fire")
  });

  Lapiz.Test("Index/Keys", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);
    Person(9, "Alex", "editor", false);
    Person(15, "Chris", "admin", false);

    var keys = Person.keys;

    keys.length === 5      || t.error("Expected 5 keys, got: " + keys.length);
    keys.indexOf("9") > -1 || t.error("Expected keys to contain 9");
  });

  Lapiz.Test("Index/Each", ["Index/Index"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);
    Person(9, "Alex", "editor", false);
    Person(15, "Chris", "admin", false);

    var c = 0;
    var flag = false;
    Person.each(function(person, key){
      c += 1;
      if (key === "9" && person.name === "Alex") { flag = true; }
    });

    c === 5 || t.error("Expected 5 keys, got: " + keys.length);
    flag    || t.error("Expected keys to contain 9");
  });

  Lapiz.Test("Index/FilterOnRemove", ["Index/Filter"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);
    var admins = Person.Filter("role", "admin");

    Person(5, "Stephen", "admin", true);
    Person(6, "Adam", "admin", true);
    Person(7, "Lauren", "editor", true);
    Person(9, "Alex", "editor", false);
    Person(15, "Chris", "admin", false);

    var flag = false;
    admins.on.remove(function(){
      flag = true;
    });

    Person.get(6).role = "editor";

    flag           || t.error("On.remove never fired");
    !admins.has(6) || t.error("Admins still has key 6");
  });

  Lapiz.Test("Index/FilterOnChangeShouldNotFire", ["Index/Filter"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);
    var admins = Person.Filter(function(person){
      return person.role === "admin";
    });

    Person(6, "Adam", "admin", true);

    var flag = false;
    admins.on.change(function(){
      flag = true;
    });

    Person.get(6).role = "editor";

    !flag || t.error("On.change fired");
  });

  Lapiz.Test("Index/FilterOnChangeShouldFire", ["Index/Filter"], function(t){
    var Person = Lapiz.Cls(_Person);

    Lapiz.Index(Person);
    var admins = Person.Filter("role", "admin");

    Person(6, "Adam", "admin", true);

    var flag = false;
    admins.on.change(function(){
      flag = true;
    });

    Person.get(6).name = "Bob";

    flag || t.error("On.change fired");
  });

  Lapiz.Test("Index/Relational", ["Index/Filter"], function(t){
    var One = Lapiz.Cls(function(){
      this.properties({
        "id"    : "int",
        "name"  : "string"
      });

      this.constructor(function(id, name){
        this.setMany(Lapiz.argMap());
      });

    });

    Lapiz.Index(One);

    var Many = Lapiz.Cls(function(id, name, parent_id){
      this.properties({
        "id"        : "int",
        "name"      : "string",
        "parent_id" : "int",
        "+parent"   : function parent(){
                        return One.get(this.parent_id);
                      }
      });
      this.constructor(function(id, name, parent_id){
        this.setMany(Lapiz.argMap());
      });
    });
    Lapiz.Index(Many);

    One(1, "Morse Code Quiz");
    Many(1, "S", 1);
    Many(2, "T", 1);
    Many(3, "A", 1);
    One(2, "Presidents Quiz");
    Many(4, "Washington", 2);
    Many(5, "Jefferson", 2);
    Many(6, "Lincoln", 2);

    Many.get(4).name        === "Washington"      || t.error("Expected 'Washington'");
    Many.get(4).parent_id   === 2                 || t.error("Expected '2'");
    Many.get(4).parent                            || t.error("Expected field parent");
    Many.get(4).parent.name === "Presidents Quiz" || t.error("Expected 'Presidents Quiz'");

  });
})();
