Lapiz.Module("Dependency", function($L){
  var _dependencies = {};

  $L.Dependency = function(name){
    var d = _dependencies[name];
    if (d === undefined) { throw "Cannot find Dependency " + name; }
    return d();
  };

  $L.Dependency.Service = function(name, fn){
    function F(args) {
      return fn.apply(this, args);
    }
    F.prototype = fn.prototype;

    _dependencies[name] = function() {
      return new F(arguments);
    };
  };

  $L.Dependency.Factory = function(name, fn){
    _dependencies[name] = fn;
  };

  $L.Dependency.Reference = function(name, res){
    _dependencies[name] = function(){
      return res;
    };
  };

  $L.Dependency.remove = function(name){
    delete _dependencies[name];
  };

  $L.Dependency.has = function(name){
    return _dependencies.hasOwnProperty(name);
  };
});
