(function(){
var ccxp = CC.ui.ContainerBase.prototype;

//~@base/providers.js
/**
 * @name CC.util.ProviderBase
 * @class
 */
CC.create('CC.util.ProviderBase', null, /**@lends CC.util.ProviderBase#*/{
	
	initialize : function(opt){
/**
 * 是否已初始化,主要是提供给getXXProvider方法检测目标是否已关联Provider实例
 * @private
 */
		this.inited = true;
		if(opt)
			CC.extend(this, opt);
	},

	setTarget : function(container){
		this.t = container;
	},
	
	each : function(){
	  this.t.each.apply(this.t, arguments);
	}
});

/**
 * @name CC.util.ProviderFactory
 * @class
 */
CC.util.ProviderFactory = {
	
	create : function(name, base, attrs){
		var full      = name + 'Provider', low = name.toLowerCase();
		//lowProvider
		var access    = low + 'Provider';
		var clsName   = 'CC.util.'+full;
		// create provider class
		CC.create(clsName, base || CC.util.ProviderBase, attrs);
		// create container.getXProvider method
		ccxp['get'+full] = function(opt, cls){
		  var p = this[access];
		  if(!p || p === true || !p.inited){
		  	// get config from inherency attribute link
		    var cfgs = CC.getObjectLinkedValues(this, access, true);
		    
		    if(opt)
		      cfgs.insert(0, opt);
		    
		    var c = {}, cls = false;
		    for(var i=0,len=cfgs.length;i<len;i++){
		      var it = cfgs[i];
		      // default class
		      if(it === true && !cls)
		         cls = CC.attr(window, clsName);
          // a ctype
		      if(typeof it === 'string' && c.ctype === undefined)
		        c.ctype = it;
		      // a class specified
          else if(typeof it === 'function' && !cls)
          	cls = it;
		      
		      // 最前优先级最高
		      else CC.extendIf(c, it);
		    }
		    
		    if(!cls && !c.ctype)
		      cls = cls = CC.attr(window, clsName);
		    
		    p = this[access] = cls ? new cls(c) : CC.ui.instance(c);
		      
		    p.setTarget(this);
		  }
		  return p;
		};
	}
};
})();