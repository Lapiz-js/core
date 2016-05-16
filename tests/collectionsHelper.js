Lapiz.Test("CollectionsHelper/Namespace-Set", function(t){
  var ns = Lapiz.Namespace();
  ns.set("foo","bar");

  ns.namespace.foo === "bar" || t.error('Expected namespace.foo === "bar"');
});

Lapiz.Test("CollectionsHelper/Namespace-Method", function(t){
  var ns = Lapiz.Namespace();
  ns.method(function foo(){
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