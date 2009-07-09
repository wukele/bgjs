CC.create('CPropertyRow', CGridRow, function(superclass){
	return {
		eventable:true,
		
		initComponent:function(){
			superclass.initComponent.call(this);
			var kCol = new CGridCell({title:this.key, tip:this.tip});
			var kVal = new CGridCell({title:this.value});
			//kVal.append(this.editor);
			this.add(kCol).add(kVal);
		},
		
		destoryComponent : function(){
			superclass.destoryComponent.call(this);
			//this.editor.destoryComponent();
		}
	};
});



CC.create('PropertyGrid', CGrid, function(superclass){
	function onSplitEnd(){
		var col = this.parentContainer.header.$(0);
		col.setWidth(col.getWidth(true)+this.splitDX);
	}
	
	return {
		template : 'CGrid',
		separatorCS : 'g-prpty-sp',
		initComponent : function(){
			superclass.initComponent.call(this);
			this.spliter = new CSpliter({container:this.container,parentContainer:this, disableTB:true,onSplitEnd:onSplitEnd});
			this.spliter.addClass(this.separatorCS);
			this.follow(this.spliter);
			this.header.on('colresizeend', this.fixSpliter, this);
			//hide the spliter when collapsed.
			CC.fly(this.container).style('overflow','hidden');
		},
		
		onResized : function(a, b, c, d){
			superclass.onResized.call(this, a, b, c, d);
			this.fixSpliter();
		},
		
		fixSpliter : function(){
			var sp = this.spliter;
			sp.setHeight(this.getHeight());
			sp.setLeft(this.header.children[0].getWidth(true)-Math.floor(sp.getWidth()/2));
		},
		
		onRender : function() {
			superclass.onRender.call(this);
			if(this.hideHeader)
				this.header.display(false);
			this.fixSpliter();
		}
	};
});