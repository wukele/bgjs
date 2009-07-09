//定义控件模板
CTemplate['CXResizer'] = '<div class="g-panel g-xresizer"><div class="g-res-e" id="_xme"></div><div class="g-res-s" id="_xms"></div><div class="g-res-w" id="_xmw"></div><div class="g-res-n" id="_xmn"></div><div class="g-res-sw" id="_xsw"></div><div class="g-res-es" id="_xes"></div><div class="g-res-wn" id="_xwn"></div><div class="g-res-ne" id="_xne"></div><div class="g-res-wc" id="_xw"></div><div class="g-res-ec" id="_xe"></div><div class="g-res-nc" id="_xn"></div><div class="g-res-sc" id="_xs"></div></div>';
/**
 *
 */
CC.create('CXResizer', CResizer ,(function(superclass){
    return {
    	
    	template :'CXResizer',
    	
    	//当宽/高超过该数值时,隐藏中间滑片
    	minHideSliperWidth:40,
    	
    	initComponent:function(){
    		superclass.initComponent.call(this);
    		this.on('resized',this.onResized);
    		this._bindMoveAction();
    	},
    	
    	//容器位置不受父类影响
    	getWrapperInsets:CPanel.prototype.getWrapperInsets,
    	
    	//这里绑定四条边框,使得可移动
    	_bindMoveAction : function(){
    		//id, drag, ini, end
    		this._bindTriggerAction('_xme', this.movSpliterDrag, this.movSpliterDragStart, this.movSpliterDropSB);
    		this._bindTriggerAction('_xms', this.movSpliterDrag, this.movSpliterDragStart, this.movSpliterDropSB);
    		this._bindTriggerAction('_xmn', this.movSpliterDrag, this.movSpliterDragStart, this.movSpliterDropSB);
    		this._bindTriggerAction('_xmw', this.movSpliterDrag, this.movSpliterDragStart, this.movSpliterDropSB);
    	},
    	
    	onResized : function(a, b){
    		//如果宽度超过一定,隐藏中间滑片
    		if(a !== false){
    			if(a<this.minHideSliperWidth){
    				this.fly('_xn').display(false).unfly();
    				this.fly('_xs').display(false).unfly();
    			}else{
    				this.fly('_xn').display(true).unfly();
    				this.fly('_xs').display(true).unfly();
    			}
    		}
    		if(b !== false){
    			if(b<this.minHideSliperWidth){
    				this.fly('_xe').display(false).unfly();
    				this.fly('_xw').display(false).unfly();
    			}else{
    				this.fly('_xe').display(true).unfly();
    				this.fly('_xw').display(true).unfly();
    			}
    		}
    	},
    	
		  movSpliterDragStart: function() {
		        var c = this.parentContainer;
		        if(c.unmoveable)
		        	return false;
		        CGhost.instance.enableTip = false;
		        if (c.fire('movestart') === false) return false;
		        if (c.shadow) c.shadow.hide();
		        c.setOpacity(0.6);
		        c.initPos = c.xy();
		    },
		   
		  movSpliterDrag: function() {
		        var G = CGhost.instance,
		        c = this.parentContainer;
		        CBase.prototype.setXY.call(c, c.initPos[0] + G.MDX, c.initPos[1] + G.MDY);
		  },
		  
		  movSpliterDropSB: function() {
		        var c = this.parentContainer;
		        if (c.fire('moveend') === false) {
		            c.setXY(c.initPos);
		            return false;
		        }
		        //update x,y
		        var G = CGhost.instance;
		        c.left = c.top = false;
		        c.setXY(c.initPos[0] + G.MDX, c.initPos[1] + G.MDY);
		        c.setOpacity(1);
		        if (c.shadow) c.shadow.show();
		        delete c.initPos;
		  }
    };
}));