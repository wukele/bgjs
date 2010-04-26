(function(){
var CC = window.CC;
var PR = CC.Base.prototype;
/**
 * 加载提示类
 * @name CC.ui.Loading
 * @class 加载提示类
 * @extends CC.Base
 */
CC.Tpl.def( 'CC.ui.Loading' , '<div class="g-loading"><div class="g-loading-indicator"><span id="_tle">加载中,请稍候...</span></div></div>');

CC.create('CC.ui.Loading', CC.Base,
 /**@lends CC.ui.Loading.prototype*/
 {
/**
 * @field
 * 掩层CSS类名
 */
  loadMaskCS:'g-loading-mask',

  initComponent : function(){
    PR.initComponent.call(this);
    if(this.target)
      this.attach(this.target);
  },

/**
 * 装饰容器,当容器加载数据时出现提示.
 */
  attach : function(target){
/**
 * @name CC.ui.Loading#target
 * @property {Base} [target] 目标控件
 */
    this.target = target;
    this.target.
      on('open',this.whenOpen,this).
      on('send',this.whenSend,this).
      on('success',this.whenSuccess,this).
      on('final',this.whenFinal,this);
  },

  /**@private*/
  whenSend : fGo,
  /**@private*/
  whenSuccess : function(){this.target.loaded = true;},
  /**@private*/
  whenOpen : function(){
    this.target.busy = true;
    this.markIndicator();
  },
  /**@private*/
  whenFinal : function(){
    this.target.busy = false;
    this.loaded = true;
    this.stopIndicator();
    if(this.target.shadow){
      this.target.shadow.reanchor();
    }
  },
/**
 * 开始加载提示
 */
  markIndicator : function(){
    if(this.disabled)
      return;
/**
 * @name CC.ui.Loading#targetLoadCS
 * @property {String} [targetLoadCS] 加载时添加到目标的样式
 */
    if(this.targetLoadCS)
      CC.fly(this.target).addClass(this.targetLoadCS).unfly();

    //应用掩层
/**
 * @name CC.ui.Loading#maskDisabled
 * @property {Boolean} [maskDisabled=false] 是否禁用掩层
 */
    if((!this.mask || !this.mask.tagName) && !this.maskDisabled){
      this.mask = CC.$C({tagName:'DIV', className:this.loadMaskCS});
    }

    if(this.mask && !this.maskDisabled){
      this.target.wrapper.append(this.mask).unfly();
    }

/**
 * @name CC.ui.Loading#loadMsgDisabled
 * @property {Boolean} [loadMsgDisabled=false] 是否禁用消息提示
 */
    if(!this.loadMsgDisabled)
      this.target.wrapper.append(this);
  },
/**
 * 停止加载提示
 */
  stopIndicator : function(){
    if(this.targetLoadCS)
      CC.fly(this.target).delClass(this.targetLoadCS).unfly();

    if(!this.maskDisabled) {
      if(this.mask){
        //firefox bug?
        //can not find out the parentNode, that is null!
        //this.mask.parentNode.removeChild(this.mask);
        //alert()
        //TODO: find out why??
        if(this.mask.parentNode)
          this.mask.parentNode.removeChild(this.mask);
        //delete this.mask;
      }
      this.del();
    }
  },
/**
 * 目标是否正在加载中
 */
  isBusy : function(){
    return this.target.busy;
  },
/**
 * 目标是否已成功加载
 */
  isLoaded : function(){
    return this.target.loaded;
  }
});

CC.ui.def('loading', CC.ui.Loading);
})();