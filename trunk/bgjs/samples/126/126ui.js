CC.create('UI126', CViewport, function(father){
return {
	//BorderLayout布局
	layout:'border',
	
	id : 'ui126',
	
	loadFramework : function(){
		var self = this;
		//如果存在插件
		if(UI126.plugins){
			CC.each(UI126.plugins, (function(){
				if(CC.isArray(this)){
					self.on(this[0], this[1]);
				}else this(self);
			}));
			//release plugins.
			UI126.plugins = null;
		}
		//创建主要布局 - 东西北中
		this.northPanel = new CPanel({id:'frameworkNorthPanel', view: 'frameworkNorthPanel', height:70, maxH:70});
		this.westPanel = new CPanel({id:'frameworkWestPanel', view:'frameworkWestPanel', width:191, maxW : 450, layout:'border'});
		this.eastPanel = new CPanel({id:'frameworkEastPanel', view:'frameworkEastPanel', width:180, layout:'row'});
		this.centerPanel = new CPanel({id:'frameworkCenterPanel', view:'frameworkCenterPanel', layout:'row'});
		this.add(this.northPanel, {dir:'north', gap:0});
		this.fire('addNorthPanel', this.northPanel);
		this.add(this.eastPanel, {dir:'east', split:true, gap:7});
		this.fire('addEastPanel', this.eastPanel);
		this.add(this.westPanel, {dir:'west', split:true, gap:1});
		this.fire('addWestPanel', this.westPanel);
		this.add(this.centerPanel, 'center');
		this.fire('addCenterPanel', this.centerPanel);
	},
	
	destoryComponent : function(){
		this.fire('destory');
		father.destoryComponent.call(this);
	}
};
});

UI126.registerPlugin = function(pln, c){
	if(!UI126.plugins)
		UI126.plugins = [];
	if(CC.isFunction(pln)){
		UI126.plugins.push(pln);
	}else {
		UI126.plugins.push([pln, c]);
	}
};
