/**
 * @class CC.util.IFrameConnectionProvider
 * 封装IFramePanel容器的连接处理.
 * @extends CC.util.ConnectionProvider
 */

/**
 * @cfg {Boolean} traceLoad 是否监听IFRAME加载事件,默认为true
 */

/**
 * @event connection:connectorsopen
 * @param {CC.util.ConnectionProvider} current
 * @param {CC.ui.IFramePanel} iframepanel
 * 由{@link CC.util.ConnectionProvider} 批量请求开始时发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
 
/**
 * @event connection:connectorsfinish
 * @param {CC.util.ConnectionProvider} current
 * @param {CC.ui.IFramePanel} iframepanel
 * 由{@link CC.util.ConnectionProvider} 批量请求结束后发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */

/**
 * @event connection:success
 * @param {CC.util.ConnectionProvider} current
 * @param {CC.ui.IFramePanel} iframepanel
 * 由{@link CC.util.ConnectionProvider} 加载完成后发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
 
CC.create('CC.util.IFrameConnectionProvider', CC.util.ConnectionProvider, {

  traceLoad : true,

  indicatorDisabled : true,

  // 默认不处理,重写
  defaultLoadSuccess : fGo,
  
  setTarget : function(t){
  	CC.util.ConnectionProvider.prototype.setTarget.apply(this, arguments);
  	if(t.src || t.url)
  	  this.connect(t.src || t.url);
  },
  
  initConnection : function(){
    if(this.traceLoad)
      this.t.domEvent(CC.ie?'readystatechange':'load', this.traceFrameLoad, false, this , this.t.getFrameEl());
    CC.util.ConnectionProvider.prototype.initConnection.apply(this, arguments);
  },

/**@private*/
  onFrameLoad : function(e){
    var t = this.t;
    try{
      this.t.fire('connection:success', this, t);
      if(this.success)
        this.success(this, e);
    }catch(ex){console.warn(ex);}

    this.onFinal();
  },

/**@private*/
  traceFrameLoad : function(evt){
    var status = CC.Event.element(evt).readyState || evt.type,
        t = this.t;
    switch(status){
      case 'loading':  //IE  has several readystate transitions
        if(!t.busy)
          this.onConnectorFirstOpen(this, t);
      break;
      //
      //当用户手动刷新FRAME时该事件也会发送
      //case 'interactive': //IE
      case 'load': //Gecko, Opera
      case 'complete': //IE
        //May be ie would do a clean action before a new page loaded.
        if(!CC.ie || this.url === t.view.src)
          this.onFrameLoad(evt);
        break;
    }
  },
/**中止当前连接.*/
  abort : function(){
    this.t.getFrameEl().src = CC.ie?'about:blank':'';
    this.onFinal();
  },

/**@private*/
  onFinal : function(){
    this.onConnectorsFinish(this, this.t);
  },

/**@private*/
  bindConnector : function(cfg){
    if(this.t.busy)
      this.abort();

    CC.extend(this, cfg);
    this.connectInner();
  },

/**@private*/
  connectInner : function(){
    this.onConnectorFirstOpen(this, this.t);
    (function(){
      try{
        this.t.getFrameEl().src = this.url;
      }catch(e){
        if(__debug) console.warn(e);
      }
    }).bind(this).timeout(0);
  }
});

CC.Tpl.def('CC.ui.IFramePanel', '<iframe class="g-framepanel" frameBorder="no" scrolling="auto" hideFocus=""></iframe>');
/**
 * @class CC.ui.IFramePanel
 * 面板主要维护一个iframe结点.
 * @extends  CC.ui.Panel
 */
CC.create('CC.ui.IFramePanel', CC.ui.Panel, {
/**
 * @cfg {Boolean} traceResize 是否跟踪IFramePanel父容器宽高改变以便调整自身宽高,默认值为false,
 * 通常并不需要该项,IFramePanel往往是通过父容器的布局管理器来调整它的大小.
 */
  traceResize : false,

  connectionProvider : CC.util.IFrameConnectionProvider,
  // 取消父层默认的_ctx
  ct : undefined,

  onRender : function(){
    CC.ui.Panel.prototype.onRender.call(this);

    var c = this.pCt;

    if(this.traceResize){
      c.on('resized', this.onContainerResize, this);
      this.onContainerResize(false, false, c.wrapper.getWidth(true), c.wrapper.getHeight(true));
    }
  },
/**
 * 获得iframe html结点.
 * @return {HTMLElement} iframe
 */
  getFrameEl : function(){
    return this.view;
  },

/**
 * 获得iframe中的widnow对象.
 * @return {Window} window
 */
  getWin : function(){
    return CC.frameWin(this.getFrameEl());
  },
  
  //
  // 实例化时可重写该方法,以自定义IFRAME宽高.
  //
  onContainerResize : function(a,b,c,d){
    this.setSize(a, b);
  },

  /**
   * 根据结点id返回IFrame页面内元素dom结点.
   * 注:必须在IFrame加载完成后才可正常访问.
   * @return {DOMElement}
   * @method $
   */
  $ : function(id){
    return CC.frameDoc(this.view).getElementById(id);
  },

/**
 * 方法等同于 this.getConnectionProvider().connect(src), 加载一个页面。
 */
  connect : function(src){
    this.getConnectionProvider().connect(src);
  }
}
);

CC.ui.def('iframe', CC.ui.IFramePanel);