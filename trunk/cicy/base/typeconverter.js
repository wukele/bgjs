(function(){
 var cvtMap = {};
/**
 * ��������ת����
 * @class
 * @example
 <pre>
  var cvt = CC.util.TypeConverter.getConverter('int');
  var num = cvt('123456');
  alert(typeof num);
 </pre>
 */
CC.util.TypeConverter = {
/**
 * ע��һ������ת������
 */
  registerConverter : function(type, cvt){
    cvtMap[type] = cvt;
  },

/**
 * �������ת������
 */
  getConverter : function(type){
    var c = cvtMap[type];
    if(!c){
      c = this.createConverter.apply(this, arguments);
      if(!c)
        throw 'δʶ�����������:'+type;
      cvtMap[type] = c;
    }

    return c;
  },

  /**
  * ��������ת����,�������������converter��,���ڱȽ����Ƚ�����ֵ.
  * @return {Object} ���е���������ת����
  */
  createConverter: function(type){
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