/**
 * @class
 */
CC.util.Validators = {
  NoEmpty : function(v){
    if(!v || v.trim() == ''){
      return '�����Ϊ��'
    }
    return true;
  },
  
  Mail : function(v){
    return !CC.isMail(v)?'�����ʽ����ȷ':true;
  }
};