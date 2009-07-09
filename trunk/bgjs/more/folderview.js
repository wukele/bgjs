		CC.create('CFolderView', CSelectedContainer, function(father){
			CTemplate['CFolderView'] = '<div class="g-folderview"><div class="g-wrap g-folderview-wrap" id="_scrollor"><dl class="g-folderview-ctx" id="_ctx"></dl><div class="g-clear"></div></div></div>';
			CTemplate['CFolderViewItem'] = '<dd><img id="_img" src=""/><div><h4 id="_tle">综合</h4><p id="_desc">Explore the Ext GWT Components and quickly view the source code to see the API in action.</p></div></dd>';
			var CFolderViewItem = CC.create(CBase,{
				template:'CFolderViewItem',
				hoverCS:'g-fd-view-on',
				initComponent : function(){
					CBase.prototype.initComponent.call(this);
					if(this.img){
						this.dom('_img').src = this.img;
						delete this.img;
					}
					if(this.desc){
						this.dom('_desc').innerHTML = this.desc;
						delete this.desc;
					}
				}
			});
			return {
				scrollor:'_scrollor',
				container:'_ctx',
				selectedCS : 'g-fd-view-selected',
				ItemClass : CFolderViewItem,
				initComponent : function(){
					father.initComponent.call(this);
					this.foldable = new CFoldable({target:this, title:this.title});
					this.follow(this.foldable);
					this.scrollor.insertBefore(this.foldable.view, this.scrollor.firstChild);
				}
			};
		});