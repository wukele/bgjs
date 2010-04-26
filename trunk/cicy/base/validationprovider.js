/**
 * @name CC.util.ValidationProvider
 * @class
 */
CC.util.ProviderFactory.create('Validation', null, {
  /**
   * ��֤ʧ��ʱ��ʽ
   * @private
   */
  errorCS : 'g-form-error',
  
  focusOnError : true,
  
/**
 * @protected
 */
  decorateValidation : function(b, item, collector, type){
    if(item){
    	item.checkClass(item.errorCS || this.errorCS, !b);
    }
  },

  validator : fGo,
  
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
 * �¼�����false���ж�������֤
 * @name CC.ui.ContainerBase#validation:start
 * @event
 * @param {CC.ui.Item} item
 * @param {Array} collector
 * @param {String} [type]
 */
 
/**
 * @name CC.ui.ContainerBase#validation:failed
 * @event
 * @param {CC.ui.Item} item
 * @param {Array} collector
 * @param {String} type
 */
/**
 * 
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
 * ֪ͨListenerĳ��������Ϣ��֤�Ƿ�ɹ�,�����ֶ���֤��,���ø÷���֪ͨListener��֤���.
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
 * ��֤�Ƿ�<b>��</b>��ȷ.
 * @return {Array|Boolean} δͨ����֤������Ϣ����,ͨ������false
 */
  isInvalid :function(item, type){
    var res = [], ret;
    ret = this.validate(item,res, type);
    return ret === true?false:res;
  }
});