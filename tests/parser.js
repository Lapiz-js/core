(function(){
  var p = Lapiz.parse;
  Lapiz.Test("Parse/Int", function(t){
    p.int(10) === 10             || t.error("int to int failed");
    p.int("10") === 10           || t.error("string to int failed");
    p.int(false) === 0           || t.error("false to int failed");
    p.int(true) === 1            || t.error("true to int failed");
    p.int("010") === 10          || t.error("leading-zero string to int failed");
    p.int("10 words") === 10     || t.error("string with cruft to int failed");
    isNaN(p.int("not a number")) || t.error("string with no number to int failed. Expected NaN, got: " + p.int("not a number"));
  });

  Lapiz.Test("Parse/String", function(t){
    var funcToString = p.string(function(){return 'test';});
    var objStr = p.string({
      str : function(){
        return "obj";
      }
    });

    //IE does not put a space after the word function, Chrome and FF do
    var functionRe = /function ?\(\){return 'test';}/;

    p.string("test") === "test"   || t.error("string to string failed");
    p.string() === ""             || t.error("undefined to string failed");
    p.string(NaN) === ""          || t.error("NaN to string failed");
    p.string(10) === "10"         || t.error("string to string failed");
    functionRe.test(funcToString) || t.error("function to string failed, got: " + funcToString );
    objStr === "obj"              || t.error("object with str function failed, got: " + objStr);
  });

  Lapiz.Test("Parse/Bool", function(t){
    p.bool(true) === true     || t.error("true to true failed");
    p.bool(false) === false   || t.error("false to false failed");
    p.bool("test") === true   || t.error("string to bool failed");
    p.bool("") === false      || t.error("empty string to bool failed");
    p.bool("0") === false     || t.error("'0' string to bool failed");
    p.bool("FaLsE") === false || t.error("false string to bool failed");

    p.strictBool("0") === true     || t.error("'0' string to strictBool failed");
    p.strictBool("FaLsE") === true || t.error("false string to strictBool failed");
  });

  Lapiz.Test("Parse/Object", function(t){
    var x = {};
    p.object(x) === x || t.error("parse object failed");
  });

  Lapiz.Test("Parse/Array", ["Parse/Int"], function(t){
    var intArr = [3,"1",4.001];
    var intArrParser = Lapiz.parse.array("int");
    intArr = intArrParser(intArr);

    intArr[0] === 3 || t.error("Error at 0");
    intArr[1] === 1 || t.error("Error at 1");
    intArr[2] === 4 || t.error("Error at 2");
  });

  Lapiz.Test("Parse/ParseFunc", ["Parse/Array"], function(t){
    var parser = Lapiz.parse("int");

    Lapiz.typeCheck.func(parser)     || t.error("Expected function");
    parser("123.4") === 123          || t.error("Parser is not int parser");
    Lapiz.parse("int", "3.14") === 3 || t.error("expected 3");
    Lapiz.parse(parser) === parser   || t.error("should have got parser back");

    var arr = Lapiz.parse("array|int", [5.55, "4", "-12.34"]);
    arr.length === 3 || t.error("wrong legnth");
    arr[0] === 5     || t.error("expected 5");
    arr[1] === 4     || t.error("expected 4");
    arr[2] === -12   || t.error("expected -12");

    arr = Lapiz.parse("array|array|int", [[3.14, "1", 4.00005],[5/4, 5, 9],["2.01", 6, "5.2222"]]);
    arr[0][0] === 3 || t.error("expected 3");
    arr[1][1] === 5 || t.error("expected 5");
    arr[2][2] === 5 || t.error("expected 5");
  });
})();