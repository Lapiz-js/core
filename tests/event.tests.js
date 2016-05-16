Lapiz.Test("Event/Constructor", function(t){
  var e = Lapiz.Event();
  typeof e.register === "function" || t.error("Event should have register method");
  typeof e.fire === "function"     || t.error("Event should have fire method");
});

Lapiz.Test("Event/Event", function(t){
  var out;
  var e = Lapiz.Event();
  e.register(function(val){
    out = val;
  })
  e.fire("test");
  out === "test" || t.error("Value did not pass through event properly");
});

Lapiz.Test("Event/ArrayRemove", function(t){
  var x = [1,2,3,4,5];

  x[2] === 3 || t.error("Expected x[2] === 3 before remove");
  Lapiz.remove(x,3);
  x[2] === 4 || t.error("Expected x[2] === 4 after remove");
});

Lapiz.Test("Event/SingleEvent", function(t){
  var e = Lapiz.SingleEvent();
  var a = false;
  var b = false;

  e.register(function(){
    a = true;
  });

  e.fire();

  e.register(function(){
    b = true;
  })

  a || "First observer was not called";
  b || "Second observer was not called";
});