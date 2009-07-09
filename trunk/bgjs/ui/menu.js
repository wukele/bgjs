CTemplate['CMenu'] = '<div class="g-panel g-menu"><div id="_wrap" class="g-panel-wrap"><ul class="g-menu-opt" id="_bdy"  tabindex="1" hidefocus="on"></ul></div></div>';
CTemplate['CMenuItem'] = '<li class="g-menu-item"><span id="_tle" class="item-title"></span></li>';

CC.create('CMenuItem', CItem, function(superclass){
return {
  //子菜单
  subMenu: null,
	
	autoRender : false,
	
	hoverCS : 'itemOn',
	
	template : 'CMenuItem',
	
	subCS : 'sub-x',
	
	initComponent : function(){
		superclass.initComponent.call(this);
		if(this.array){
	  	var sub = new CMenu({array:this.array, showTo:document.body});
	  	this.bindMenu(sub);
	  	delete this.array;
	  }
	},
	
	bindMenu : function(menu){
    menu.parentItem = this;
    this.subMenu = menu;
    this.addClass(this.subCS);
	},
	
	unbindMenu : function(){
		if(this.subMenu){
			var menu = this.subMenu;
			delete menu.parentItem;
			delete this.subMenu;
			this.delClass(this.subCS);
		}
	},
	
	mouseoverCallback : function(ev){
		    var pc = this.parentContainer;
		    if(!pc.autoPopup){
		      	pc._onItem = this;
		      	return;
		      }
		
					//OnMouseOver
		      //隐藏上一菜单项的子菜单
		      if(pc._onItem!=this)
		      	pc._hidePre(); 
		      if (this.subMenu) 
		        this.subMenu.show(1);
		      
		      pc._onItem = this;
	},
	
	mouseoutCallback : function(){
		//if currently the submenu is in view.
		if (this.subMenu && this.subMenu.display())
			return true;
	},
	
	onRender : function() {
		superclass.onRender.call(this);
		if(this.subMenu){
			if(!this.subMenu.rendered)
				this.subMenu.render();
		}
	},
	
	destoryComponent : function(){
		if(this.subMenu){
			this.subMenu.destoryComponent();
			this.unbindMenu();
		}
		superclass.destoryComponent.call(this);
	}
	};
});

