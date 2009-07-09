CTemplate['CShadow'] = '<div class="g-shadow" style="display:none;"><div class="g-shadow-t" id="_t"></div><div class="g-shadow-lt" id="_lt"></div><div class="g-shadow-rt" id="_rt"></div><div class="g-shadow-l" id="_l"></div><div class="g-shadow-lb" id="_lb"></div><div class="g-shadow-r" id="_r"></div><div class="g-shadow-rb" id="_rb"></div><div class="g-shadow-b" id="_b"></div></div>';
CC.create('CShadow', CBase, {
	shadowWidth : 6,
	inpactWidth : 3,
	initComponent : function(){
		//IE6无阴影效果
		if(!CC.ie6){
			this.showTo = document.body;
			
			if(this.target.eventable){
				this.target.on('resized', this.onTargetResize, this);
				this.target.on('reposed', this.onTargetRepos, this);
			}
	  }
		CBase.prototype.initComponent.call(this);
		this.setZ(this.target.getStyle('zIndex')-1);
		this.shadowR = this.dom('_r');
		this.shadowB = this.dom('_b');
		this.shadowL = this.dom('_l');
		this.shadowT = this.dom('_t');
	},
	
	onTargetResize : function(ba, bb, a, b){
		if(a !== false){
			a = a+this.inpactWidth*2;
			if(a!=this.width)
				this.setWidth(a);
		}
		if(b !== false)
			if(b!=this.height)
				this.setHeight(b);
		//修正IE不能同时设置top, bottom的问题,设置具体高度
		if(CC.ie){
			var f = CC.fly(this.shadowR), d = this.shadowWidth*2, h = b - d, w = a - d;
			if(b !== false){
				f.setHeight(h);
				f.view = this.shadowL;
				f.setHeight(h);
			}
			if(a !== false){
				f.view = this.shadowB;
				f.setWidth(w);
				f.view = this.shadowT;
				f.setWidth(w);
		  }
			f.unfly();
	  }
	},
	
	onTargetRepos : function(a, b){
		if(a === false && b === false)
			return;
		var pos = this.target.absoluteXY();
		this.setXY(pos[0]-this.inpactWidth, pos[1]+this.inpactWidth - 1);
	},
	
	reanchor : function(){
		var s = this.target.getSize();
		this.onTargetResize(false, false, s.width, s.height);
		this.onTargetRepos();
	},
	//
	//只有target显示时才显示阴影,否则忽略.
	//
	display : function(b){
		if(b===undefined)
			return CBase.prototype.display.call(this);
		return CBase.prototype.display.call(this, b && this.target.display());
	}
}
);