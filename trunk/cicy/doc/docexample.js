/**
 * @fileOverview 本文件是一个关于如何编写代码注释以便生成JS文档的样例文件.
 */
 
/**
 * @namespace Cicy根类包.
 */
var CC = {};

/**
 * @name CC.ClassA
 * @class 示例类ClassA
 * @property {Number} LENGTH 长度,静态变量
 */
CC.create(/**@lends CC.ClassA#*/{
/**
 * resize事件
 * @name CC.ClassA#resize
 * @event resize
 * @param {String} eventName
 * @param {Function} handler
 */
 
/**
 * 一个方法
 * @param {String|Number} arg0 第一个参数
 * @param {Object} arg1 第二个参数
 * @return {String}
 */
  methodOfA : function(arg0, arg1){
    
    /**
     * @name CC.ClassA#key
     * @property {String} key 键名称
     */
    
    return '';
  },
/**
 * @property {String} [title=false] 标题
 */
  title : false
});
/**
 * @name CC.ClassB
 * @class 示例类ClassB
 * @extends CC.ClassA
 */
CC.create(/**@lends CC.ClassB#*/{
/**
 *
 */
  invoke : function(){
  }
});