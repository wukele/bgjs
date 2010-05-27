(function(){
var CC = window.CC;
var PR = CC.Base.prototype;
/**
 * @class CC.ui.Loading
 * 加载提示类,参见{@link CC.util.ConnectionProvider}
 * @extends CC.Base
 */
CC.Tpl.def( 'CC.ui.Loading' , '<div class="g-loading"><div class="g-loading-indicator"><span id="_tle">加载中,请稍候...</span></div></div>');

CC.create('CC.ui.Loading', CC.Base,
 {
/**
 * @cfg {String} loadMaskCS 掩层CSS类名
 */
  loadMaskCS:'g-loading-mask',

  initComponent : function(){
    PR.initComponent.call(this);
    if(this.target)
      this.attach(this.target);
  },

/**
 * @property target
 * 目标容器
 * @type CC.ui.ContainerBase
 */
 
/**
 * 装饰容器,当容器加载数据时出现提示.
 * @param {CC.ui.ContainerBase} targetContainer
 */
  attach : function(target){
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
 * @cfg {String} targetLoadCS 加载时添加到目标的样式
 */
   targetLoadCS : false,
   
/**
 * @cfg {Boolean} maskDisabled 是否禁用掩层
 */
   maskDisabled : false,
   
/**
 * @cfg {Boolean} loadMsgDisabled 是否禁用消息提示
 */
   loadMsgDisabled : false,
   
/**
 * 开始加载提示.
 */
  markIndicator : function(){
    if(this.disabled)
      return;
      
    if(this.targetLoadCS)
      CC.fly(this.target).addClass(this.targetLoadCS).unfly();

    //应用掩层
    if((!this.mask || !this.mask.tagName) && !this.maskDisabled){
      this.mask = CC.$C({tagName:'DIV', className:this.loadMaskCS});
    }

    if(this.mask && !this.maskDisabled){
      this.target.wrapper.append(this.mask).unfly();
    }

    if(!this.loadMsgDisabled)
      this.target.wrapper.append(this);
  },
/**
 * 停止加载提示.
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
 * 目标是否正在加载中.
 * @return {Boolean}
 */
  isBusy : function(){
    return this.target.busy;
  },
  
/**
 * 目标是否已成功加载.
 * @return {Boolean}
 */
  isLoaded : function(){
    return this.target.loaded;
  }
});

CC.ui.def('loading', CC.ui.Loading);
})();