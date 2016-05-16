Lapiz.Module("Parser", function($L){
  $L.parse = {
    "int": function(val,rad){
      rad = rad || 10;
      return parseInt(val, rad);
    },
    "string": function (val){
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
    },
    "bool": function(val){ return !!val; },
    "number": function(val){ return parseFloat(val); },
    "object": function(obj){ return obj; },
    "relational": function(parser, obj, relationalField, getter){
      var attrs = obj.priv.attr;
      Object.defineProperty(obj, relationalField, {get:function(){
        return attrs[relationalField];
      }});
      return function(val){
        val = parser(val);
        attrs[relationalField] = getter(val);
        return val;
      };
    }
  };
});
