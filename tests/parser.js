Lapiz.Test("Parse/Int", function(t){
  var p = Lapiz.parse;

  p.int(10) === 10             || t.error("int to int failed");
  p.int("10") === 10           || t.error("string to int failed");
  p.int("010") === 10          || t.error("leading-zero string to int failed");
  p.int("10 words") === 10     || t.error("string with cruft to int failed");
  isNaN(p.int("not a number")) || t.error("string with no number to int failed. Expected NaN, got: " + p.int("not a number"));
});

Lapiz.Test("Parse/String", function(t){
  var p = Lapiz.parse;
  var funcToString = p.string(function(){return 'test';});
  var objStr = p.string({
    str : function(){
      return "obj";
    }
  });

  //IE does not put a space after the word function, Chrome and FF do
  var functionRe = /function ?\(\){return 'test';}/;

  p.string("test") === "test"   || t.error("string to string failed");
  p.string(10) === "10"         || t.error("string to string failed");
  functionRe.test(funcToString) || t.error("function to string failed, got: " + funcToString );
  objStr === "obj"              || t.error("object with str function failed, got: " + objStr);
});

Lapiz.Test("Parse/Bool", function(t){
  var p = Lapiz.parse;

  p.bool(true) === true   || t.error("true to true failed");
  p.bool(false) === false || t.error("false to false failed");
  p.bool("test") === true || t.error("string to bool failed")
  p.bool("") === false    || t.error("empty string to bool failed")
});

Lapiz.Test("Parse/Array", ["Parse/Int"], function(t){
  var intArr = [3,"1",4.001];
  var intArrParser = Lapiz.parse.array("int");
  intArr = intArrParser(intArr);

  intArr[0] === 3 || t.error("Error at 0");
  intArr[1] === 1 || t.error("Error at 1");
  intArr[2] === 4 || t.error("Error at 2");
});