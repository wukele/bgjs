﻿/**
 * @class CC.util.ConnectionProvider
 * 为控件提供数据加载功能
 * 这个类主要用于桥接CC.Ajax与CC.ui.ContainerBase.
 * @extends CC.util.ProviderBase
 */

 
CC.util.ProviderFactory.create('Connection', null, {
/**
 * @cfg {Boolean} indicatorDisabled  是否禁用指示器,默认false
 */
  indicatorDisabled : false,

/**
 * @cfg {Object} ajaxCfg
 * 连接器设置,连接器保存当前默认的连接器connector配置信息,
 * 每次连接时都以该配置信息与新的配置结合发出连接.
 * <br><pre><code>
   var provider = new CC.util.ConnectionProvider(target, {
    indicatorDisabled : true,
    ajaxCfg : {
      url : 'http://www.server.com/old',
      success : function(){},
      ...
    }
   });

   provider.connect('http://www.server.com/new',
    //这里的配置属性将会覆盖provider.ajaxCfg原有属性
    {
      success : function(){},
      ...
    }
   );
   </code></pre>
 */
  ajaxCfg : false,

  setTarget : function(){
  	CC.util.ProviderBase.prototype.setTarget.apply(this, arguments);
  	this.initConnection();
  },

 /**@private*/
  initConnection : function(){
    if(this.ajaxCfg && this.ajaxCfg.url)
      this.connect();
  },

/**
 * @cfg {String} loadType
 * 指明返回数据的类型,成功加载数据后默认的处理函数将根据该类型执行
 * 相应的操作,被支持的类型有如下两种<div class="mdetail-params"><ul>
 * <li>html,返回的HTML将被加载到target.wrapper中</li>
 * <li>json,返回的数据转换成json,并通过target.fromArray加载子项</li></ul></div>
 * 如果未指定,按json类型处理.
 * 默认处理函数:{@link #defaultLoadSuccess}
 */
 
 /**
  * 成功返回后执行,默认是根据返回数据类型(loadType)执行相应操作,
  * 如果要自定义处理返回的数据,可定义在连接时传递success方法或重写本方法.<br>
 <pre><code>
   var ct = new CC.ui.ContainerBase({
    connectionProvider : {loadType:'json'}
   });
   //加载json
   ct.getConnectionProvider().connect('http://server/getChildrenData');

   //加载html到容器
   ct.connectionProvider.loadType = 'html';
   ct.connectionProvider.connect('http://server/htmls/');

   //或自定义加载
   ct.getConnectionProvider().connect('http://server/..', {
     success : function(j){
      //this默认是connectionProvider
      alert(this.loadType);
      alert(j.getText());
     }
   });
 </code></pre>
 * @param {CC.Ajax} ajax
 */
  defaultLoadSuccess : function(j){
    var t = this.loadType;
    if(t === 'html')
      this.defaultDataProcessor(t, j.getText());
    else this.defaultDataProcessor(t, j.getJson());
  },
  
/**
 *  可重写本方法自定义数据类型加载
 */
  defaultDataProcessor : function(dataType, data){
    switch(dataType){
      case 'html' :
        this.t.wrapper.html(data, true);
        break;
      default :
        (this.t.layout||this.t).fromArray(data);
        break;
    }
  },

/**
 * 获得连接指示器,
 * Loading类寻找路径 this.indicatorCls -> target ct.indicatorCls -> CC.ui.Loading
 * @param {Object} indicatorConfig
 * @return {CC.ui.Loading}
 */
  getIndicator : function(opt){
    if(this.indicator)
      return this.indicator;

    var cls = this.indicatorCls   ||
              this.t.indicatorCls ||
              CC.ui.Loading;
    var cfg = {
      target: this.t,
      targetLoadCS: this.loadCS
    };
    
    if (opt !== undefined)
      opt = CC.extend(cfg, opt);

    var it = this.indicator = new cls(cfg);
    this.t.follow(it);
    return it;
  },
/**
 * 连接服务器, success操作如果未在配置中指定,默认调用当前ConnectionProvider类的defaultLoadSuccess方法
 * 如果当前未指定提示器,调用getIndicator方法实例化一个提示器;
 * 如果上一个正求正忙,终止上一个请求再连接;
 * 当前绑定容器将订阅请求过程中用到的Ajax类的所有消息;
 * indicator cfg 配置信息从 this.indicatorCfg -> target ct.indicatorCfg获得
 * @param {String} url, 未指定时用this.url
 * @param {Object} cfg 配置Ajax类的配置信息, 参考信息:cfg.url = url, cfg.caller = this
 * @return this
 */
  connect : function(url, cfg){
    var afg = this.ajaxCfg;
    
    if(!afg)
      afg = {};
      
    if(url)
      afg.url = url;

    afg.caller = this;
    
    if(cfg)
      CC.extend(afg, cfg);
    
    if (!afg.success){
      if(afg.caller !== this)
        throw '如果使用默认处理,ajaxCfg的caller须为当前的connection provider';
      afg.success = this.defaultLoadSuccess;
    }

/**
 * @cfg {Object} indicatorCfg
 */
    if (!this.indicatorDisabled && !this.indicator)
      this.getIndicator(this.indicatorCfg || this.t.indicatorCfg);

    this.bindConnector(afg);
    return this;
  },

/**
 * 获得连接器,该连接器只提供数据加载功能,默认用CC.Ajax类作为连接器.
 * @return {CC.Ajax}
 */
  getConnector : function(){
    return this.connector;
  },

/**
 * 绑定连接器
 * 连接器接口为
  <pre>
  function(config){
    //终止当前连接
    abort : fGo,
    //订阅连接事件
    to : fGo(subsciber),
    //连接
    connect : fGo
  }
  </pre>
 * @private
 */
  bindConnector : function(cfg){

    if(this.indicator.isBusy())
      this.getConnector().abort();

    var a = this.connector =  this.createConnector(cfg);
    
    // 应用url模板
    a.url = CC.templ(this.t, a.url);
    
    a.to(this.t);
    a.connect();
  },
/**
 * 创建并返回连接器
 * @private
 */
  createConnector : function(cfg){
    return new CC.Ajax(cfg);
  }
});


