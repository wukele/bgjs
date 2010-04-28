(function(){
 var cvtMap = {};
/**
 * 数据类型转换器
 * @class
 * @example
 <pre>
  var cvt = CC.util.TypeConverter.get('int');
  var num = cvt('123456');
  alert(typeof num);
 </pre>
 */
CC.util.TypeConverter = {
/**
 * 注册一个类型转换函数
 */
  reg : function(type, cvt){
    cvtMap[type] = cvt;
  },

/**
 * 获得类型转换函数
 */
  get : function(type){
    var c = cvtMap[type];
    if(!c){
      c = this.create.apply(this, arguments);
      if(!c)
        throw '未识别的数据类型:'+type;
      cvtMap[type] = c;
    }

    return c;
  },

  /**
  * 数据类型转换器,创建后存在属性converter中,用于比较器比较两列值.
  * @return {Object} 该列的数据类型转换器
  */
  create: function(type){
    var numReg = /[\$,%]/g, cv;
    switch (type) {
      case "":
      case undefined:
        cv = function(v){
          return (v === null || v === undefined) ? v : v.toString();
        };
      break;

      case "string":
        cv = function(v){
          return (v === undefined || v === null) ? '' : v.toString();
        };
      break;

      case "int":
        cv = function(v){
          return v !== undefined && v !== null && v !== '' ? parseInt(v.toString().replace(numReg, ""), 10) : '';
        };
      break;

      case "float":
        cv = function(v){
          return v !== undefined && v !== null && v !== '' ? parseFloat(v.toString().replace(numReg, ""), 10) : '';
        };
      break;

      case "bool":
        cv = function(v){
          return v === true || v === "true" || v == 1;
        };
      break;

      case "date":
        cv = function(v){
          if (!v)
            return '';

          if (CC.isDate(v))
            return v;
          // date format
          var dt = arguments[1];
          if (dt) {
            if (dt === "timestamp") {
              return new Date(v * 1000);
            }
            if (dt === "time") {
              return new Date(parseInt(v, 10));
            }
            return Date.parseDate(v, dt);
          }
          var parsed = Date.parse(v);
          return parsed ? new Date(parsed) : null;
        };
      break;
    }
    return cv;
  }
};

})();