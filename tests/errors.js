Lapiz.Test("Errors/Throw", ["Event/"], function(t){
  var errMsg = false;
  try {
    Lapiz.Err.toss(new Error("Testing Errors"));
  } catch(err){
    errMsg = err.message;
  }

  errMsg === "Testing Errors" || t.error("Expect 'Testing Errors'");
});

Lapiz.Test("Errors/LogTo", ["Errors/Throw"], function(t){
  var out = "";
  var testConsole = {
    log: function(str){
      out += str;
    }
  };

  var nullLogger = Lapiz.Err.logTo;
  Lapiz.Err.logTo = testConsole;
  Lapiz.Err.logTo === testConsole || t.error("Logging should be set to testConsole");

  try{
    Lapiz.Err.toss("Testing Errors");
  } catch(err){
  }

  out.indexOf("Testing Errors") > -1 || t.error("Expect 'Testing Errors' in log");
  out.indexOf("core/tests/errors.js") > -1 || t.error("Expect 'lapiz/core/tests/errors.js' in log");

  Lapiz.Err.logTo = null;
  Lapiz.Err.logTo === nullLogger || t.error("Logging should be set to null logger");
  out = ""
  Lapiz.Err.logTo.log("Testing");
  out === "" || t.error("Out should be empty");
});

Lapiz.Test("Errors/Assert", ["Init/Assert"], function(t){
  var errMsg
  try{
    Lapiz.assert(false, "TESTING");
  } catch(e){
    errMsg = e.message;
  }
  errMsg === "TESTING" || t.error("Did not throw error");
});

Lapiz.Test("Errors/TypeCheck", ["Init/TypeCheck/"], function(t){
  var errMsg
  try{
    Lapiz.typeCheck.func(false, "TESTING");
  } catch(e){
    errMsg = e.message;
  }
  errMsg === "TESTING" || t.error("Did not throw error");
});
