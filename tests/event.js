Lapiz.Test("Event/Constructor", ["CollectionsHelper/"], function(t){
  var e = Lapiz.Event();
  typeof e.register === "function" || t.error("Event should have register method");
  typeof e.fire === "function"     || t.error("Event should have fire method");
});

Lapiz.Test("Event/Event", ["CollectionsHelper/"], function(t){
  var out;
  var e = Lapiz.Event();
  e.register(function(val){
    out = val;
  })
  e.fire("test");
  out === "test" || t.error("Value did not pass through event properly");
});

Lapiz.Test("Event/ArrayRemove", ["CollectionsHelper/"], function(t){
  var x = [1,2,3,4,5];

  x[2] === 3 || t.error("Expected x[2] === 3 before remove");
  Lapiz.remove(x,3);
  x[2] === 4 || t.error("Expected x[2] === 4 after remove");
});

Lapiz.Test("Event/SingleEvent", ["CollectionsHelper/"], function(t){
  var e = Lapiz.SingleEvent();
  var a = false;
  var b = false;

  function fnA(){
    a = true;
  }

  function fnB(){
    b = true;
  }

  e.register(fnA);
  e.register(fnB);
  e.register.deregister(fnB);

  e.fire.enabled = false;
  e.fire();
  e.fire.enabled === false || t.error("Fire should not be enabled");
  !a                       || t.error("First observer was called while event was disabled");
  e.fire.enabled = true;
  e.fire.enabled === true || t.error("Fire should be enabled");

  e.fire();
  a  || t.error("First observer was not called");
  !b || t.error("Second observer was called");
  e.register(fnB);
  b  || t.error("Second observer was not called");
  e.register.deregister(fnA);

  b = false;
  e.fire(); // should not fire again
  !b || t.error("Second observer was called");
});

Lapiz.Test("Event/length", ["CollectionsHelper/"], function(t){
  var e = Lapiz.Event();
  e.register(function(){});

  e.register.length === 1 || t.error("Length should be 1");
});

Lapiz.Test("Event/LinkProperty", ["CollectionsHelper/"], function(t){
  var e = Lapiz.Event();
  var obj = {};
  Lapiz.Event.linkProperty(obj, "test", e);

});