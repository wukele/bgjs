/**
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
 * @cfg {Boolean} subscribe  是否订阅CC.Ajax连接器事件到target容器中,默认false
 */
  subscribe : false,

/**
 * @cfg {String} reader 指定数据载入后格式转换器，默认无。
 */
  reader : false,
  
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
    // init request queue
    
    this.createSyncQueue();
    
    if(this.ajaxCfg && this.ajaxCfg.url)
      this.connect();
  },
  
  createSyncQueue : function(){
    this.syncQueue = new CC.util.AsynchronizeQueue({
      caller   : this,
      onempty : this.onConnectorsFinish,
      onfirstopen   : this.onConnectorFirstOpen
    });
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
    this.t.fire('defdataload', j, this);
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
        var ct = this.t.layout||this.t;
        if(this.reader){
            if(typeof this.reader === 'string')
                ct.fromArray(CC.util.DataTranslator.get(this.reader).read(data, this.t));
            else ct.fromArray(this.reader.read(data, this.t));
        }else 
            ct.fromArray(data);
        break;
    }
  },
  
  _setConnectorMsg : function(msg){
    this.caller.getIndicator().setTitle(msg);
  },
  
/**
 * 获得连接指示器,
 * Loading类寻找路径 this.indicatorCls -> target ct.indicatorCls -> CC.ui.Loading
 * @param {Object} indicatorConfig
 * @return {CC.ui.Loading}
 */
  getIndicator : function(opt){
    if(this.indicator && this.indicator.cacheId)
      return this.indicator;
    
    return this.createIndicator(opt);
  },
  
/**
 * 连接服务器, success操作如果未在配置中指定,默认调用当前ConnectionProvider类的defaultLoadSuccess方法
 * 如果当前未指定提示器,调用getIndicator方法实例化一个提示器;
 * 如果上一个正求正忙,终止上一个请求再连接;
 * 当前绑定容器将订阅请求过程中用到的Ajax类的所有消息;
 * indicator 配置信息从 this.indicator -> target ct.indicator获得
 * @param {String} url, 未指定时用this.url
 * @param {Object} cfg 配置Ajax类的配置信息, 参考信息:cfg.url = url, cfg.caller = this
 * @return {String} connectorKey connector in queue
 */
  connect : function(url, cfg){
    var afg = this.ajaxCfg;
    
    if(!afg)
      afg = {url:url||this.url};
      
    else if(url)
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
 * @cfg {Object|Function|String} indicator
 */
    if (!this.indicatorDisabled && !this.indicator)
      this.getIndicator();
        
    return this.bindConnector(afg);
  },
  
  getConnectionQueue : function(){
    return this.syncQueue;
  },
  
  // private
  createIndicator : function(opt){
    var it, inner = this.indicator || this.t.indicator;
    
    if( !opt ) 
      opt = {};
    
    opt.target = this.t;
    opt.targetLoadCS = this.loadCS;
    
    if(typeof inner == 'function'){
      it = new inner (opt);
    }else {
      if(typeof inner === 'string'){
        if(!opt.ctype)
          opt.ctype = inner;
      } else if(typeof inner === 'object'){
        CC.extendIf(opt, inner);
      }
      
      if(!opt.ctype)
        opt.ctype = 'loading';
        
      it = CC.ui.instance(opt); 
    }
    
    this.indicator = it;
    this.t.follow(it);
    return it;
  },
  
/**
 * 绑定连接器
 * 连接器接口为
  <pre>
  function(config){
    //终止当前连接
    abort : fGo,
    //订阅连接事件
    to : fGo(subscribe),
    //连接
    connect : fGo
  }
  </pre>
 * @private
 * @return {String} connectorKey
 */
  bindConnector : function(cfg){
    var a = this.createConnector(cfg);
    
    // 加入队列
    var connectorKey = this.syncQueue.join(a);

    if(this.subscribe)
      a.to(this.t);

    // 应用url模板 , 确保不覆盖原有ajaxCfg url
    a.url = CC.templ(this.t, cfg.url);
    a.connect();
    
    return connectorKey;
  },
  
/**
 * 创建并返回连接器
 * @private
 */
  createConnector : function(cfg){
     return new CC.Ajax(cfg);
  },

  onConnectorsFinish : function(j){
    this.t.fire('connection:connectorsfinish', this, j);
    if(!this.indicatorDisabled)
      this.getIndicator().stopIndicator();
  },
  
  onConnectorFirstOpen   : function(j){
    this.t.fire('connection:connectorsopen', this, j);
    if(!this.indicatorDisabled)
      this.getIndicator().markIndicator();
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
 * @event defdataload
 * 由{@link CC.util.ConnectionProvider}提供,数据成功返回后，进行默认的数据处理前发送
 * @param {CC.Ajax} j
 * @param {CC.util.ConnectionProvider} connectionProvider
 */ 

/**
 * @event connection:connectorsopen
 * @param {CC.util.ConnectionProvider} current
 * @param {Object|CC.Ajax} connector
 * 由{@link CC.util.ConnectionProvider} 批量请求开始时发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */
 
/**
 * @event connection:connectorsfinish
 * @param {CC.util.ConnectionProvider} current
 * @param {Object|CC.Ajax} connector
 * 由{@link CC.util.ConnectionProvider} 批量请求结束后发送
 * @param {CC.util.ConnectionProvider} connectionProvider
 */