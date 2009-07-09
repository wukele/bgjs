//Default Framework Plugins

//Tab Plugins
IDE.registerPlugin('addNorthPanel', (function(northPanel){
		this.tab = new CTab({cs:'fr-tab'});
		northPanel.add(this.tab);
		this.fire('addTab', this.tab);
}));

//Left Folder UI Plugins
IDE.registerPlugin('addWestPanel', (function(westPanel){
	  var G = CGhost.instance, anchorbox = CUtil.getAnchorBox();
	  var ComponentTreeItem = CC.create(CTreeItem, {
	  	draggable:true,
	  	type : 'ComponentTreeItem',
	  	icon:'iconEdit',
	  	dragStart : function(){
	  		G.enableTip = true;
	  		G.setTitle(this.title);
	  		G.setIcon(this.icon);
	  	},
	  	
	  	beforeDragStart : function(){
	  		anchorbox.beforeVsCompDragStart(this);
	  	},
	  	
			/**
			 * 拖曳控件位于设计控件中的上空时通过anchorBox
			 */
			dragOverSB : function(c, evt){
				if(!c.__vsComp)
					return false;
				return anchorbox.dragVsCompOver(this, c, evt);
			},
		
			dragOutSB : function(c, evt){
			  if(!c.__vsComp || c != anchorbox)
					return;
				anchorbox.dragVsCompOut(this, c, evt);
			},
			
			drag : function(){
				anchorbox.dragVsComp(this);
			},
			
			dropSB : function(sb, evt){
				anchorbox.dropVsComp(this, sb, evt);
			},
			
	    afterDrop:function(evt){
	    	anchorbox.afterDropVsComp(this, evt);
	    }
    
	  });
	  
	  
	  function _btnFNOnclick(){
	  	var v = this.wrapper.display();
      this.fold(v);
      if(this.folded){
      	this._beforeFoldHeight = this.getHeight(true);
      	this.setHeight(26);
      }else {
      	this.setHeight(this._beforeFoldHeight);
      }
      this.parentContainer.doLayout();
	  };
	  
	  ComponentTreeItem.prototype.ItemClass = ComponentTreeItem;
		
		this.folderPanel = new CTitlePanel({title:'所有组件', height:265, _btnFNOnclick:_btnFNOnclick});
		this.componentFolder = new CTree({title:'Viewport', scrollor:this.folderPanel.scrollor});
		
		this.componentFolder.root.ItemClass = ComponentTreeItem;
		
		this.folderPanel.add(this.componentFolder);
		westPanel.add(this.folderPanel,{dir:'north', split:true,gap:2});
		this.fire('addComponentFolder', this.componentFolder);
		
		this.checkerPanel = new CTitlePanel({title:'检查器',_btnFNOnclick:_btnFNOnclick});
		this.componentChecker = new CTree({title:'检查器', scrollor:this.checkerPanel.scrollor});
		this.checkerPanel.add(this.componentChecker);
		this.westPanel.add(this.checkerPanel, 'center');
		this.fire('addComponentChecker', this.componentChecker);
}));


IDE.registerPlugin('addEastPanel',(function(eastPanel){
	var g = this.propertyGrid = IDE.getPropertyGrid();
	eastPanel.add(g);
	
	function updateComponentAttributes(comp){
		var prevs = this.preanchorComp,
		    vs = IDE.getComponentPropertyViews(comp),
		    i,v;
		if(prevs){
			prevs= IDE.getComponentPropertyViews(prevs);
			// hide previous attr views
			for(i=prevs.length-1;i>=0;i--){
				prevs[i].hide();
			}
	  }
	  g.bindingComponent = comp;
		//show current component attr views.
		for(i=vs.length-1;i>=0;i--){
			v = vs[i];
			v.show();
			v.applyComponent(comp);
	  }
	}
	
	this.anchorBox.on('boxanchored',updateComponentAttributes);
}));

//增加一个插件,主要功能是增加各TAB ITEM显示IFRAME
//IFRAME src在tabitem中设置
IDE.registerPlugin('addTab', (function(tab) {
    var fr = this;
}));


//
// 增加其它项控件
//
IDE.registerPlugin('rendered', (function(){
	
}));

//
// 增加中间面板主界面
//
IDE.registerPlugin('rendered', (function(){
}));