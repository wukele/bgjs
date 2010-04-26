/**
 * @name CC.ui.form.StoreProvider
 * @class
 * @super CC.util.StoreProvider
 */
CC.create('CC.ui.form.StoreProvider', CC.util.StoreProvider, function(father){
return /**@lends CC.ui.form.StoreProvider#*/{
/**
 * ����CC.formQuery ����ύ����
 * @override
 */
  queryString : function(){
    return CC.formQuery(this.t.getFormEl());
    //ignore
  },

/**
 * ����ʱ�ύ����������
 * @override
 */
  save : function(){
    if(this.beforeSave()!== false && 
       this.t.fire('store:beforesave', this)!==false){
         this.onSave();
    }
  },
/**
 * ����addUrl��modifyUrl,ͳһ����saveUrl�ύ
 * @override
 */
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