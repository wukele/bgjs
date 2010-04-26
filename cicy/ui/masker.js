/**
 * @name CC.ui.Mask
 * @class 容器控件遮掩层
 * @extends CC.Base
 */
CC.create('CC.ui.Mask', CC.Base, /**@lends CC.ui.Mask#*/{

  innerCS: 'g-modal-mask',

  template : 'div',

/**
 * 点击层时响应回调
 * @type function
 */
  onActive : null,

/**
 * @property {CC.Base} target 目标容器
 */

  initComponent : function(){
    CC.Base.prototype.initComponent.call(this);
    if(this.target){
      this.attach(this.target);
    }

    this.domEvent('mousedown', this.onMaskResponsed, true);
  },

  /**@private*/
  onMaskResponsed : function(){
     this.fire('active', this);
     if(this.onActive)
      this.onActive();
  },

/**
 * 绑定目标容器
 */
  attach : function(target){

    var t = target || CC.$body;

    this.target = t;

    if(t.eventable)
      t.on('resized', this.onTargetResized, this);

    var f = CC.fly(t);

    if(t === CC.$body || t === document.body){
      CC.$body.domEvent('resize', this.onWindowResize, false, this, window);
      this.onWindowResize();
    }else {
      this.setSize(f.getSize());
    }

    this.setXY(0,0);

    f.unfly();
    this.appendTo(t);
    return this;
  },

/**
 * 解除绑定
 */
  detach : function(){
    var t = this.target;

    if(t === CC.$body || t === document.body)
      CC.$body.unEvent('resize', this.onWindowResize, window);

    if(t.eventable)
      t.un('resized', this.onTargetResized);

    this.del();
    this.target = null;
    return this;
  },

/**@private*/
  onTargetResized : function(a, b, c, d) {
    this.setSize(c, d);
  },

/**@private*/
  onWindowResize : function(){
      var vp = CC.getViewport();
      this.setSize(vp);
  },

/**@private*/
  destory : function(){
    if(this.target)
      this.detach();

    CC.Base.prototype.destory.call(this);
  }
});