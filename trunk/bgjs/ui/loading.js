CTemplate['CLoading'] = '<div class="g-loading"><div class="g-loading-indicator"><span id="_tle">加载中,请稍候...</span></div></div>';

CC.create('CLoading', CBase, {
	loadMaskCS:'g-loading-mask',
	//targetLoadCS:false,
	initComponent : function(){
		CBase.prototype.initComponent.call(this);
		if(this.target)
			this.attach(this.target);
	},
	
	attach : function(target){
		this.target = target;
		this.target.
		  on('open',this.whenOpen,this).
		  on('send',this.whenSend,this).
		  on('success',this.whenSuccess,this).
		  on('final',this.whenFinal,this);
	},
	
	whenSend : fGo,
	whenSuccess : function(){this.target.loaded = true;},
	whenOpen : function(){
		this.target.busy = true;
		this.markIndicator();
	},
	
	whenFinal : function(){
  	this.target.busy = false;
  	this.loaded = true;
  	this.stopIndicator();
  	if(this.target.shadow){
  		this.target.shadow.reanchor();
  	}
  },
  
	markIndicator : function(){
		if(this.disabled)
			return;
		if(this.targetLoadCS)
			CC.fly(this.target).addClass(this.targetLoadCS).unfly();
		//应用掩层
		if((!this.mask || !this.mask.tagName) && !this.maskDisabled){
			this.mask = CC.$C({tagName:'DIV', className:this.loadMaskCS});
		}
		if(!this.loadMsgDisabled){
			var f = CC.fly(this.target.scrollor || this.target).append(this.mask);
			//显示标题
			f.append(this).unfly();
		}
	},
	
	stopIndicator : function(){
		if(this.targetLoadCS) 
			CC.fly(this.target).delClass(this.targetLoadCS).unfly();
		if(!this.maskDisabled)
				this.mask.parentNode.removeChild(this.mask);
		if(!this.loadMsgDisabled)
			this.del();
	}
});