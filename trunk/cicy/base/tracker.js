/**
 * @class CC.util.Tracker
 * 状态变更跟踪器.<br>
 * 内部维护一个后进先出数据结构来记录数据,该类目前用于记录{@link CC.ui.Tab}类的TAB选项打开顺序.
 */
CC.create('CC.util.Tracker', null, {
  /**@cfg {Number} max 历史记录最大条数*/
  max : 20,

  initialize : function(opt){
    this.area = [];
    if(opt)
      CC.extend(this, opt);
  },

/**
 * 记录数据
 * @param {Object} data
 */
  track : function(data){
    var a = this.area;
    if(a.indexOf(data) !== -1)
      a.remove(data);

    a.push(data);

    if(a.length > this.max)
      a.pop();
    if(__debug) console.log('记录:', data);
  },

/**
 * 接口,测试当前记录数据是可用
 * @param {Object} data
 * @method isValid
 */
  isValid : fGo,

/**
 * @cfg {Object} validCaller {@link #isValid}的this对象
 */
  validCaller : null,

/**
 * 弹出最近记录的数据.
 */
  pop : function(){
    var vc = this.validCaller || this, as = this.area, len = as.length, i = len - 1;
    for(;i>=0;i--){
      if(__debug) console.log('抹除:', this.isValid.call(vc, as[i]), as[i]);
      if(this.isValid.call(vc, as[i]))
        return as[i];
      as.pop();
    }
  },

/**
 * 移除指定记录数据.
 * @param {Object} data
 */
  remove : function(data){
    this.area.remove(data);
  },

/**
 * 当前记录数据大小
 * @return {Number}
 */
  size : function() {return this.area.length;}
});