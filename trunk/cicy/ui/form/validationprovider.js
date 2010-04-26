CC.create('CC.ui.form.ValidationProvider', CC.util.ValidationProvider, function(father){
return {
/**
 * @implementation
 */
  validator : function(item, collector){
    var ret = item.validator ? 
      // cbase item
      item.validator(item.getValue()) : 
      // flied html element
      this.htmlValidator.call(item);
    
    if(ret !== true)
      collector.push(ret);
    
    return ret;
  },
  
  htmlValidator : function(item){
    return true;
  },
/**
 * @override
 */
  each : function(callback){
    this.t.eachH(function(){
      // filter form element
      if(this.element && callback.apply(this, arguments) === false){
        return false;
      }
    });
    this.eachHtml(callback);
  },
  
  eachHtml : fGo
};
});
CC.ui.def('formvalidation', CC.ui.form.ValidationProvider);
CC.ui.form.FormLayer.prototype.validationProvider = CC.ui.form.ValidationProvider;