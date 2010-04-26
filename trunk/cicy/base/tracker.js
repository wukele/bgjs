//~@base/Tracker.js
/**
 * ״̬���������
 */
CC.create('CC.util.Tracker', null, {
  /**��ʷ��¼�������*/
  max : 20,

  initialize : function(opt){
    this.area = [];
    if(opt)
      CC.extend(this, opt);
  },

/**��¼����*/
  track : function(data){
    var a = this.area;
    if(a.indexOf(data) !== -1)
      a.remove(data);

    a.push(data);

    if(a.length > this.max)
      a.pop();
    if(__debug) console.log('��¼:', data);
  },

/**
 * ���Ե�ǰ��¼�����ǿ���
 * @param data
 * @type function
 */
  isValid : fGo,

/**
 * isValid��this����
 */
  validCaller : null,

/**
 * ���������¼������
 */
  pop : function(){
    var vc = this.validCaller || this, as = this.area, len = as.length, i = len - 1;
    for(;i>=0;i--){
      if(__debug) console.log('Ĩ��:', this.isValid.call(vc, as[i]), as[i]);
      if(this.isValid.call(vc, as[i]))
        return as[i];
      as.pop();
    }
  },

/**
 * �Ƴ�ָ����¼����
 */
  remove : function(data){
    this.area.remove(data);
  },

/**��ǰ��¼���ݴ�С*/
  size : function() {return this.area.length;}
});