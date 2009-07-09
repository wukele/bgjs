		CTemplate['CFoldable'] = '<div class="g-foldable"><div class="g-foldablewrap"><b title="隐藏" id="_trigger" class="icos icoCls"></b><div id="_tle"></div></div></div>';
		CC.create('CFoldable', CBase, {
	    template: 'CFoldable',
	    autoRender : false,
	    clsGroupCS: 'g-gridview-clsview',
	    unselectable : true,
	    initComponent: function() {
	      this.createView();
	      CBase.prototype.initComponent.call(this);
	      this.domEvent('click', this.foldView, true, null, '_trigger')
	          .domEvent('dblclick', this.foldView, true);
	      if(this.array){
	      	this.target.fromArray(this.array);
	      	delete this.array;
	      }
	    },
			
			onRender : function(){
				CBase.prototype.onRender.call(this);
				this.setTitle(this.title);
			},
			
	    foldView: function(b) {
	    	var f = CC.fly(this.foldNode?this.target.dom(this.foldNode):this.target.container || this.target);
	      //
	      // b如果用在domEvent的回调中,就是Event对象!
	      //
	      if (b !== true || b !== false) 
	      	b = !f.display();
	      if(this.fire('expand', this, b) === false){
	      	f.unfly();
	      	return;
	      }
	      f.display(b).unfly();
	      if(this.target.shadow)
					this.target.shadow.reanchor();
	      this.dom('_trigger').title = b ? '隐藏': '展开';
	      b ? this.delClass(this.clsGroupCS) : this.addClass(this.clsGroupCS);
	      this.expanded = b;
	      this.fire('expanded', this, b);
	      return this;
	    },
	    
	    brush : function(v){
	    	if(this.target.children)
	    		return '<strong>'+v+'</strong><span id="_view_span">(<strong><a id="_view_cnt" href="javascript:fGo();">'+this.target.size()+'</a></strong>)</span>';
	    	return v;
	    }
		});