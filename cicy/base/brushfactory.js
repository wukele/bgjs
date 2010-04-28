/**
 * 标题画笔工厂.
 * @name CC.util.BrushFactory
 * @namespace
 */
CC.util.BrushFactory = /**@lends CC.util.BrushFactory*/{
  
/**
 * 获得浮点数格式化表示值.
 * @param {Number} 保留位数
 * @return {Function}
   @example
   var brush = Base.brushFactory.floatBrush(2);
   alert(brush(1.2214));
   alert(brush(.3218));
 */
  floatBrush : function(digit, type){
    var n = Math.pow(10, digit);
    switch(type){
      case '%' :
        n = n*100;
        var m = n/100;
        return function(v){
          return Math.round(v*n)/m + '%';
        }
      break;
      default :
        return function(v){
          return Math.round(v*n)/n;
        }
    }
  },
/**
 * @param {String} fmt mm/dd/yy或其它格式
 * @return {Function}
 */
  date : function(fmt){
    if(!fmt)
      fmt = 'yy/mm/dd';

    return function(v){
      return CC.dateFormat(v, fmt);
    }
  },
/**
 * 获得预存画笔
 */
  get : function(type){
  	if(!this.cache)
  	  this.cache = {};
  	
    var b = this.cache[type];
    if(!b){
    	// 初始化默认
      switch(type){
      	// 保留两位小数的浮点预留画笔
        case '.xx':
          b = CC.util.BrushFactory.floatBrush(2);
          this.reg(type, b);
          break;
        
        // 保留两位小数的百分比预留画笔
        case '.xx%' :
          b = CC.util.BrushFactory.floatBrush(2, '%');
          this.reg(type, b);
          break;
      }
    }
    return b;
  },
/**
 * 注册画笔
 */
  reg : function(type ,brush){
    if(!this.cache)
      this.cache = {};
    this.cache[type] = brush;
  }
};