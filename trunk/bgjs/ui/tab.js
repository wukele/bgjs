
CTemplate['CIconButton'] = '<table unselectable="on" class="g-unsel g-tab-item" title="选卡1"><tbody><tr id="_ctx"><td class="tLe" id="_tLe"></td><td class="bdy"><nobr id="_tle" class="g-tle">选卡1</nobr></td><td class="btn" id="_btnC"><a href="javascript:fGo()" title="关闭" id="_trigger" class="g-ti-btn"></a></td><td class="tRi" id="_tRi"></td></tr></tbody></table>';

CC.create('CTabItem', CSelectedContainer, function(superclass){
	
	function hideDDRBar(){
		Cache.put('CItemDDRBarUp', Cache.get('CItemDDRBarUp').display(false));
	}
	
    return {
        template : 'CIconButton',
        hoverCS:false,
        selectedCS:false,
        closeable:true,
        container:'_ctx',
        ondropable : true,
        draggable : true,        
        blockMode : '',
        
        initComponent : function(){
            superclass.initComponent.call(this);
            var c = this.cacheBtnNode = this.dom('_btnC');
            c.parentNode.removeChild(c);
            if(this.closeable)
            	this._bindCloseEvent();
        },
				
        addButton : function(cfg){
            var td = this.cacheBtnNode.cloneNode(true);
            cfg.view = td;
            cfg.iconNode = '_trigger';
            // apply the basic functionality to this button.
            var td = CBase.create(cfg);
            this.add(td);
            return td;
        },
		
        _addNode : function(node){
            if(this.buttonOrient != 'l')
                this.$$('_tRi').insertBefore(node);
            else this.$$('_tLe').insertAfter(node);
        },

        _closeTriggerFn : function() {
            	this.parentContainer.close(this);
        },
        
        _bindCloseEvent : function() {
            var cls = this.$$('_trigger');
            if(!cls){
                cls = this.addButton({
                    id:'_clsBtn',
                    icon:'g-ti-clsbtn'
                });
            }
            //close event.
            this.domEvent('click', this._closeTriggerFn, true, null, cls.view);
            this.domEvent('dblclick', this._closeTriggerFn, true);
            //不影响父容器mousedown事件.
            cls.view.onmousedown = Event.noUp;
        },
        
				setCloseable : function(b){
				    this.closeable = b;
            CC.fly(this.dom('_clsBtn')).display(b).unfly();
				},
			
				dragStart : function(){
					var g = CGhost.instance;
					g.enableTip=true;
					g.setTitle('Drag \''+this.title.truncate(10)+'\'');
				},
			
				dragSBOver : function(item){
					var b = (item.parentContainer && item.parentContainer == this.parentContainer);
					if(b){
						//显示方位条
						var pxy = this.absoluteXY(), bar = Cache.get('CItemDDRBarUp');
						pxy[0] -= 9;
						pxy[1] -= bar.getHeight(true)-2;
						bar.setXY(pxy).display(true);
						Cache.put('CItemDDRBarUp', bar);
					}
					return b;
			},
			
			SBDrop : function(tar){
				var ct = this.parentContainer;
				ct.insertBefore(tar, this);
				ct.select(tar);
			},
			
			dragSBOut : hideDDRBar,
			
			afterDrop : hideDDRBar
    };
});

CTemplate['CTab'] = '<div class="g-panel g-tab"><div class="g-panel-wrap g-tab-wrap" id="_wrap" tabindex="1" hidefocus="on"></div></div>';

CC.create('CTab', CSelectedPanel, function(superclass){
    return {

        itemWidth : false,

        navKeyEvent : true,
        
				template : 'CTab',
				
        KEY_UP : Event.KEY_LEFT,
	
        KEY_DOWN : Event.KEY_RIGHT,
	
        ItemClass : CTabItem,
	
			  /**
				 * 关闭指定CTabItem,当只有一个CTabItem时忽略.
				 */
        close : function(item) {
            item = this.$(item);
            if(!item.closeable || this.getDisc()==1)
                return;
            if(this.fire('close',item)===false)
                return false;
            this.displayItem(item, 0);
            this.fire('closed',item);
        },
	
        //@override
        add : function(it) {
            if(superclass.add.call(this,it)===false)
                return false;
            //
            if(it.panel)
            	CC.fly(it.panel).display(false).unfly();
             
            if(this.itemWidth)
            	it.setWidth(this.itemWidth);
            //this._ajust();
        },
  
        _ajust: fGo,
  
        //是否显示指定的TabItem,
        //参数a可为TabItem实例也可为TabItem的id,b为true或false.
        displayItem: function(a, b) {
            a = this. $(a);
            //Cann't change this attribute.
            if (!a.closeable && !b) {
                return false;
            }

            var isv = a.display();

            if (isv != b) {
                this._ajust();
            }
		
            superclass.displayItem.call(this,a,b);
    
            //切换下一个CTabItem
            if (!b && this.selected == a) {
                var idx = this.indexOf(a);
                var tmp = idx - 1;
                var chs = this.children;
                while (tmp >= 0 && !chs[tmp].display()) {
                    tmp--;
                }
                if (tmp >= 0) {
                    this.select(chs[tmp]); return ;
                }

                tmp = chs.length; idx += 1;
                while (idx < tmp && !chs[idx].display()) {
                    idx++;
                }
                if (idx < tmp) {
                    this.select(chs[idx]);
                }
            }
        }
        ,

        //选择某个TabItem,
        //参数a可为TabItem实例也可为id.
        //b为强制选择
        select: function(a,b) {
            if(superclass.select.call(this,a,b)===false)
                return false;
            a = this.$(a);
            var pre = this.previousSelected, ch, p;
            for(var i=0,len=this.size();i<len;i++){
                var ch = this.children[i];
                if(ch != a && ch.panel){
                	p = CC.fly(ch.panel);
                	if(p.display())
                		p.display(false);
                	p.unfly();
                }
            }
            
            if(!a)
                return;
            a.show();
            if(a.panel)
            	CC.fly(a.panel).display(true).unfly();
        }
        ,

        //返回显示的TabItem个数.
        getDisc: function() {
            var cnt = 0; var chs = this.children;
            for (var i = 0, len = chs.length; i < len; i++) {
                if (chs[i].display()) {
                    cnt++;
                }
            }
            return cnt;
        }
    };
});