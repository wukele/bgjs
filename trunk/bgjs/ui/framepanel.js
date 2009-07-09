CTemplate['CIFramePanel'] = '<iframe class="g-framepanel" frameBorder="no" scrolling="auto" hideFocus=""></iframe>';
CC.create('CIFramePanel', CPanel, {
	
	template : 'CIFramePanel',
	
	container : undefined,
	
	onRender : function(){
		CPanel.prototype.onRender.call(this);
		var c = this.parentContainer;
		c.on('resized', this.onContainerResize, this);
		this.onContainerResize(false, false, c.wrapper.getWidth(true), c.wrapper.getHeight(true));
		
		//����ҳ��
		if(this.src){
			try{
				this.wrapper.view.src = this.src;
			}catch(e){
				console.warn(e);
			}
		}
	},
	//
	// ʵ����ʱ����д�÷���,���Զ���IFRAME���.
	//
	onContainerResize : function(a,b,c,d){
		this.setSize(c, d);
	}
}
);