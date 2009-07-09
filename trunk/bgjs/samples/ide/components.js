CC.create('AttributeBase', null, function(){	 
 return {
		initialize : function(cfg){
			CC.extend(this, cfg);
		},
		
		key: 'id',
		
		get : function(c) {
			return c[this.key]||'';
		},
		
		set : function(c, v){
			if(!c['set'+this.key.upperFirst()])
				c[this.key] = v;
			else c['set'+this.key.upperFirst()](v);
		},
		
		getCfgStr : function(c){
			var s= this.key+':'+'"'+c[this.key].toString().escapeQuote('"')+'"';
			console.debug(s);
			return s;
		},
		
		getScript : function(varName, c){
			if(!c['set'+this.key.upperFirst()])
				s= varName+'.set'+this.key.upperFirst()+'("'+c[this.key].toString().escapeQuote('"')+'");';
			else s = varName+'.'+this.key+'="'+c[this.key].toString().escapeQuote('"')+'";';
			return s;
		},
		
		activeEditor : function(c){
			if(!this.editor){
				this.createEditor();
				this.editor.display(false).render();
				this.vsRow.follow(this.editor);
			}
			if(!this.editor.display()){
				this.vsRow.valueCell.setTitle('');
				this.editor.appendTo(this.vsRow.valueCell.dom('_tle'));
				this.editor.setValue(this.get(c));
				this.editor.display(true).focus(0);
			}
		},
		
		applyComponent : function(c){
			this.vsRow.valueCell.setTitle(this.get(c));
		},
		
		createEditor : function(){
			this.editor = new CText();
			this.editor.domEvent('blur', this.onEditorBlur, true, this, this.editor.element);
			this.editor.bindEnter(this.onEditorBlur, true, this, this.editor.element);
		},
		
		onEditorBlur : function(){
			var comp = IDE.getBindingComponent();
			this.editor.display(false).del();
			var v = this.editor.element.value;
			this.set(comp, v);
			this.vsRow.valueCell.setTitle(this.get(comp));
			if(!this.vsRow.hasClass('row-mdy'))
				this.vsRow.addClass('row-mdy');
		}
 };
});

var cfg_CBase = {
attr : 
{
	id : new AttributeBase({key:'id'}),	
	title: new AttributeBase({key:'title'})
}
};




(function(){
IDE.registerComponentCfg('CBase',cfg_CBase);

//IDE.registerComponentCfg('CContainerBase',ccontainerbase_cfg);

//
// 增加中间面板主界面
//
IDE.registerPlugin('addComponentFolder', (function(fd){
	fd.root.fromArray([
	{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'},
		{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'},
		{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'},
		{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'},
		{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'},
		{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'},
		{title:'CBase', ComponentClass:CBase},
	{title:'基本容器'}
	]);
}));
})();