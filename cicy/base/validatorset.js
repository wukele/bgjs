/**
 * @class
 */
CC.util.Validators = {
  NoEmpty : function(v){
    if(!v || v.trim() == ''){
      return '该项不能为空'
    }
    return true;
  },
  
  Mail : function(v){
    return !CC.isMail(v)?'邮箱格式不正确':true;
  }
};