//~@base/connectionprovider.js
/**
 * 为控件提供数据加载功能
 * 这个类主要用于桥接CC.Ajax与CC.ui.ContainerBase.
 * @name CC.util.ConnectionProvider
 * @class
 */

CC.util.ProviderFactory.create('Connection', null, /**@lends CC.util.ConnectionProvider#*/{
/**
 * 是否禁用指示器,默认false
 */
  indicatorDisabled : false,
/**
 * 连接器设置,连接器保存当前默认的连接器connector配置信息,
 * 每次连接时都以该配置信息与新的配置结合发出连接.
 * @example
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
 */
  ajaxCfg : null,


  setTarget : function(){
  	CC.util.ProviderBase.prototype.setTarget.apply(this, arguments);
  	this.initConnection();
  },
  
  initConnection : function(){
    if(this.ajaxCfg && this.ajaxCfg.url)
      this.connect();
  },

/**
 * @name CC.util.ConnectionProvider#loadType
 * @property {String} loadType
 * 指明返回数据的类型,成功加载数据后默认的处理函数将根据该类型执行
 * 相应的操作,被支持的类型有如下两种
 * <li>html,返回的HTML将被加载到target.wrapper中
 * <li>json,返回的数据转换成json,并通过target.fromArray加载子项
 * 如果未指定,按json类型处理
 * @see #defaultLoadSuccess
 */
/**
 * 成功返回后执行,默认是根据返回数据类型(loadType)执行相应操作,
 * 如果要自定义处理返回的数据,可定义在连接时传递success方法或重写本方法
 * @param {CC.Ajax} j
 * @see #loadType
 * @example
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
 */
  defaultLoadSuccess : function(j){
    var t = this.loadType;
    if(t === 'html')
      this.defaultDataProcessor(t, j.getText());
    else this.defaultDataProcessor(t, j.getJson());
  },
/**
 *
 */
  defaultDataProcessor : function(dataType, data){
    switch(dataType){
      case 'html' :
        this.t.wrapper.html(data, true);
        break;
      default :
        this.t.layout.fromArray(data);
        break;
    }
  },

/**
 * 获得连接指示器
 * Loading类寻找路径 this.indicatorCls -> target ct.indicatorCls -> CC.ui.Loading
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
 * @name CC.util.ConnectionProvider#indicatorCfg
 * @property {Object} indicatorCfg
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
 * @protected
 */
  bindConnector : function(cfg){

    if(this.indicator.isBusy())
      this.getConnector().abort();

    var a = this.connector =  this.createConnector(cfg);
    a.to(this.t);
    a.connect();
  },
/**
 * 创建并返回连接器
 * @protected
 */
  createConnector : function(cfg){
    return new CC.Ajax(cfg);
  }
});


/**
 * @name CC.ui.ContainerBase#getConnectionProvider
 * 获得容器连接器.
 * 如果未指定容器的连接器,可通过传过参数cls指定连接器类,
 * 用于实例化的连接器类搜寻过程为 cls -> ct.connectionCls -> CC.util.ConnectionProvider;
 * 连接器配置信息可存放在ct.connectionProvider中, 连接器实例化后将移除该属性;
 * 生成连接器后可直接通过ct.connectionProvider访问连接器;
 * @param {CC.util.ConnectionProvider} [cls] 使用指定连接器类初始化
 */

//~@base/selectionprovider.js
/**
 * 为容器提供子项选择功能,子项是否选择的检测是一个 -- 由子项样式状态作向导的实时检测.
 * @name CC.util.SelectionProvider
 * @class
 */