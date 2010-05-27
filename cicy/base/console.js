/**
 * @class console
 * 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略.
 * 在firbug中可直接进行对某个对象进行监视,
 * 无console时就为空调用,可重写自定输出.
 * @singleton
 */
if(!window.console)
      window.console = {};

if(!window.tester)
  window.tester = window.fireunit || {};

CC.extendIf(console,
  {
      /**
       * %o表示参数为一个对象
       * console.log('This an string "%s",this is an object , link %o','a string', CC);
       *@param {arguments} 类似C语言中printf语法
       *@method
       */
    debug : fGo,
/**
 * @method info
 */
    info : fGo,
/**
 * @method trace
 */
    trace : fGo,
/**
 * @method log
 */
    log : fGo,
/**
 * @method warn
 */
    warn : fGo,
/**
 * @method error
 */
    error : fGo,
/**
 * @method assert
 */
    assert:fGo,
      /**
       * 列出对象所有属性.
       *@param {object} javascript对象
       *@method dir
      */
    dir:fGo,
/**
 * @method count
 */
    count : fGo,
/**
 * @method group
 */
    group:fGo,
/**
 * @method groupEnd
 */
    groupEnd:fGo,
/**
 * @method time
 */
    time:fGo,
/**
 * @method timeEnd
 */
    timeEnd:fGo});
//基于firebug插件fireunit
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