CC.create('CSpliter', CBase, function(superclass){
	return {
		maxLR : Math.MAX_VALUE,
		minLR : Math.MIN_VALUE,
		maxTB : Math.MAX_VALUE,
		minTB : Math.MIN_VALUE,
		autoRestrict : true,
		draggable : true,
		container : null,
		inherentCS : 'g-layout-split',
		ghost : true,
		onSplitStart : fGo,
		onSplit : fGo,
		onSplitEnd : fGo,
		
		initComponent : function(){
			superclass.initComponent.call(this);
			this.appendTo(this.container);
		},
		
		beforeDragStart : function(){
				this.initX = this.left;
				this.initY = this.top;
				if(this.ghost) {
					var sg = this.splitGhost;
					if(!sg){
						sg = this.splitGhost = CC.$$(CC.$C({tagName:'DIV', className:this.ghostCS||'g-layout-sp-ghost'}));
						sg.appendTo(this.container);
					}
					this.copyViewport(sg);
					sg.display(1);
			  }
				this.initSPX = this.left;
				this.initSPY = this.top;
				CGhost.instance.enableTip = false;
				if(!this.disableAutoStrict)
					this.calculateRestrict();
				this.onSplitStart();
		},
		
		calculateRestrict : function(){
				var c = CC.fly(this.container.view || this.container);
				if(!this.disableLR){
					var i = this.getLeft();
					this.minLR = -1*i;
					this.maxLR = c.getWidth() - (i+this.getWidth());
				}
				
				if(!this.disableTB){
					var i = this.getTop();
					this.minTB = -1*i;
					this.maxTB = c.getHeight() - (i+this.getHeight());
				}
				c.unfly();
		},
		
		applyDeltaXY : function(dx, dy){
			var d;
			if(!this.disableTB){
					if(dy < this.minTB)
						dy = this.minTB;
					else if(dy > this.maxTB)
						dy = this.maxTB
					d = this.initSPY+dy;
					if(this.ghost)
						this.splitGhost.setTop(d);
					else if(this.syncView)
					this.setTop(d);
					this.splitDY = dy;
			}
				
			if(!this.disableLR){
					if(dx < this.minLR)
						dx = this.minLR;
					else if(dx > this.maxLR)
						dx = this.maxLR;
					
					d = this.initSPX+dx;
					if(this.ghost)
					 this.splitGhost.setLeft(d);
					else if(this.syncView)
						this.setLeft(d);
					this.splitDX = dx;
			}
		},
		
		drag : function(ev){
				this.applyDeltaXY(CGhost.instance.MDX, CGhost.instance.MDY);
				this.onSplit();
		},
		
		afterDrop : function(){
				if(this.ghost)
					this.splitGhost.display(0);
					var t1 = this.ghost, t2 = this.syncView;
					this.ghost = false;
					this.syncView = true;
					this.applyDeltaXY(CGhost.instance.MDX, CGhost.instance.MDY);
					this.ghost = t1;
					this.syncView = t2;
					this.onSplitEnd();
				if(this.splitGhost){
					this.splitGhost.destoryComponent();
					delete this.splitGhost;
				}
	  }
	};
});