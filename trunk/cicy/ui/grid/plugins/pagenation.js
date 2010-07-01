/**
 * @class CC.ui.grid.plugins.Pagenation
 * 表格分页插件
 */
CC.create('CC.ui.grid.plugins.Pagenation', null, {
/**
 * @cfg {Number} current 当前页
 */
	current : false,
	
/**
 * @property count
 * 总页数
 * @type Number
 */
	count : 0,
/**
 * @cfg {Number} size 每页记录数
 */
	size : 10,
/**
 * @cfg {Boolean} autoLoad 表格后渲染后是否立即连接请求分页数据,默认为true.
 */
  autoLoad : true,

/**
 * @cfg {Object} params 在每次发起请求时共享的提交参数对象键值对
 */
  params : false,

/**
 * 可重写该方法创建并返回自定义的查询字符串
 * @param {Object} queryObject key:value的提交键值对,可在里面定义提交的数据
 * @return {String}
 * @method customQuery
 */
  customQuery : false,

/**
 * @cfg {Boolean} disabled 是否允许响应分页
 */
  disabled : false,
  
  initialize : function(opt){
    CC.extend(this, opt);
  },
  
  initPlugin : function(g){
    g.content.on('statuschange', this._onConnectorStatusChange, this);
    if(this.autoLoad)
      g.on('rendered', this.go, this);
  },
  
  gridEventHandlers : {
    afteraddtb : function(tb){
      this.installUI(tb);
      this.tb = tb;
    }
  },
  
  installUI : function(tb){
  	var self = this;
    tb.layout.fromArray([
      {id:'first', tip:'第一页', icon:'g-icon-navfirst', onclick : self.go.bind(self, 1)},
      
      {id:'pre', lyInf:{separator:true}, tip:'上一页', icon:'g-icon-navpre', onclick : self.pre.bind(self)},
      {lyInf:{separator:true}, id:'current', template:'<span class="lbl">第 <span><input class="g-ipt-text g-corner" style="text-align:center;" id="_i" size="3"/></span> 页</span>',ctype:'base',clickDisabled:true},
      {id:'next', tip:'下一页', icon:'g-icon-navnxt', onclick : self.next.bind(self)},
      
      {lyInf:{separator:true}, id:'last', tip:'最后一页', icon:'g-icon-navlast',onclick : function(){
        self.go(self.count);
      }},
      {lyInf:{separator:true}, id:'total', template:'<span class="lbl">共<span id="_t">0</span>页</span>', ctype:'base', clickDisabled:true},
      {id:'refresh',tip:'刷新当前页', icon:'g-icon-ref', onclick:function(){
        self.refresh();
      }}
    ]);
    this.currentEl = tb.$('current').dom('_i');
    this.totalEl = tb.$('total').dom('_t');
    
    tb.bindEnter( function(){
    	if(self.currentEl.value.trim())
        self.go(parseInt(self.currentEl.value));
    } ,true, null, this.currentEl);
    
  },
/**
 * 刷新
 */
  refresh : function(){
    this.go(this.current, true);
  },
  
/**
 * 设置每页记录条数
 * @param {Number} size
 * @return this
 */
  setSize : function(sz){
    this.size = sz;
    return this;
  },

/**
 * @return this;
 */
  disable : function(b){
    this.disabled = b;
    this.updateUIStatus();
    return this;
  },
/**
 * @event page:beforechange
 * 事件由{@link CC.ui.grid.plugins.Pagenation}提供,分页改变前发送.
 * @param {Object} pageInformation
 * @param {Object} pagenationPlugin
 * @member CC.ui.Grid
 */

/**
 * @event page:afterchange
 * 事件由{@link CC.ui.grid.plugins.Pagenation}提供,分页改变,数据加载完成后发送.<br/>
 * @param {Object} pageInformation
 * @param {Object} returnedJsonObject
 * @param {CC.Ajax} ajax
 * @member CC.ui.Grid
 */

 
  go : function(inf, fource){
    if(!this.disabled){
    	if(!inf || typeof inf === 'number')
    	  inf = {current:inf||1};
    	
    	var pre = this.current, cr = inf.current;
    	
      if( (pre !== cr || fource) && cr>0){
        this.grid.fire('page:beforechange', inf, this) !== false && this.onPageChange(inf) !== false;
      }
    }
    return this;
  },
  
  isResponseOk : function(){
    return true;
  },
  
  onPageChange : function(pageInf){
    if(this.url){
      if(!pageInf)
         pageInf = {};
      
      // 收集提交的分页信息
      // copy page info to temp object
      pageInf = this.createQuery(pageInf);
  
      this.grid.content.getConnectionProvider()
          .connect(
             CC.templ(this, this.url, 2), 
             { success : this._onSuccess, params  : pageInf}
          );
    }
  },
  
  _onConnectorStatusChange : function(s){
     if(s === 'open')
       this.tb.$('refresh').disable(true);
     else if(s === 'final')
     	 this.tb.$('refresh').disable(false);
  },
  
/**
 * 要完全自定义提交的参数,可重写该方法,要定义局部的提交参数,可重写customQuery方法
 * 应用参数的顺序为 default page info -> this.params -> this.customQuery
 */
  createQuery : function(pageInf){
    CC.extendIf(pageInf, {
          size:this.size,
          count:this.count,
          current:this.current
    });
    // update param data to temp object
    if(this.params)
      CC.extend(pageInf, params);
      
    if(this.customQuery)
      this.customQuery(pageInf);
    return pageInf;
  },
  
  _onSuccess : function(j){
  	// 注意当前的this是content.getConnectionProvider()
    var page = this.t.pCt.pagenation;
    if(page.isResponseOk(j)){
    	 json = j.getJson();
       // 更新分页信息
	     page.size    = json.size;
	     page.count   = json.count;
	     page.current = json.current || j.params.current;
	     
	     if(page.current > page.count)
	       page.current = page.count;
	     
    	 //clear content rows
    	 this.t.destoryChildren();
    	 
       // call default processor
       this.defaultDataProcessor('json', json.data);
       page.grid.fire('page:afterchange', page, json, j); 
       page.updateUIStatus();
    }
  },
  
/**
 * 更新UI状态.
 */
  updateUIStatus : function(){
  	var tb = this.tb, cur = this.current, cnt = this.count;
  	//has pre
  	var test = this.disabled || cnt === 1 || cur <= 1;
  	tb.$('first').disable(test);
    tb.$('pre').disable(test);
    //has last
    test = this.disabled || cur === cnt || cnt === 1;
  	tb.$('next').disable(test);
    tb.$('last').disable(test); 
    this.currentEl.value = cur||'';
    this.totalEl.innerHTML = cnt;
    
    tb.$('refresh').disable(this.disabled||(cnt==0));
  },
  
  next : function(){
  	if(this.current !== this.count)
  	  this.go(this.current + 1);
  },
  
  pre : function(){
  	if(this.current - 1 >= 1)
  	  this.go(this.current - 1);
  }
});
CC.ui.def('gridpage', CC.ui.grid.plugins.Pagenation);