(function(){
var CC = window.CC;
var PR = CC.Base.prototype;
/**
 * @class CC.ui.Loading
 * 加载提示类,参见{@link CC.util.ConnectionProvider}
 * @extends CC.Base
 */
 
/**
 * @cfg {String} loadMaskCS 掩层CSS类名
 */
 
/**
 * @cfg {Boolean} maskDisabled 是否禁用掩层
 */

/**
 * @cfg {String} targetLoadCS 加载时添加到目标的样式
 */
 
/**
 * @cfg {Boolean} loadMsgDisabled 是否禁用消息提示
 */
 
/**
 * @cfg {Boolean} monitor 监听连接事件源,默认为空,监听的事件为open, send, success, final.
 */


/**
 * @property target
 * 目标容器
 * @type CC.ui.ContainerBase
 */
 
CC.Tpl.def( 'CC.ui.Loading' , '<div class="g-loading"><div class="g-loading-indicator"><span id="_tle">加载中,请稍候...</span></div></div>');

CC.create('CC.ui.Loading', CC.Base,
 {
  loadMaskCS:'g-loading-mask',

  monitor : false,
  
  initComponent : function(){
    PR.initComponent.call(this);
    if(this.monitor) {
      this.setMonitor(CC.delAttr('monitor', this));
    }
  },

 
/**
 * 装饰容器,当容器加载数据时出现提示.
 * @param {CC.ui.ContainerBase} targetContainer
 */
  attach : function(target){
    this.target = target;
  },

/**
 * 设置监听事件源.
 */
  setMonitor : function(monitor){
    if(this.monitor){
      this.monitor.un('open',this.whenOpen,this).
                   un('send',this.whenSend,this).
                   un('success',this.whenSuccess,this).
                   un('final',this.whenFinal,this);
    }
    if(monitor){
      monitor.on('open',this.whenOpen,this).
              on('send',this.whenSend,this).
              on('success',this.whenSuccess,this).
              on('final',this.whenFinal,this);
    }
    this.monitor = monitor;
  },
  
  /**@private*/
  whenSend : fGo,
  
  /**@private*/
  whenSuccess : function(){this.loaded = true;},
  
  /**@private*/
  whenOpen : function(){
    this.markIndicator();
  },
  
  /**@private*/
  whenFinal : function(){
    this.stopIndicator();
    if(this.target.shadow){
      this.target.shadow.reanchor();
    }
  },

   targetLoadCS : false,

   maskDisabled : false,

   loadMsgDisabled : false,
   
/**
 * 开始加载提示.
 */
  markIndicator : function(){
    
    if(this.disabled)
      return;
    
    this.busy = true;
    
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
    
    this.busy = false;
    this.loaded = true;
  },
  
/**
 * 目标是否正在加载中.
 * @return {Boolean}
 */
  isBusy : function(){
    return this.busy;
  },
  
/**
 * 目标是否已成功加载.
 * @return {Boolean}
 */
  isLoaded : function(){
    return this.loaded;
  }, 
  
  destory : function(){
    this.setMonitor(null);
    this.superclass.destory.call(this);
  }
});

CC.ui.def('loading', CC.ui.Loading);
})();