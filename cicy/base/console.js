/**
 * 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略.
 * 在firbug中可直接进行对某个对象进行监视,
 * 无console时就为空调用,可重写自定输出.
 * @name console
 * @class 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略
 */
if(!window.console)
      window.console = {};

if(!window.tester)
  window.tester = window.fireunit || {};
CC.extendIf(console,
  /**
   @lends console
  */
  {
      /**
       *@function
       *@param {arguments} 类似C语言中printf语法
       *@example
       * //%o表示参数为一个对象
       * console.log('This an string "%s",this is an object , link %o','a string', CC);
       */
    debug : fGo,
    /**@type function*/
    info : fGo,
    /**@type function*/
    trace : fGo,
    /**@type function*/
    log : fGo,
    /**@type function*/
    warn : fGo,
    /**@type function*/
    error : fGo,
    /**@type function*/
    assert:fGo,
      /**
       * 列出对象所有属性.
       *@function
       *@param {object} javascript对象
      */
    dir:fGo,
    /**@type function*/
    count : fGo,
    /**@type function*/
    group:fGo,
    /**@type function*/
    groupEnd:fGo,
    /**@type function*/
    time:fGo,
    /**@type function*/
    timeEnd:fGo});
/**
 * 基于firebug插件fireunit
 */
CC.extendIf(tester, {
  ok : function(a, b){
    if(typeof a === 'function')
      a = a();
    if(typeof b === 'function')
      b = b();
    if(a != b){
      alert('assert failed in testing '+a+'=='+b);
      console.group('断言失败:',a, b);
      console.error(a, b);
      console.trace();
      console.groupEnd();
    }
  },
  testDone : fGo
});