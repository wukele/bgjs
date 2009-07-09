CTemplate['CIFramePanel'] = '<iframe class="g-framepanel" frameBorder="no" scrolling="auto" hideFocus=""></iframe>';
CC.create('CIFramePanel', CPanel, {
	
	template : 'CIFramePanel',
	
	container : undefined,
	
	onRender : function(){
		CPanel.prototype.onRender.call(this);
		var c = this.parentContainer;
		c.on('resized', this.onContainerResize, this);
		this.onContainerResize(false, false, c.wrapper.getWidth(true), c.wrapper.getHeight(true));
		
		//加载页面
		if(this.src){
			try{
				this.wrapper.view.src = this.src;
			}catch(e){
				console.warn(e);
			}
		}
	},
	//
	// 实例化时可重写该方法,以自定义IFRAME宽高.
	//
	onContainerResize : function(a,b,c,d){
		this.setSize(c, d);
	}
}
);