(function(){
var ccxp = CC.ui.ContainerBase.prototype;

/**
 * @class CC.util.ProviderBase
 * 容器{@link CC.ui.ContainerBase}功能增强类的基类.
 */
 
/**
 * @property t
 * 已绑定的目标容器
 * @type CC.ui.ContainerBase
 */
 
CC.create('CC.util.ProviderBase', null, {
	
	initialize : function(opt){
/**
 * 是否已初始化,主要是提供给getXXProvider方法检测目标是否已关联Provider实例
 * @private
 */
		this.inited = true;
		if(opt)
			CC.extend(this, opt);
	},
/**
 * 绑定容器.
 * @param {CC.ui.ContainerBase} targetContainer
 */
	setTarget : function(container){
		this.t = container;
	},

	each : function(){
	  this.t.each.apply(this.t, arguments);
	}
});

/**
 * @class CC.util.ProviderFactory
 */
CC.util.ProviderFactory = {
/**
 * @param {String} name Provider name
 * @param {Function} baseClass base class
 * @param {Object} attrset attribute set
 */
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