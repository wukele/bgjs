/**
 * @class CC.util.BrushFactory
 * 标题画笔工厂,用于根据类型值输出指定格式的字符串.
 * <p>
 * 自带的画笔有:
 * <div class="mdetail-params"><ul>
 * <li><b>.xx</b>: 保留两位小数的浮点预留画笔</li>
 * <li><b>.xx%</b>: 保留两位小数的百分比预留画笔</li>
 * </ul></div>
 * </p>
 * @singleton
 */
CC.util.BrushFactory = {
  
/**
 * 获得浮点数格式化表示值.<br>
 * <pre><code>
   var brush = CC.util.BrushFactory.floatBrush(2);
   alert(brush(1.2214));
   alert(brush(.3218));
   </code></pre>
 * @param {Number} digit 保留位数
 * @param {String} [type] 可选的有 '%',
 * @return {Function}
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
 * 获得输出指定日期格式的画笔.
 * @param {String} fmt mm/dd/yy或其它格式
 * @return {Function} brush
 */
  date : function(fmt){
    if(!fmt)
      fmt = 'yy/mm/dd';

    return function(v){
      return CC.dateFormat(v, fmt);
    }
  },
/**
 * 获得预存画笔.
 * @param {String} type
 * @return {Function} brush
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
 * 注册画笔.
 * @param {String} type
 * @param {Function} brush
 */
  reg : function(type ,brush){
    if(!this.cache)
      this.cache = {};
    this.cache[type] = brush;
  }
};