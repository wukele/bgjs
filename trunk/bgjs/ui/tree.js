CTemplate['CTree'] = '<div class="g-panel g-tree"><div class="g-panel-wrap"><div class="g-panel-body g-panel-body-noheader" style="over-flow:auto" id="_scrollor"><ul id="_ctx" class="g-tree-nd-ct  g-tree-arrows" tabindex="1" hidefocus="on"></ul></div></div></div>';
CTemplate['CTreeItem'] = '<li class="g-tree-nd"><div class="g-tree-nd-el g-unsel" unselectable="on" id="_head"><span class="g-tree-nd-indent" id="_ident"></span><img class="g-tree-ec-icon g-tree-elbow-minus" id="_elbow" src="'+CTemplate.BLANK_IMG+'"/><img unselectable="on" class="g-tree-nd-icon" src="'+CTemplate.BLANK_IMG+'" id="_ico" /><a href="javascript:fGo()" class="g-tree-nd-anchor" hidefocus="on" id="_tle"></a></div><ul class="g-tree-nd-ct" id="_bdy" style="display:none;" tabindex="1" hidefocus="on"></ul></li>';
CTemplate['CTreeItemSpacer'] = '<img class="g-tree-icon" src="'+CTemplate.BLANK_IMG+'"/>';
/**
 * 树型控件实现
 */
