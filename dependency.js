Lapiz.Module("Dependency", function($L){
  var _dependencies = {};

  // > Lapiz.Dependency(name)
  // Returns the dependency associated with name
  $L.Dependency = function(name){
    var d = _dependencies[name];
    if (d === undefined) { Lapiz.Err.toss("Cannot find Dependency " + name); }
    return d();
  };

  // > Lapiz.Dependency.Service(name, constructor)
  // Service will register the constructor in manor so that calling
  // > Lapiz.Dependency(name)(args...)
  // on a service is the same as calling
  // > new constructor(args...)
  $L.Dependency.Service = function(name, fn){
    function F(args) {
      return fn.apply(this, args);
    }
    F.prototype = fn.prototype;

    _dependencies[name] = function() {
      return new F(arguments);
    };
  };

  // > Lapiz.Dependency.Factory(name, fn)
  // Factory is the most direct of the dependency registrations, it registers
  // the function directly
  $L.Dependency.Factory = function(name, fn){
    _dependencies[name] = fn;
  };

  // > Lapiz.Dependency.Reference(name, resource)
  // Wraps the resource in a closure function so that calling
  // > Lapiz.Dependency(name)
  // will return the resource.
  $L.Dependency.Reference = function(name, res){
    _dependencies[name] = function(){
      return res;
    };
  };

  // > Lapiz.Dependency.remove(name)
  // Removes a dependency
  $L.Dependency.remove = function(name){
    delete _dependencies[name];
  };

  // > Lapiz.Dependency.has(name)
  // Returns a boolean indicating if there is a resource registered corresonding
  // to name.
  $L.Dependency.has = function(name){
    return _dependencies.hasOwnProperty(name);
  };
});
