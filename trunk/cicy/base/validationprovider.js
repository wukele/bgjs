/**
 * @class CC.util.ValidationProvider
 * 为容器控件提供子项数据验证功能.
 * @extends CC.util.ProviderBase
 */
CC.util.ProviderFactory.create('Validation', null, {
  /**
   * @cfg {String} errorCS 验证失败时添加到子项样式
   */
  errorCS : 'g-form-error',
/**
 * @cfg {Boolean} focusOnError 验证失败时是否聚焦到子项,默认为true
 */
  focusOnError : true,
  
/**
 * 如果想定义子项数据出错时的修饰样式,可重写本方法.
 * @param {Boolean} isValid 验证结果
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 */
  decorateValidation : function(b, item, collector, type){
    if(item){
    	item.checkClass(item.errorCS || this.errorCS, !b);
    }
  },
/**
 * 接口,重写可实现自定义对子项的验证
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 */
  validator : fGo,
/**
 * 验证容器所有子项.
 * @param {Object} type 如果容器子项数据验证的类型有多种,传入type以自行识别,否则可忽略.
 */
  validateAll : function(type){
    var self = this, coll = [], r;
    this.each(function(){
      r = self.validate(this, coll, type);
      if(r !== true) {
        if(coll.length === 1 && self.focusOnError){
          // capture focus when error
          try {this.focus();}catch(e){}
        }
        //break if null
        if(r === null)
          return false;
      }
    });
    return coll.length ? coll : true;
  },

/**
 * @event validation:start
 * 事件由验证器{@link CC.util.ValidationProvider}提供,在验证容器某个子项数据开始时发送.事件返回false将中断往下验证.
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @member CC.ui.ContainerBase
 */
 
/**
 * @event validation:failed
 * 事件由验证器{@link CC.util.ValidationProvider}提供,当容器某个子项数据验证失败时发送.
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @member CC.ui.ContainerBase
 */
 
/**
 * 单独验证指定子项数据. 
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略.
 * @return {Boolean} true or false
 */
  validate : function(item, collector, type){

    if(!collector)
      collector = [];

    var r;
    
    r = this.validator(item, collector, type);
    
    if(this.t.fire('validation:start', item, collector, type) === false){
      r = null;
    }
    
    if(collector.length > 0){
      if(r !== null)
        r = false;
    }else { r = true; }
    
    this.notifyValidation(!!r, item, collector, type);
    return r;
  },
  
/**
 * 通知Listener某个子项信息验证是否成功,可以手动验证后,调用该方法通知Listener验证结果.
 * @param {Boolean} isValid
 * @param {CC.Base} item 容器子项
 * @param {Array} collector 当前收集的错误信息
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @return this
 */
  notifyValidation : function(isvalid, item, collector, type){
    this.decorateValidation(isvalid, item, collector, type);
    this.t.fire(
      isvalid ? 'validation:success':'validation:failed', 
      item, 
      collector, 
      type, 
      this
    );
    return this;
  },
  
/**
 * 验证是否<b>不</b>正确,将调用{@link #validate}方法验证,并收集出错信息.
 * @param {CC.Base} item 容器子项
 * @param {Object} type 验证类型,自行定义,除非要为容器定义多种验证类型,否则可忽略
 * @return {Array|Boolean} 未通过验证返回消息数组,通过返回false
 */
  isInvalid :function(item, type){
    var res = [], ret;
    ret = this.validate(item,res, type);
    return ret === true?false:res;
  }
});