CC.create('CTreeItem', CContainerBase, function(superclass){
return {
	/**
	 *每个CTreeItem都有一个指向根结点的指针以方便访问根结点.
	 */
	root : null,
	
	/**
	 * 指明容器结点为视图中ID结点.
	 */
	container : '_bdy',
	
	/**
	 *@override 设置触发事件的结点ID.
	 */
	dragNode : '_head',
	
	/**
	 * 鼠标掠过时样式.
	 */
	hoverCS : 'g-tree-nd-over g-tree-ec-over',
	splitEndPlusCS : 'g-tree-split-end-plus',
	splitEndMinCS : 'g-tree-split-end-minus',
	splitPlusCS : 'g-tree-split-plus',
	splitMinCS :'g-tree-split-minus',
	splitCS : 'g-tree-split',
	splitEndCS : 'g-tree-split-end',
	nodeOpenCS : 'g-tree-nd-opn',
	nodeClsCS : 'g-tree-nd-cls',
	nodeLeafCS : 'g-tree-nd-leaf',
	loadCS:'g-tree-nd-loading',
	/**
	 * 空占位结点样式.
	 */
	elbowLineCS :'g-tree-elbow-line',
	
	springCS : 'spring',
	/**
	 * 鼠标掠过时添加样式的触发结点id
	 *@see CBase#bindAlternateStyle
	 */
	mouseoverNode : '_head',
	
	/**
	 * 鼠标掠过时添加样式目标结点id.
	 */
	mouseoverTarget : '_head',
	
	//树结点是否为目录,默认false.
	nodes : false,
	
	//监视子项点击
	itemClickEvent : 'mousedown',
	
	itemClickEventNode : '_head',
	
	template : 'CTreeItem',
	
	ItemClass : 'CTreeItem',
	
	initComponent : function(opt) {
		//
		if(!this.root)
			this.root = this;
		if(this.array && !this.nodes)
			this.nodes = true;
		
		superclass.initComponent.call(this);
		this._ident = this.$$('_ident');
		this._elbow = this.$$('_elbow');
		this._head  = this.$$('_head');
		
		//文件夹
		if(this.nodes) {
			this.domEvent('dblclick', this.expand, true, null, this._head.view);
			this.domEvent('mousedown', this.expand, true, null, this._elbow.view, false);
		}
		else
			this._head.addClass(this.nodeLeafCS);
		
		this._attachElbowStyle(false);
	},
	
	addIcon : function(icon, cfg){
		var cn = CTemplate.$('CTreeItemSpacer');
		if(cfg)
			CC.extend(cn, cfg);
		CC.fly(cn).addClass(icon).unfly();
		this.fly(this.titleNode).insertBefore(cn).unfly();
		return this;
	},
	
	addSpring : function(spring){
		if(spring.view)
			this.follow(spring);
		this.fly(this.titleNode).insertBefore(spring).unfly();
		CC.fly(spring).addClass(this.springCS).unfly();
	},
	
	expand : function(b) {
		if(b !== true && b !== false)
			b = !CC.display(this.container);
		if(this.root.tree.fire('expand',this,b)===false)
			return false;
    this._attachElbowStyle(b);
    
		CC.display(this.container,b);
	  this.expanded = b;
	  
		if(this.root.tree.fire('expanded',this,b)===false)
				return false;
	},
	
	_attachElbowStyle : function(b) {
		if(arguments.length==0)
			b = CC.display(this.container);
			
		var p = this.parentContainer;
		var last = (!p) || (p.container.lastChild == this.view);
		var en = this._elbow, 
		    sepcs = this.splitEndPlusCS, 
		    semcs = this.splitEndMinCS,
		    spcs = this.splitPlusCS,
		    smcs = this.splitMinCS;

    if(this.nodes){
			if(!last) {
	    		if(en.hasClass(sepcs))
	    			en.delClass(sepcs);
	    		else if(en.hasClass(semcs))
	    			en.delClass(semcs);
			}else {
	    		if(en.hasClass(spcs))
	    			en.delClass(spcs);
	    		else if(en.hasClass( smcs))
	    			en.delClass(smcs);
			}
	    if (b) {
	    	if(!last)
	    		en.switchClass(spcs, smcs);
	      else 
	      	en.switchClass(sepcs, semcs);
	      this._head.switchClass(this.nodeClsCS, this.nodeOpenCS);
	      
	    } else {
	    	if(!last)
	    		 en.switchClass(smcs, spcs);
	    	else
	    		en.switchClass(semcs, sepcs);
	      this._head.switchClass(this.nodeOpenCS, this.nodeClsCS);
	    }
	    return;
		}
	  //leaf
    (last) ? 
    	en.switchClass(this.splitCS, this.splitEndCS) :
    	en.switchClass(this.splitEndCS, this.splitCS);
	},
	
	add : function(item) {
		var pre = this.children[this.children.length-1];
		superclass.add.call(this, item);
		item._applyChange(this);
		if(pre)
			pre._attachElbowStyle();
		item._attachElbowStyle();
	},
	/**
	 * 该结点发生变动时重组
	 */
	_applyChange : function(parentNode) {
		//所有事件由据结点的事件监听者接收
		this._applyRoot(parentNode.root);
		this._applySibling();
		this._fixSpacer(parentNode);
		if(this.nodes) {
			CC.addClass(this._ident.view.lastChild,parentNode.elbowLineCS);
		}
	},
	
	fromArray : function(array, itemclass, itemoptions){
		superclass.fromArray.call(this, array, itemclass || this.root.ItemClass, itemoptions || this.itemOptions || this.root.itemOptions);
	},
	
	_applyRoot : function(root){
		if(this.root == root)
			return;
		this.root = root;
		if(this.nodes){
			var chs = this.children;
			for(var k=chs.length - 1;k>=0;k--){
				if(chs[k].nodes)
					chs[k]._applyRoot(root);
				else chs[k].root = root;
			}
		}
	},
	
  _applySibling : function(detach){
  	if(detach){
  		if(this.previousSibling)
				this.previousSibling.nextSibling = this.nextSibling;
			
			if(this.nextSibling)
				this.nextSibling.previousSibling = this.previousSibling;
			
		  this.nextSibling = this.previousSibling = null;
		  return;
  	}
  	
  	var ct = this.parentContainer;
  	if(!ct){
  		this.previousSibling = this.nextSibling = null;
  		return;
  	}
  	c = ct.children, idx = c.indexOf(this);
		this.nextSibling = c[idx+1];
		if(this.nextSibling)
			this.nextSibling.previousSibling = this;
		this.previousSibling = c[idx-1];
		if(this.previousSibling)
			this.previousSibling.nextSibling = this;
  },
  
    //子项点击事件回调,发送itemclick事件.
   _itemClickTrigger : function(event){
   		 //if(Event.element(event) != this._elbow.view)
       	 this.root.tree.fire('itemclick', this, event);
   },
    
	remove : function(item) {
		var item = this.$(item);
		var last = this.children[this.children.length-1] == item;
		item._applySibling(true);
		superclass.remove.call(this, item);
		
		//如果删除当前选择项,重设选择为空.
		if(item == this.root.tree.selected)
			this.root.tree.select(null);
		
		if(last)
			if(this.size()>0)
				this.children[this.children.length-1]._attachElbowStyle();
		return this;
	},
	
	/**
	 * 只有在渲染时才能确定根结点
	 */
	onRender : function(){
		this.root = this.parentContainer.root;
		this._applySibling();
		superclass.onRender.call(this);
	},
	
	insert : function(idx, item){
		superclass.insert.call(this, idx, item);
		item._applyChange(this);
		item._attachElbowStyle();
	},
	
	getSpacerHtml : function() {
		if(this.root == this)
			return CTemplate['CTreeItemSpacer'];
		return this._ident.view.innerHTML + CTemplate['CTreeItemSpacer'];
	},
	
	_fixSpacer : function(parentNode) {
		this._ident.view.innerHTML = parentNode.getSpacerHtml();
		if(this.nodes){
			for(var i=0,len=this.size();i<len;i++) {
				this.children[i]._fixSpacer(this);
			}
		}
	}
};
});

