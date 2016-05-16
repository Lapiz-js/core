Lapiz.Module("Parser", function($L){
  function resolveParser(parser){
    if ($L.typeCheck.string(parser) && $L.parse[parser] !== undefined){
      return $L.parse[parser];
    }
    return parser;
  }

  $L.set($L, "parse", $L.Map());

  $L.Map.method($L.parse, function int(val,rad){
    if (val === true){
      return 1;
    } else if (val === false){
      return 0;
    }
    rad = rad || 10;
    return parseInt(val, rad);
  });

  $L.Map.method($L.parse, function string(val){
    if (val === undefined || val === null) { return ""; }
    var type = typeof(val);
    if (type === "string") { return val; }
    if (type === "number") { return ""+val; }
    var strFromMethod;
    if ("str" in val && val.str instanceof Function) {
      strFromMethod = val.str();
    } else if ("toString" in val && val.toString instanceof Function) {
      strFromMethod = val.toString();
    }
    if (typeof strFromMethod === "string"){
      return strFromMethod;
    }
    return "" + val;
  });
  $L.Map.method($L.parse, function bool(val){ return !!val; });
  $L.Map.method($L.parse, function number(val){ return parseFloat(val); });
  $L.Map.method($L.parse, function object(obj){ return obj; });
  $L.Map.method($L.parse, function array(parser){
    parser = resolveParser(parser);
    return function(arr){
      if (Array.isArray(arr)){
        for(var i = 0; i<arr.length; i++){
          arr[i] = parser(arr[i]);
        }
        return arr;
      }
      return [parser(arr)];
    }
  });
});
