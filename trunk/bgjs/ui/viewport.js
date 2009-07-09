CC.create('CViewport', CPanel, {
	
	template:'DIV',
	
	bodyCS : 'g-viewport-body',
	
	cs : 'g-viewoport',
	
	initComponent : function(){
		
		this.showTo = document.body;
		
		if(!this.view)
			this.view = CC.$C('DIV');
		Event.addListener(window, 'resize', this.onWindowResize.bind(this));
		CPanel.prototype.initComponent.call(this);
		CC.$body.addClass(this.bodyCS);
		this.onWindowResize();
	},
	
	onWindowResize : function(){
			var vp = CC.getViewport();
			this.setSize(vp);
	}
}
);