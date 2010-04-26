/**
 * @name CC.util.IFrameConnectionProvider
 * @class
 * @extends CC.util.ConnectionProvider
 */
CC.create('CC.util.IFrameConnectionProvider', CC.util.ConnectionProvider, /**@lends CC.util.IFrameConnectionProvider#*/{

/**
 * �Ƿ����IFRAME�����¼�,Ĭ��Ϊtrue
 * @type Boolean
 */
  traceLoad : true,

/**indicatorDisabled:false*/
  indicatorDisabled : true,

/**
 * Ĭ�ϲ�����
 */
  defaultLoadSuccess : fGo,
  
  setTarget : function(t){
  	CC.util.ConnectionProvider.prototype.setTarget.apply(this, arguments);
  	if(t.src || t.url)
  	  this.connect();
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
      t.fire('success', this, e);
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
          t.fire('open', this, evt);
      break;
      //
      //���û��ֶ�ˢ��FRAMEʱ���¼�Ҳ�ᷢ��
      //case 'interactive': //IE
      case 'load': //Gecko, Opera
      case 'complete': //IE
        //May be ie would do a clean action before a new page loaded.
        if(!CC.ie || this.url === t.view.src)
          this.onFrameLoad(evt);
        break;
    }
  },
/***/
  abort : function(){
    this.getFrameEl().src = CC.ie?'about:blank':'';
    this.onFinal();
  },

/**@private*/
  onFinal : function(){
    this.t.fire('final', this);

    if(this['final']){
      this['final'](this,  e);
    }
  },

/**@private*/
  bindConnector : function(cfg){
    if(this.t.busy)
      this.abort();

    CC.extend(this, cfg);
    this.connectInner();
  },

/**@private*/
  connectInner : function(cfg){
    this.t.fire('open', this);
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
 * IFRAME����װ
 * @name CC.ui.IFramePanel
 * @class
 * @extends  CC.ui.Panel
 */
CC.create('CC.ui.IFramePanel', CC.ui.Panel, /**@lends CC.ui.IFramePanel#*/{
/**
 * �Ƿ����IFramePanel��������߸ı��Ա����������,Ĭ��ֵΪfalse,
 * ͨ��������Ҫ����,IFramePanel������ͨ���������Ĳ��ֹ��������������Ĵ�С.
 * @type Boolean
 */
  traceResize : false,

  connectionProvider : CC.util.IFrameConnectionProvider,

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
 * ���iframe html���
 */
  getFrameEl : function(){
    return this.view;
  },

  //
  // ʵ����ʱ����д�÷���,���Զ���IFRAME���.
  //
  onContainerResize : function(a,b,c,d){
    this.setSize(a, b);
  },

  /**
   * ���ݽ��id����IFrameҳ����Ԫ��dom���.
   * ע:������IFrame������ɺ�ſ���������.
   * @function
   * @return {DOMElement}
   */
  $ : function(id){
    return CC.frameDoc(this.view).getElementById(id);
  }
}
);

CC.ui.def('iframe', CC.ui.IFramePanel);