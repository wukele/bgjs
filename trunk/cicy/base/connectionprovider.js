//~@base/connectionprovider.js
/**
 * Ϊ�ؼ��ṩ���ݼ��ع���
 * �������Ҫ�����Ž�CC.Ajax��CC.ui.ContainerBase.
 * @name CC.util.ConnectionProvider
 * @class
 */

CC.util.ProviderFactory.create('Connection', null, /**@lends CC.util.ConnectionProvider#*/{
/**
 * �Ƿ����ָʾ��,Ĭ��false
 */
  indicatorDisabled : false,
/**
 * ����������,���������浱ǰĬ�ϵ�������connector������Ϣ,
 * ÿ������ʱ���Ը�������Ϣ���µ����ý�Ϸ�������.
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
    //������������Խ��Ḳ��provider.ajaxCfgԭ������
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
 * ָ���������ݵ�����,�ɹ��������ݺ�Ĭ�ϵĴ����������ݸ�����ִ��
 * ��Ӧ�Ĳ���,��֧�ֵ���������������
 * <li>html,���ص�HTML�������ص�target.wrapper��
 * <li>json,���ص�����ת����json,��ͨ��target.fromArray��������
 * ���δָ��,��json���ʹ���
 * @see #defaultLoadSuccess
 */
/**
 * �ɹ����غ�ִ��,Ĭ���Ǹ��ݷ�����������(loadType)ִ����Ӧ����,
 * ���Ҫ�Զ��崦���ص�����,�ɶ���������ʱ����success��������д������
 * @param {CC.Ajax} j
 * @see #loadType
 * @example
   var ct = new CC.ui.ContainerBase({
    connectionProvider : {loadType:'json'}
   });
   //����json
   ct.getConnectionProvider().connect('http://server/getChildrenData');

   //����html������
   ct.connectionProvider.loadType = 'html';
   ct.connectionProvider.connect('http://server/htmls/');

   //���Զ������
   ct.getConnectionProvider().connect('http://server/..', {
     success : function(j){
      //thisĬ����connectionProvider
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
 * �������ָʾ��
 * Loading��Ѱ��·�� this.indicatorCls -> target ct.indicatorCls -> CC.ui.Loading
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
 * ���ӷ�����, success�������δ��������ָ��,Ĭ�ϵ��õ�ǰConnectionProvider���defaultLoadSuccess����
 * �����ǰδָ����ʾ��,����getIndicator����ʵ����һ����ʾ��;
 * �����һ��������æ,��ֹ��һ������������;
 * ��ǰ����������������������õ���Ajax���������Ϣ;
 * indicator cfg ������Ϣ�� this.indicatorCfg -> target ct.indicatorCfg���
 * @param {String} url, δָ��ʱ��this.url
 * @param {Object} cfg ����Ajax���������Ϣ, �ο���Ϣ:cfg.url = url, cfg.caller = this
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
        throw '���ʹ��Ĭ�ϴ���,ajaxCfg��caller��Ϊ��ǰ��connection provider';
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
 * ���������,��������ֻ�ṩ���ݼ��ع���,Ĭ����CC.Ajax����Ϊ������.
 * @return {CC.Ajax}
 */
  getConnector : function(){
    return this.connector;
  },

/**
 * ��������
 * �������ӿ�Ϊ
  <pre>
  function(config){
    //��ֹ��ǰ����
    abort : fGo,
    //���������¼�
    to : fGo(subsciber),
    //����
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
 * ����������������
 * @protected
 */
  createConnector : function(cfg){
    return new CC.Ajax(cfg);
  }
});


/**
 * @name CC.ui.ContainerBase#getConnectionProvider
 * �������������.
 * ���δָ��������������,��ͨ����������clsָ����������,
 * ����ʵ����������������Ѱ����Ϊ cls -> ct.connectionCls -> CC.util.ConnectionProvider;
 * ������������Ϣ�ɴ����ct.connectionProvider��, ������ʵ�������Ƴ�������;
 * �������������ֱ��ͨ��ct.connectionProvider����������;
 * @param {CC.util.ConnectionProvider} [cls] ʹ��ָ�����������ʼ��
 */

//~@base/selectionprovider.js
/**
 * Ϊ�����ṩ����ѡ����,�����Ƿ�ѡ��ļ����һ�� -- ��������ʽ״̬���򵼵�ʵʱ���.
 * @name CC.util.SelectionProvider
 * @class
 */