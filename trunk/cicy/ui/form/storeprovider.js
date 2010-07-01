/**
 * @class CC.ui.form.StoreProvider
 * @extends CC.util.StoreProvider
 */
CC.create('CC.ui.form.StoreProvider', CC.util.StoreProvider, function(father){
return {

/**
 * 调用CC.formQuery 获得提交数据
 * @return {String}
 * @override
 */
  queryString : function(){
    return CC.formQuery(this.t.getFormEl());
    //ignore
  },

/**
 * 保存时提交整个表单数据
 */
  save : function(){
    if(this.beforeSave()!== false && 
       this.t.fire('store:beforesave', this)!==false){
         this.onSave();
    }
  },
  // 忽略addUrl与modifyUrl,统一利用saveUrl提交
  getSaveUrl : function(){
    return this.mappingUrl(this.saveUrl);
  },

  beforeSave : function(item, isNew){
    return this.t.getValidationProvider().validateAll()===true;
  }
};

CC.ui.def('formstore' , CC.ui.form.StoreProvider);

});
CC.ui.form.FormLayer.prototype.storeProvider = CC.ui.form.StoreProvider;