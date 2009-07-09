CC.extendIf(String.prototype, {
	upperFirst : function(){
		if(this.length == 0)
			return '';
		if(this.length == 1)
			return this.toUpperCase();
			
		return this.charAt(0).toUpperCase()+this.substr(1);
	},
	escapeQuote : function(q){
		return this.replace('\\','\\\\'+q).replace(q,'\\'+q);
	}
});

/**
 * 修改CBase某些方法,使得适应可视开发,
 * 该文件紧随bglib.js后运行
 */
window.g_mode = false;

/**
 * 调用该方法后新创建的控件将忽略所有注册的事件.
 */
CUtil.startMode = function(){
	g_mode = true;
};

CUtil.endMode = function(){
	g_mode = false;
};


(function(cb, cu){
 var oriDomEvent = cb.domEvent;
 
 cb.domEvent = function(){
 	//如果为可视化开发控件,忽略所有注册事件
 	if(g_mode)
 		return this;
 	return oriDomEvent.apply(this, arguments);
 };
 
 var oriUnDomEvent = cb.unDomEvent;
 cb.unDomEvent = function(){
 	//如果为可视化开发控件,忽略所有注册事件
 	if(g_mode)
 		return this;
 	return oriUnDomEvent.apply(this, arguments);
 };
 
 //
 // 所有可视化控件点击后定位框框
 //
 function bindResizeBoxOnclick(){
 	//因为此时并未创建AnchorBox,所以在运行时调用获得AnchorBox
 	cu.getAnchorBox().anchorTo(this);
 };


 var oriOnRender = cb.onRender;
 cb.onRender = function(){
 	oriOnRender.apply(this, arguments);
 	if(g_mode){
 	  oriDomEvent.call(this, 'click', bindResizeBoxOnclick, true);
 	  //标记作为vs控件
 	  this.__vsComp = true;
 	  //
 	  //如果为容器控件,监听Drop动作
 	  if(this.children){
 	  	cu.endMode();
 	  	this.enableDropBehavior(true);
 	  	//重置,原来的失效
 	  	this.dragSBOver = fGo;
 	  	this.dragSBOut = fGo;
 	  	cu.startMode();
 	  }
 	}
 };
 
 var orIDEstory = cb.destoryComponent;
 cb.destoryComponent = function(){
 	if(this.__vsComp){
 	   oriUnDomEvent.call(this, 'click', bindResizeBoxOnclick);
 	   if(this.children)
 	   	this.enableDropBehavior(false);
 	}
 	orIDEstory.apply(this, arguments);
 };
})(CBase.prototype, CUtil);