// > .ModuleName "Parser"
Lapiz.Module("Parser", function($L){
  function resolveParser(parser){
    if ($L.typeCheck.str(parser) && $L.parse[parser] !== undefined){
      return $L.parse[parser];
    }
    return parser;
  }

  // > Lapiz.parse()
  // Namespace for parser methods and a function to concisely invoke them
  // > Lapiz.parse("int") === Lapiz.parse.int
  // Which can be useful to take 
  // > Lapiz.parse("array|int")
  // or
  // > Lapiz.parse("array|int")
  $L.set.meth($L, function parse(){
    var parser;
    var args = Array.prototype.slice.call(arguments, 0);
    $L.assert(args.length > 0, "Lapiz.parse requires at least one arg");
    var parseStrs = args.shift();
    if (Lapiz.typeCheck.func(parseStrs)){
      parser = parseStrs;
    } else if ($L.typeCheck.str(parseStrs)){
      // something like "int" or "array|int"
      // so we work backwards
      parseStrs = parseStrs.split("|");
      var parserName = parseStrs.pop();
      $L.typeCheck.func(Lapiz.parse[parserName], "Lapiz.parse."+parserName+" is not a parser");
      parser = Lapiz.parse[parserName];
      while(parseStrs.length > 0){
        parserName = parseStrs.pop();
        $L.typeCheck.func(Lapiz.parse[parserName], "Lapiz.parse."+parserName+" is not a parser");
        parser = Lapiz.parse[parserName].call(this, parser);
      }
    } else {
      Lapiz.Err.toss("Lapiz.parse requires first arg as either string or function");
    }

    if (args.length>0){
      return parser.apply(this, args);
    }
    return parser;
  });

  // > Lapiz.parse.int(val)
  // Always parses in base 10. This is mostly a wrapper
  // around parseInt, however if val is a boolean it will reurn eitehr 1
  // or 0.
  $L.set($L.parse, "int", function(val){
    //can't use $L.set.meth because "int" is reserve word
    if (val === true){
      return 1;
    } else if (val === false){
      return 0;
    }
    return parseInt(val, 10);
  });

  // > Lapiz.parse.string
  // If val is null or undefined, returns an empty stirng. If val
  // is a string, it is returned, if it's a number it's converted
  // to a string. If val is an object that has a .str() method,
  // that will be used, if it doesn't have .str but it does have
  // .toString, that will be used. As a last resort it will be
  // concatted with an empty string.
  $L.set.meth($L.parse, function string(val){
    if (val === undefined || val === null) { return ""; }
    var type = typeof(val);
    if (type === "string") { return val; }
    if (type === "number") {
      if (isNaN(val)){
        return "";
      }
      return ""+val;
    }
    var strFromMethod;
    if ($L.typeCheck.nested(val, "str", "func")) {
      strFromMethod = val.str();
    } else if ($L.typeCheck.nested(val, "toString", "func")) {
      strFromMethod = val.toString();
    }
    if (typeof strFromMethod === "string"){
      return strFromMethod;
    }
    return "" + val;
  });

  // > Lapiz.parse.bool(val)
  // Converts val to a bool. Takes into account a few special edge cases, "O"
  // and "false" (any case) are cast to false.
  $L.set.meth($L.parse, function bool(val){
    if ($L.typeCheck.str(val) && (val === "0" || val.toLowerCase() === "false")){
      return false;
    }
    return !!val;
  });

  // > Lapiz.parse.strictBool(val)
  // Converts val to a bool
  $L.set.meth($L.parse, function strictBool(val){
    return !!val;
  });

  // > Lapiz.parse.number(val)
  // Converts val to a number. This is a wrapper around parseFloat.
  $L.set.meth($L.parse, function number(val){ return parseFloat(val); });

  // Lapiz.parse.object(val)
  // This is just a pass through function, not a true parser. It can
  // be useful for object properties.
  $L.set.meth($L.parse, function object(obj){ return obj; });

  // > Lapiz.parse.array(parser)
  // This takes a parser or a string (which will be resolved agains Lapiz.parse)
  // and returns an array parser.
  /* >
  var arrIntParser = Lapiz.parse.array("int");
  console.log(arrIntParser([3.14, "12.34", true]); // [3, 12, 1]
  console.log(arrIntParser("22.22"); // [22]
  */
  $L.set.meth($L.parse, function array(parser){
    parser = resolveParser(parser);
    return function(arr){
      if (Array.isArray(arr)){
        for(var i = 0; i<arr.length; i++){
          arr[i] = parser(arr[i]);
        }
        return arr;
      }
      return [parser(arr)];
    };
  });
});