CC.create('CTree', CSelectedContainer, function(superclass){
	
	return {
		
	container : '_ctx',

	parentParamName : 'pid',
	
	scrollor:'_scrollor',
	
	navKeyEvent : true,
	
	selectedCS : 'g-tree-selected',
 
	_itemClickTrigger : CTreeItem.prototype._itemClickTrigger,
	
	/**
	 * 项的选择事件触发结点为视图中指向的id结点.
	 */
	itemClickEventNode : '_head',
	
	selectedCSTarget : '_head',
	
	itemClickEvent : true,
	
	initComponent : function() {
		
		superclass.initComponent.call(this);
		
		if(!this.root) {
			opt = {nodes:true, draggable:false, ItemClass:CTreeItem};
			this.root = new CTreeItem(opt);
		}
		this.root.tree = this;
		this.root.setTitle(this.title);
		var self = this;
		this.add(this.root);
		this.on('expand', this.onExpand, this);
	},
	
	//自动加载功能
	onExpand : function(item, b) {
		//
		// 如果结点已经加载,忽略.
		//
		if(!this.autoConnect  || !b || item.busy || item.loaded){
			return;
		}
		
		var url = this.url;
		if(url){
			url+='&'+this.parentParamName+'='+item.id;
			if(!item.loadIndicator){
				//自定Loading标识
				item.getLoadIndicator({markIndicator:this.onItemMarkIndicator, stopIndicator:this.onItemStopIndicator});
			}
			item.connect(url);
			return (item.children.length>0);
	  }
	},
	
	onItemMarkIndicator : function(){
		//此时的this为loading indicator.
		this.target._head.addClass(this.target.loadCS);
	},
	
	onItemStopIndicator : function(){
		//此时的this为loading indicator.
		this.target._head.delClass(this.target.loadCS);
		this.target.expand(true);
	},

	findChildDeep : function(childId){
	  if(this.id == childId)
	  	return this;
	    
	  if(!this.nodes)
	     return false;
	  
	  var chs = this.children, fnd, ch;
	  for(var i=0,len = chs.length;i<len;i++){
	  	ch = chs[i];
	  	if(ch.id = childId)
	    	return ch;
	    if(ch.nodes){
	    	fnd = ch.findChildDeep(childId);
		    if(fnd)
		    	return fnd;
	    }
		}
	},
	
	//@override
	$ : function(a){
		return a;
	},
	/**
	 * 按键导航
	 */
  selectNext : function(t){
  	var s = this.selected;
  	if(!s){
   		this.select(this.root);
    	return this.root;
    }
		var n = s, dir = 1;
	
    while(true){
    	if(dir && n.nodes && n.expanded && n.children.length>0){
    	  	//向下
    	  	n = n.children[0];
    	}
    	else {
	    	if(!n.nextSibling){
	    		  //上溯到顶
	    			if(n == this.root)
	    				return null;
	    				
	    	    dir = 0;
		    		n = n.parentContainer;
	    			continue;
	    	}
	    	
	      n = n.nextSibling;
	    }
	    
	    if(!n.display() || n.disabled)
	    	 continue;
	    else break;
    }
    
    this.select(n);

    return null;
  },
  
  selectPre  : function(item){
  	var s = this.selected;
  	if(!s){
   		this.select(this.root);
    	return;
    }
    var n = s.previousSibling;
    while((!n || !n.display() || n.disabled || (n.nodes && n.expanded && n.children.length>0)) && n != this.root){
    	if(!n){
    			if(s == this.root)
    				return null;
	    		n = s.parentContainer;
	    		break;
    	}
    	else if(n.nodes && !n.disabled && n.display()){
    		n = n.children[n.children.length-1];
    	}else n = n.previousSibling;
    }
    
    if(n!=s)
    	this.select(n);
    return n;
  }
}
});