//--菜单控件
//默认添加在document.body中
CC.create('CMenu', CSelectedPanel, function(superclass) {
return {
  //父菜单项
  parentItem: null,
	
	//如果该项是一个MenuBar,设为true.
	noContext : false,
	
	autoPopup : true,
	
  //上一掠过菜单项
  _onItem: null,
	
  selectedCS : 'itemOn',
  
	ItemClass : CMenuItem,
	
	container : '_bdy',
	
	itemXCS : 'g-menu-item-x',
	
	separatorCS : 'g-menu-separator',
	
  initComponent: function() {
  	
  	if(!this.noContext){
  		this.shadow = true;
  		this.hidden = true;
    }
    superclass.initComponent.call(this);
    if(this.array){
    	this.fromArray(this.array);
    	delete this.array;
    }
    //撤消菜单内的onclick事件上传
    //默认为不显示
    this.noUp();
  }
	,
  //把子菜单menu添加到tar项上,tar可为一个index,或一个CMenuItem对象,还可为CMenuItem的id
  //附加子菜单时要按从最先至最后附加,这样事件才会被父菜单接收
  attach: function(menu, tar) {
    tar = this.$(tar); 
		tar.bindMenu(menu);
    if(this.align == 'x')
    	tar.delClass(tar.subCS);
  }
  ,
	
	add : function(item){
		if(item.isSeparator){
			this.addSeparator();
			return this;
		}
		
		superclass.add.call(this,item);

		if(this.align == 'x'){
			item.addClass(this.itemXCS);
			item.align=this.align;
		}
		
		if(item.subMenu && this.align == 'x')
			item.delClass(item.subCS);
		return this;
	},
	
  //撤消菜单项上的子菜单
  detach: function(tar) {
    tar = this.$(tar);
    tar.unbindMenu();
    if(this.align == 'x'){
			tar.delClass(this.itemXCS);
			tar.align=false;
    }
  }
  ,
	
	select : function(item){
		item = this.$(item);
    if(superclass.select.call(this,item, true)===false)
    	return false;
    	
    if (item.subMenu) {
      if(this.noContext)
	     	this.autoPopup = !this.autoPopup;
			item.subMenu.show(this.autoPopup);
			if(this.noContext && !this.contexted)
        	this._makeContexted();
      
    	return;
    }
    
    //无子菜单
		this.hideAll();
	},
	
  //显示/隐藏菜单,当点击菜单外时菜单并不用消失.
  show: function(b) {
    if (b)
      this._autoPositioned();

    if (!b) {
      CC.each(this.children, (function(i, e) {
        if (this.subMenu) {
          if (this.subMenu.display()) {
            this.subMenu.show(0);
          }
        }
      }
      ));
    }
    this.display(b);
  }
  ,
	
	addSeparator : function(){
		this._addNode(CMenu.Separator.view.cloneNode(true));
	},
	
	_makeContexted : function(){
		if(this.contexted) {
			return;
		}
    var oThis = this;
    if(!this._onCtxClick) {
	    var onClick = (function() {
	      if (oThis.display()) {
	        oThis.hideAll();
	      }
	      oThis.contexted = 0;
	      Event.removeListener(document, 'click', onClick);
	    }
	    );
	    
	    this._onCtxClick = onClick;
  	}
    Event.addListener(document, 'click', this._onCtxClick);
    this.contexted = 1;
	},
	
  //显示界面菜单,与show不同,该方法在指定处显示菜单，并且当点击菜单范围外时自动消失.
  //showMenu(obj,'bottom')或showMenu(120,230)
  showMenu: function(a, b) {
  	
  		if(!this.rendered)
  			this.render();
  			
  		this._makeContexted();
	    
	    if (!CC.isNumber(a)) {
	    	CC.addClass(a, 'menuDwn');
	    	this._trigger = a;
	      var off = Position.cumulativeOffset(a); 
	      switch (b) {
	        case 'right':
	        off[0] += a.offsetWidth; break;
	        default:
	          off[1] += a.offsetHeight; break;
	      }
	      this.setXY(off[0], off[1]);
	    } else {
	      this.setXY(a, b);
	    }
    this.show(true);
  }
  ,

  //隐藏与该菜单相联的所有菜单(包括子菜单和父菜单).
  hideAll: function() {
  	if(this._trigger) {
  		CC.delClass(this._trigger, 'menuDwn');
  		this._trigger = null;
  	}
  	
  	if(!this.noContext){
    	this.display(false);
    }

    if(this.autoPopup && this.noContext){
    		this.autoPopup = false;
    }
    	
    if (this._onItem) {
      this._onItem.delClass(this._onItem.hoverCS);
    }

    CC.each(this.children, (function(i, e) {
      if (this.subMenu) {
        if (this.subMenu.display()) {
          this.subMenu.hideAll();
        }
      }
    }
    )); 
    if (this.parentItem) {
      if (this.parentItem.parentContainer.display()) {
        this.parentItem.parentContainer.hideAll();
      }
    }
  }
  ,

  //在适当位置显示菜单.
  _autoPositioned: function() {
    if (this.parentItem) {
      var off = this.parentItem.absoluteXY();
      if(this.parentItem.align=='x'){
      	this.setXY(off[0], off[1]+this.parentItem.view.offsetHeight);
      }
      else{
     		this.setXY(off[0] + this.parentItem.view.offsetWidth - 2, off[1]);
    	}
    }
  }
  ,

  _hidePre: function() {
    if (this._onItem) {
      var pre = this._onItem; 
      var cs = this.selectedCS;
      if(cs)
      	pre.delClass(cs);
      if (pre.subMenu) {
        pre.subMenu.show(false);
      }
    }
  }
};
});

CMenu.Separator = CC.$$(CC.$C({tagName:'LI', className:CMenu.prototype.separatorCS}));
CMenu.Separator.isSeparator = true;