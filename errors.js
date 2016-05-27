Lapiz.Module("Errors", ["Events"], function($L){

  // > Lapiz.Err
  // Namespace for error handling.
  $L.set($L, "Err", $L.Map());

  // > Lapiz.on.error( errHandler(err) )
  // > Lapiz.on.error = errHandler(err)
  // Register an error handler to listen for errors thrown with Lapiz.Err.throw
  var _errEvent = $L.Event.linkProperty($L.on, "error");

  // > Lapiz.Err.throw(Error)
  // > Lapiz.Err.throw(errString)
  // Sends the event to any errHandlers, then throws the event. Note that the
  // error handlers cannot catch the error.
  $L.set($L.Err, "throw", function(err){
    if ($L.typeCheck.string(err)){
      err = new Error(err);
    }
    _errEvent.fire(err);
    throw err;
  });

  function logError(err){
    $L.Err.logTo.log(err.message);
    $L.Err.logTo.log(err.stack);
  }

  var _loggingEnabled = false;
  var _nullLogger = $L.Map();
  $L.Map.meth(_nullLogger, function log(){});
  Object.freeze(_nullLogger);

  // > Lapiz.Err.logTo = logger
  // The logger passed in must have logger.log method. It is meant to work with
  // the console object:
  // > Lapiz.Err.logTo = console
  // But a custom logger can also be used.
  $L.Map.setterGetter($L.Err, "logTo", _nullLogger, function(newVal, oldVal){
    if (newVal === null || newVal === undefined){
      newVal = _nullLogger;
      if (_loggingEnabled) {
        _loggingEnabled = false;
        $L.on.error.deregister(logError);
      }
    } else {
      $L.typeCheck.func(newVal.log, "Object passed to Lapiz.Err.logTo must have .log method");
      if (!_loggingEnabled) {
        _loggingEnabled = true;
        $L.on.error(logError);
      }
    }
    return newVal;
  });

});