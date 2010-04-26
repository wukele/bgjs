/**
 * @name CC.ui.grid.plugins.Pagenation
 * @class 表格分页插件
 */
CC.create('CC.ui.grid.plugins.Pagenation', null, /**@lends CC.ui.grid.plugins.Pagenation#*/{
/**
 * 当前页
 * @type Number
 */
	current : 1,
/**
 * 总页数
 * @type Number
 */
	count : 0,
/**
 * 每页记录数
 * @type Number
 */
	size : 10,

/**
 * 分页提交参数
 * @type Object
 */
 params : null,
 
  initialize : function(opt){
    CC.extend(this, opt);
  },
  
  initPlugin : function(g){
    this.grid = g;
    this.grid.content.on('statuschange', this._onConnectorStatusChange, this);
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
      {id:'first', qtip:'第一页', icon:'g-icon-navfirst', onclick : self.go.bind(self, 1)},
      
      {id:'pre', lyInf:{separator:true}, qtip:'上一页', icon:'g-icon-navpre', onclick : self.pre.bind(self)},
      {lyInf:{separator:true}, id:'current', template:'<span class="lbl">第 <span><input class="g-ipt-text g-corner" style="text-align:center;" id="_i" size="3"/></span> 页</span>',ctype:'base',clickDisabled:true},
      {id:'next', qtip:'下一页', icon:'g-icon-navnxt', onclick : self.next.bind(self)},
      
      {lyInf:{separator:true}, id:'last', qtip:'最后一页', icon:'g-icon-navlast',onclick : function(){
        self.go(self.count);
      }},
      {lyInf:{separator:true}, id:'total', template:'<span class="lbl">共<span id="_t">0</span>页</span>', ctype:'base', clickDisabled:true},
      {id:'refresh',qtip:'刷新当前页', icon:'g-icon-ref', onclick:function(){
        self.go(self.current, true);
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
 * 设置每页记录条数
 * @return this
 */
  setSize : function(sz){
    this.size = sz;
    return this;
  },

/**
 * @return this
 */  
  setCount : function(cnt){
    this.count = cnt;
    return this;
  },
/**
 * @name CC.ui.grid#page:beforechange
 * @param {Object} pageInformation
 * @param {Object} pagenationPlugin
 * @event
 */
/**
 * @param {Object | Number} pageInfo
 * @param {Boolean} fource fourceToLoad
 * @return this
 */
  go : function(inf, fource){
  	if(typeof inf === 'number')
  	  inf = {current:inf};
  	
  	var pre = this.current, cr = inf.current;
  	
    if( (pre !== cr || fource) && cr>0){
      this.grid.fire('page:beforechange', inf, this) !== false && this.onPageChange(inf) !== false;
    }
    return this;
  },
  
  isResponseOk : function(){
    return true;
  },
  
  onPageChange : function(pageInf){
    if(!pageInf)
       pageInf = {};
    
    // 收集提交的分页信息
    // copy page info to temp object
    CC.extendIf(pageInf, {
      size:this.size,
      count:this.count,
      current:this.current
    });
    
    // update param data to temp object
    if(this.params)
      CC.extend(pageInf, params);

    this.grid.content.getConnectionProvider()
        .connect(this.url, {
           success : this._onSuccess,
           params  : pageInf
    });
  },
  
  _onConnectorStatusChange : function(s){
     if(s === 'open')
       this.tb.$('refresh').disable(true);
     else if(s === 'final')
     	 this.tb.$('refresh').disable(false);
  },
/**
 * @name CC.ui.grid#page:afterchange
 * @event
 * @param {CC.ui.grid.plugin.Pagenation} 分页插件实例
 * @param {CC.Ajax} j
 */
 
 /**
  * 
  */
  _onSuccess : function(j){
  	// 注意当前的this是content.getConnectionProvider()
    var page = this.t.pCt.pagenation;
    if(page.isResponseOk(j)){
    	 json = j.getJson();
       // 更新分页信息
	     page.size    = json.size;
	     page.count   = json.count;
	     page.current = json.current || j.params.current;
	     
    	 //clear content rows
    	 this.t.destoryChildren();
    	 
       // call default processor
       this.defaultDataProcessor('json', json.data);
       page.grid.fire('page:afterchange', page, json, j); 
       page.updateUIStatus();
    }
  },
  
  updateUIStatus : function(){
  	var tb = this.tb, cur = this.current, cnt = this.count;
  	//has pre
  	var test = cnt === 1 || cur <= 1;
  	tb.$('first').disable(test);
    tb.$('pre').disable(test);
    //has last
    test = cur === cnt || cnt === 1;
  	tb.$('next').disable(test);
    tb.$('last').disable(test); 
    this.currentEl.value = cur;
    this.totalEl.innerHTML = cnt;
    
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