/**
 * 获得容器连接器.
 * 如果未指定容器的连接器,可通过传过参数cls指定连接器类,
 * 用于实例化的连接器类搜寻过程为 cls -> ct.connectionCls -> CC.util.ConnectionProvider;
 * 连接器配置信息可存放在ct.connectionProvider中, 连接器实例化后将移除该属性;
 * 生成连接器后可直接通过ct.connectionProvider访问连接器;
 * @param {CC.util.ConnectionProvider} [config] 使用指定连接器类初始化
 * @member CC.ui.ContainerBase
 * @method getConnectionProvider
 */
 /**
  * @class CC.ui.ContainerBase
  */
         /**
         * @event final
         * 事件由{@link CC.util.ConnectionProvider}提供,connectionProvider请求结束后调用,无论成功与否都会触发.
         * @param {CC.Ajax} ajax
         */
        /**
         * @event open
         * 事件由{@link CC.util.ConnectionProvider}提供,在connectionProvider打开连接前发送
         * @param {CC.Ajax} ajax
         */
 /**
  * @event send
  * 事件由{@link CC.util.ConnectionProvider}提供,在connectionProvider发送数据前发送
  * @param {CC.Ajax} ajax
  */
  
        /**
         * @event json
         * 事件由{@link CC.util.ConnectionProvider}提供,在获得XMLHttpRequest数据调后Ajax.getJson方法后发送,可直接对当前json对象作更改,这样可对返回的json数据作预处理.
         * @param {Object} o json对象
         * @param {Ajax} ajax
         */
        /**
         * @event xmlDoc
         * 事件由{@link CC.util.ConnectionProvider}提供,在获得XMLHttpRequest数据调后Ajax.getXMLDoc方法后发送,可直接对当前xmlDoc对象作更改,这样可对返回的XMLDoc数据作预处理.
         * @param {XMLDocument} doc
         * @param {CC.Ajax} ajax
         */
        /**
         * @event text
         * 事件由{@link CC.util.ConnectionProvider}提供,在获得XMLHttpRequest数据调后Ajax.getText方法后发送,如果要改变当前text数据,在更改text后设置当前Ajax对象text属性即可,这样可对返回的文件数据作预处理.
         * @param {String} responseText
         * @param {CC.Ajax} ajax
         */
/**
 * @event failure
 * 事件由{@link CC.util.ConnectionProvider}提供,数据请求失败返回后发送.
 * @param {CC.Ajax} ajax
 */
 
/**
 * @event success
 * 事件由{@link CC.util.ConnectionProvider}提供,数据成功返回加载后发送.
 * @param {CC.Ajax} ajax
 */
 
/**
 * @event load
 * 事件由{@link CC.util.ConnectionProvider}提供,请求响应返回加载后发送(此时readyState = 4).
 * @param {CC.Ajax} ajax
 */
 
/**
 * @event statuschange
 * 由{@link CC.util.ConnectionProvider}提供,在每个Ajax fire事件发送前该事件都会发送
 * @param {String} status
 * @param {CC.Ajax} j
 */