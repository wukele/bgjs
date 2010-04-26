(function(){

var CC = window.CC;
var PR = CC.Base.prototype;

/**
 * ��Ӱ��
 * ��Ӱ�������ĵ�������(DOM Ready)����.
 * @name CC.ui.Shadow
 * @class ��Ӱ��
 * @extends CC.Base
 */
CC.Tpl.def('CC.ui.Shadow' , CC.ie6 ? '<div class="g-dxshadow"></div>' : '<div class="g-shadow" style="display:none;"><div class="g-shadow-t" id="_t"></div><div class="g-shadow-lt" id="_lt"></div><div class="g-shadow-rt" id="_rt"></div><div class="g-shadow-l" id="_l"></div><div class="g-shadow-lb" id="_lb"></div><div class="g-shadow-r" id="_r"></div><div class="g-shadow-rb" id="_rb"></div><div class="g-shadow-b" id="_b"></div></div>');

CC.create('CC.ui.Shadow', CC.Base,
/**@lends CC.ui.Shadow.prototype*/
{
/**
 * @property {Number} [inpactW=8] ��Ӱ�����ز���
 */
  inpactW : 8,
/**
 * @property {Number} [inpactH=0] ��Ӱ�߶���ز���
 */
  inpactH : 0,
/**
 * @property {Number} [inpactX=-4] ��Ӱx����λ����ز���
 */
  inpactX : -4,
/**
 * @property {Number} [inpactY=8] ��Ӱy����λ����ز���
 */
  inpactY : 4,
/**
 * @property {Number} [shadowWidth=8] ��Ӱ���ؿ��,��ֵֻ��IE��Ч
 */
  shadowWidth : 6,

  /**
   * �任�����ƫ����, רΪIE6���õ��˾�����,��IE6ʱ���Ը�ֵ,Ĭ��Ϊ4, �μ�CSS�˾���Blur(pixelradius).
   * @property {Number}
   * @private
   */
  offset : 4,
/**
 * @property {Boolean} [hidden=true] Ĭ������
 */
  hidden : true,


  initComponent : function(){
/**
 * @name CC.ui.Shadow#showTo
 * @property {DOMElement} [showTo=document.body] Ĭ����ʾ��document.body��
 */

    PR.initComponent.call(this);
/**
 * @name CC.ui.Shadow#target
 * @property {CC.Base} [target] ��Ӱ���ӵ�Ŀ��ؼ�
 */
    if(this.target)
        this.attach(this.target);
    if(CC.ie && !CC.ie6){
      //@private
      this.shadowR = this.dom('_r');
      this.shadowB = this.dom('_b');
      this.shadowL = this.dom('_l');
      this.shadowT = this.dom('_t');
    }
  },
/**
 * ����Ӱ������Ŀ��ؼ�.
 * @param {CC.Base} target ��Ӱ���ӵ�Ŀ��ؼ�
 * @return this
 */
  attach : function(target){
    this.target = target;

    if(this.target.eventable){
        this.target.on('resized', this.reanchor, this)
                   .on('reposed', this.reanchor, this);
    }
    this.setZ((this.target.fastStyle('zIndex') || 1)-1);
    //ר����Բ�֧��PNGͼƬ��IE6
    if(CC.ie6){
      this._ie6OffDt = Math.floor(this.offset/2);
      this.view.style.filter="progid:DXImageTransform.Microsoft.alpha(opacity=50) progid:DXImageTransform.Microsoft.Blur(pixelradius="+this.offset+")";
    }
    return this;
  },

/**
 * ������Ӱ��Ŀ��ؼ��Ĺ���.
 * @return this
 */
  detach : function(){
    if(this.target.eventable){
        this.target.un('resized', this.reanchor, this);
        this.target.un('reposed', this.reanchor, this);
    }
    this.target = null;
    this.display(false);
    return this;
  },

/**
 * ������Ӱ��С.
 * @private
 */
  setRightSize : CC.ie6?
    function(a, b){
      if(a !== false)
        this.setWidth(a - this.offset - this._ie6OffDt + this.inpactW - 1);
      if(b !== false)
        this.setHeight(b - this.offset - this._ie6OffDt + this.inpactH);
    }:function(a, b){
    if(a !== false){
      a = a+this.inpactW;
      if(a!=this.width)
        this.setWidth(a);
    }
    if(b !== false){
      b+=this.inpactH;
      if(b!=this.height){
        this.setHeight(b);
      }
    }
    //����IE����ͬʱ����top, bottom������,���þ���߶�
    if(CC.ie){
      var f = CC.fly(this.shadowR), d = this.shadowWidth*2, e;
      if(b !== false){
        e = b - d;
        f.setHeight(e);
        f.view = this.shadowL;
        f.setHeight(e);
      }
      if(a !== false){
        e = a - d;
        f.view = this.shadowB;
        f.setWidth(e);
        f.view = this.shadowT;
        f.setWidth(e);
      }
      f.unfly();
    }
  },
/**
 * ��λ��Ӱ.
 * @private
 */
  setRightPos : CC.ie6?
    function(pos){
      pos[0]+=this.inpactX - this._ie6OffDt + 1;
      pos[1]+=this.inpactY - this._ie6OffDt;
      this.setXY(pos);
    }:
    function(pos){
      this.setXY(pos[0]+this.inpactX, pos[1]+this.inpactY - 1);
    },
/**
 * ��������ǰ״̬,����Ӱ��С��λ����Ŀ�겻һ��ʱ����.
 * @return this
 */
  reanchor : function(){
    var pos, t = !this.hidden;
    d = this.target.getSize(true);
    this.setRightSize(d.width, d.height);
    pos = this.target.absoluteXY();
    this.setRightPos(pos);
    if(t)
      PR.display.call(this, true);
    return this;
  },

  /**
   * ֻ��target��ʾʱ����ʾ��Ӱ,�������.
   * @override
   */
  display : function(b){
    if(b===undefined)
      return PR.display.call(this);
    var b = b && this.target && !this.target.hidden;
    if(b){
      this.reanchor();
      this.appendTo(document.body);
    }else {
      this.del();
    }
    return PR.display.call(this, b);
  }
}
);

CC.ui.def('shadow', CC.ui.Shadow);

})();