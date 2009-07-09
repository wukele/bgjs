CTemplate['CGrid'] = '<div class="g-panel g-grid"><table class="g-panel-wrap g-grid-main" id="_wrap"  cellspacing="0" cellpadding="0" style="width:100%; table-layout: fixed;"><tbody><tr><td style="vertical-align: top;" id="_hdctx"></td></tr><tr><td style="vertical-align: top;"><div style="overflow: auto; width: 100%; position: relative; background-color:white;" id="_grid_ctx" class=""></div></td></tr></tbody></table><div class="g-grid-end"></div></div>';

//
// 表格头部每一列
//
CC.create('CColumn', CBase, function(superclass){
	//
	// 隐藏插入条,插入条是在列拖放的时候的插入图标提示
	//
	function hideDDRBar(){
		Cache.put('CItemDDRBarUp', Cache.get('CItemDDRBarUp').display(false));
	}
	
	return {
		inherentCS : 'g-grid-hdcol',
		sortable : true,
		draggable : true,
		ondropable : true,
		initComponent : function(){
			this.view = CC.$C({tagName:'TD'});
			this.view.appendChild(CC.$C({tagName:'DIV', className:'hdrcell', id:'_tle'}));
			superclass.initComponent.call(this);
		},
		//
		// 如果正在列缩放范围,取消拖放.
		//
		beforeDragStart : function(){
			if(this.view.style.cursor == 'col-resize')
				return false;
		},
		
		//
		// 拖放开始,设置提示
		//
		dragStart : function(){
			CGhost.instance.enableTip = true;
			CGhost.instance.setTitle(this.title);
		},
		//
		// 拖放列位于当前列上空时,测试是否允许放下
		//
		dragSBOver : function(col){
			//是否允许放下
			var b = (col.parentContainer && col.parentContainer == this.parentContainer);
			if(b){
				//显示插入条
				var pxy = this.absoluteXY(), bar = Cache.get('CItemDDRBarUp');
				pxy[0] -= 9;
				pxy[1] -= bar.getHeight(true);
				bar.setXY(pxy).display(true);
				Cache.put('CItemDDRBarUp', bar);
			}
			return b;
		},
		
		dragSBOut : hideDDRBar,
		//
		// 拖放列放下时
		//
		SBDrop : function(col){
			var ct = this.parentContainer;
			ct.fire('colswap', this, col, ct.indexOf(this), ct.indexOf(col));
			hideDDRBar();
		},
		
		afterDrop : hideDDRBar,
		
		/**
		 * 设置列宽时,表头会发送colresize事件以通过表格的其它列更新宽度.
		 * 当该列的disabledResize属性为false,设置宽无效.
		 *@override
		 */
		setWidth : function(a){
			if(this.disabledResize)
				return this;
			var delta = a - this.width;
			superclass.setWidth.call(this, a);
			var ct = this.parentContainer;
			if(ct)
				ct.fire('colresize', this, ct.indexOf(this), delta);
			return this;
		},
		
		_setWidth : function(a){
			superclass.setWidth.call(this, a);	
		},
		
    /**
     * 创建该列的比较器,比较器创建后存在属性comparator中,用于两列值比较.
     */
		createComparator : function() {
			var converter = this.converter, self = this;
			if(!converter)
				converter = this.createConverter();
			this.comparator =  (function(a1, a2){
				//mark
				var idx = self.columnIdx;
				var v1 = converter(a1.children[idx]), v2 = converter(a2.children[idx]);
				if(v1 > v2)
					return 1;
				
				if(v1 < v2)
					return -1;
					
				return 0;
			});
		},
		/**
		 * 数据类型转换器,创建后存在属性converter中,用于比较器比较两列值.
		 *@return {Object} 该列的数据类型转换器
		 */
		createConverter : function(){
				var numReg = /[\$,%]/g;
				var datmat = this.dateFormat, cv;
        switch(this.dataType){
            case "":
            case undefined:
                cv = function(v){ 
                	if(v === null || v === undefined)
                		return v;
                	// for item value
                	return v.toString(); 
                };
                break;
                
            case "string":
                cv = function(v){ 
                	return (v === undefined || v === null) ? '' : v.toString(); 
                };
                break;
            case "int":
                cv = function(v){
                    return v !== undefined && v !== null && v !== '' ?
                           parseInt(v.toString().replace(numReg, ""), 10) : '';
                };
                break;
            case "float":
                cv = function(v){
                    return v !== undefined && v !== null && v !== '' ?
                           parseFloat(v.toString().replace(numReg, ""), 10) : ''; 
                    };
                break;
                
            case "bool":
                cv = function(v){ return v === true || v === "true" || v == 1; };
                break;
            case "date":
                cv = function(v){
                    if(!v){
                        return '';
                    }
                    if(CC.isDate(v)){
                        return v;
                    }
                    if(datmat){
                        if(datmat == "timestamp"){
                            return new Date(v*1000);
                        }
                        if(datmat == "time"){
                            return new Date(parseInt(v, 10));
                        }
                        return Date.parseDate(v, datmat);
                    }
                    var parsed = Date.parse(v);
                    return parsed ? new Date(parsed) : null;
                };
             break;
        }
        this.converter = cv;
        return cv;
		},
    /**
     * 排序该列,表头只是发送一个colsort事件表明要对该行进行排序,自己并没什么实际行动,并在排序后发送colsorted事件.
     * 当列排序后,当前排序方式desc或asc保存在属性sortType中,当前排序列保存在父容器的sortedColumn属性中.
     *@param {string} sortType=desc|asc
     */
		sortColumn : function(sortType) {
			if(!this.sortable)
					return this;
			var ct = this.parentContainer, idx = ct.indexOf(this);
			//内部使用,作标记,该标记只在排序期间有效,使得比较器不必每次询问当前列下标值.
			this.columnIdx = idx;
			
			if(ct.fire('colsort', this, idx, sortType) === false)
				return this;
			this.sortType = sortType;
			ct.sortedColumn = this;
			
			ct.fire('colsorted', this, idx, sortType);
			return this;
		}
	};
});

CTemplate['CGridHeader'] = '<div class="g-grid-header"><table  id="_hdtbl" class="g-grid-header-tbl" cellspacing="0" cellpadding="0"><tbody><tr id="_hdColHolder"></tr></tbody></table></tbody></table></div>';

CC.create('CGridHeader', CPanel, function(superclass){
	//类静态成员
	var hdRzA, hdRzB, maxRz, minRz, initMx, initLeft;

	//
	// 如果父容器为自动调整
	//
	
	function onLayout(){
		var ct = this.container;
		var grid = ct.parentContainer;
		if(grid.autoFit){
			ct.hdWidthAnchor.setWidth(ct.getWidth(true));
			var rsl = 0,k=0, hdcs = grid.header.children, i, ch;
			//不能变动的
			for(i=0;i<hdcs.length;i++){
				ch = hdcs[i];
				if(ch.disabledResize || ch.disabled){
					rsl+=ch.getWidth(true);
					continue;
				}
				k++;
			}
			
			var off = parseInt((grid.header.getWidth(true) - rsl)/k);
			
			for(i=0;i<hdcs.length;i++){
				ch = hdcs[i];
				if(ch.disabledResize || ch.disabled){
					continue;
				}
				ch._setWidth(off);
			}
		}
		//初始时列自动宽度
		else if(ct.hdWidthAnchor.width === false){
			var f = ct.hdWidthAnchor;
			ct.addClass(ct.autoWidthCS);
			f.setWidth(ct.getWidth(true));
			var chs = ct.children, c;
		  for(var i=0;i<chs.length;i++){
				c = chs[i];
				if(c.width === false){
					c.setWidth(c.getWidth());
				}
			}
			ct.delClass(ct.autoWidthCS);
		}
	};
	
	
	return {
		container : '_hdColHolder',
		ItemClass : CColumn,
		template : 'CGridHeader',
		unselectable : true,
		height : 21,
		sortable : true,
		resizeSpliterCS:'g-grid-hd-spliter',
		autoWidthCS : 'g-grid-header-autowidth',
		initComponent : function(){
			this.layout = new CLayout({onLayout:onLayout});
			superclass.initComponent.call(this);
			var hdtbl = this.hdWidthAnchor = this.$$('_hdtbl');
			hdtbl.view.onmousemove = this.onHDMouseMove.bindAsListener(this);
			hdtbl.view.onmousedown = this.onHDMouseDown.bindAsListener(this);
			if(this.sortable)
				this.itemAction('click', this.colSortTrigger, false, null, null, 'DIV');
			this.itemAction('mouseover', this.onMouseOver, false, null, null, 'DIV');
			this.itemAction('mouseout', this.onMouseOut, false, null, null, 'DIV');
			
			this.on('colresize', this.onColResized);
		},
		
		onColResized : function(col, idx, dt){
			if(dt!=0 && this.parentContainer && !this.parentContainer.autoFit){
				this.hdWidthAnchor.setWidth(this.hdWidthAnchor.getWidth(true)+dt);
			}
		},
		
		onMouseOver : function(item) {item.addClass('g-grid-hd-on'); },
		
		onMouseOut : function(item) {item.delClass('g-grid-hd-on'); },
		
		startResizeSpliter : function(col, ev){
			var l = hdRzA, r = hdRzB;
			if(!r){
				l = hdRzA = CBase.create({view:Cache.get('div'), hidden:true, inherentCS:this.resizeSpliterCS,showTo:document.body, autoRender:true});
				r = hdRzB = CBase.create({view:Cache.get('div'), hidden:true, inherentCS:this.resizeSpliterCS,showTo:document.body, autoRender:true});
			}
			var g = col.parentContainer.parentContainer,
			    xy = col.absoluteXY(),
			    colw = col.getWidth(true),
			    startH = CC.borderBox?
			         col.parentContainer.getHeight(true):
			         col.parentContainer.getHeight(true)+1,
			    ctxh = g.wrapper.view.clientHeight;
			
			r.setXY(xy[0]+colw-1, xy[1]).setHeight(g.wrapper.view.clientHeight+startH).display(true);
			l.setXY(xy[0]-1,xy[1]).setHeight(r.height).display(true);
			minRz = l.left - r.left + (this.resizerBarLen || 4);
			maxRz = g.autoFit? this.getMaxResizableAutoFitWidth(col):Math.MAX_VALUE;
			//初始x坐标
			initMx = Event.pageX(ev);
			//初始长度
			initLeft = r.left;
		},
		/**
		 * 在autoFit情况下返回col列最大可扩宽度
		 */
		getMaxResizableAutoFitWidth : function(col){
			if(col.disabledResize)
				return 0;
			var len=0;
			this.each(function(){
				if(this.disabledResize || this.disabled || this == col)
					return;
				len += this.getWidth(true);
			});
			return len - col.getWidth(true) || 0;
		},
		
		endResizeSpliter : function(col){
			hdRzA.display(0);
			hdRzB.display(0);
		},
		
		onHDMouseMove : function(ev){
			var el = CC.tagUp(ev.target||ev.srcElement, 'TD');
			var st = el.style;
			if(this.disabledResize || this.resizing || CGhost.instance.draging){
				if(st.cursor != '')
				    st.cursor="";
				    return;
			}
			var col = this.$(el);
			if(!col || col.disabledResize || col.disabled){
				if(st.cursor != '')
			    st.cursor="";
			  return;
			}
			
			var px = el.offsetWidth - Event.pageX(ev) + col.absoluteXY()[0];
			if (px< (this.resizerBarLen || 10)){
				st.cursor="col-resize";
			}

			else if(st.cursor != '')
			    st.cursor="";
		},
		
		onHDMouseDown : function(ev){
			var el = CC.tagUp(ev.target||ev.srcElement, 'TD');
			var col = this.$(el);
			if(!col)
				return;
			if(el.style.cursor != 'col-resize' || col.disabledResize)
				return;
			this.resizing = true;
			var self = this;
			this.startResizeSpliter(col, ev);
			CC.$body.domEvent('mouseup', this.onHDMouseUp, true, col);
			CC.$body.domEvent('mousemove', this.onHDResize, true, this);
			this.fire('colresizestart', col, this.indexOf(col));
		},
		
		//col === this
		onHDResize : function(event){
			//this为header
			var pace = Event.pageX(event) - initMx;
			if(pace<0 && pace<minRz){
				pace = minRz
			}else if(pace>maxRz){
				pace = maxRz;
			}
			hdRzB.setLeft(initLeft+pace);
		},
		
		onHDMouseUp : function(event){
			//当前this为resize列
			var ct = this.parentContainer;
			ct.endResizeSpliter();
			CC.$body.unDomEvent('mouseup', ct.onHDMouseUp);
			CC.$body.unDomEvent('mousemove', ct.onHDResize);
		  this.setWidth(this.width+(hdRzB.left-initLeft));
			ct.fire('colresizeend', this, ct.indexOf(this));
			ct.resizing = false;
		},
		
		destoryComponent : function(){
			//fix when resizing but in destorying.
			if(this.resizing){
				CC.$body.unDomEvent('mouseup', this.onHDMouseUp);
				CC.$body.unDomEvent('mousemove', this.onHDResize);
			}
			superclass.destoryComponent.call(this);
		},
		
		colSortTrigger : function(item, evt){
			if(item.style('cursor') != 'col-resize') {
				var t = (item.sortType== 'desc')?'asc':'desc';
				item.sortColumn(t);
			}
		}
	};
});

CC.create('CGridCell', CBase, function(superclass){
	Cache.register('CGridCell', function(){
		var td = CC.$C({tagName:'TD'});
		td.appendChild(CC.$C({tagName:'DIV', className:'rowcell', id:'_tle'}));
		return td;
	});
	return {
		initComponent : function(){
			this.view = Cache.get('CGridCell');
			superclass.initComponent.call(this);
		},
		
		destoryComponent : function(){
			var c = this.view.firstChild;
			superclass.destoryComponent.call(this);
			c.innerHTML = '';
			c.className = '';
			Cache.put('CGridCell', this.view);
		}
	};
});

CC.create('CGridRow', CContainerBase, function(superclass){
	Cache.register('CGridRow', function(){
		return CC.$C({tagName:'TR', className:'g-grid-row'});
	});
	
	return {
		eventable:false,
		ItemClass : CGridCell,
		hoverCS : 'g-row-over',
		initComponent : function(){
			this.view = Cache.get('CGridRow');
			superclass.initComponent.call(this);
		},

		onMouseOver : function(ev){
			this.parentContainer.onRowOver(this, ev);
		},
		
		onMouseOut : function(item, ev){
			this.parentContainer.onRowOut(this, ev);
		}
	};
});

/**
 * CGridView不具备管理自身布局能力,让唯一能做的事就是提供方法让别人管理
 */
CTemplate['CGridView'] = '<div class="g-gridview"><table class="g-gridview-tbl" id="_gridviewtbl" cellspacing="0" cellpadding="0"><tbody id="_ctx"></tbody></table></div>';
CC.create('CGridView', CContainerBase, function(superclass){
  
  //布局使得表格每行列与表头列对齐
  function layoutRow(row){
		var hd = this.container.parentContainer.header,
		    i=0,chs=hd.children,len=chs.length;
		for(;i<len;i++){
			row.children[i].setWidth(chs[i].getWidth(true));
		}
	}
	
	return {
		
		ItemClass : CGridRow,
		
		container : '_ctx',
		
		type : 'CGridView',
		
		useContainerMonitor : true,
		
		initComponent : function(){
			this.layout = new CLayout({layoutChild:layoutRow});
			superclass.initComponent.call(this);
			this.itemAction('mousedown', this._containerSelectTrigger, true, null, '_gridviewtbl');
			this.itemAction('dblclick', this.onRowDBClick, true, null, '_gridviewtbl');
			this.tableNode = this.dom('_gridviewtbl');
		},
		
		onRowOver : fGo,
		
		onRowOut : fGo,
		
		onRowDBClick : function(item, event){
			var cell = item.$(event.target || event.srcElement);
			if(cell){
				this.parentContainer.fire('celldbclick', cell);
			}
			this.parentContainer.fire('rowdbclick', item);
		},
		
		_containerSelectTrigger : function(item, event){
			if(this.selectedCS)
				item.hasClass(this.selectedCS) ? item.delClass(this.selectedCS) : item.addClass(this.selectedCS);
			var cell = item.$(event.target || event.srcElement);
			if(cell){
				this.parentContainer.fire('cellclick', cell);
			}
			this.parentContainer.fire('rowclick', item);
		},

		swapColumn : function(idx1,idx2){
			var cells = this.children;
			for(var i=0,len=cells.length;i<len;i++){
				cells[i].swap(idx1,idx2);
			}
		},
		
		
		setCellWidth : function(idx, w){
	  	var chs = this.children, len = chs.length, i = 0;
	  	for(;i<len;i++){
	  		chs[i].children[idx].setWidth(w);
	  	}
		}
	};
});


CC.create('CGrid', CSelectedPanel, function(superclass){
  //
  function layoutView(v){
		var ct = this.container;
		//表头锚宽对齐
		v.setWidth(ct.header.hdWidthAnchor.width);
		v.doLayout();
	}
	
	function onLayout(){
		var ct = this.container;
		console.trace();
		if(ct.height !== false)
			ct.wrapper.setHeight(ct.getHeight(true) - ct.header.getHeight(true));
		ct.header.setWidth(ct.getWidth(true));
		CLayout.prototype.onLayout.call(this);
	}
	
	return {
		container : '_grid_ctx',
		
		ascCS : 'g-col-asc',
		
		descCS : 'g-col-desc',
		
		navKeyEvent : true,
		
		initComponent : function(){
			if(!this.layout)
				this.layout = new CLayout({layoutChild:layoutView, onLayout:onLayout});
			
			superclass.initComponent.call(this);
			if(CC.isArray(this.header)){
				this.header = new CGridHeader({showTo:this.dom('_hdctx'), array:this.header});
			}
			
			this.header.on('colresize', this.onColumnResize, this);
			this.header.on('colsort', this.onColumnSort, this);
			this.header.on('colswap', this.onColumnSwap, this);
			this.domEvent('scroll', this.onContainerScroll, false, null, this.scrollor);
			this.follow(this.header);
			if(this.autoFit)
				this.setAutoFit(true);
		},
		
		setAutoFit : function(b){
			this.wrapper.style('overflow-x',b?'hidden':'');
			this.autoFit = b;
			if(this.rendered)
				this.doLayout();
		},
		
		onContainerScroll : function(evt){
			this.header.view.scrollLeft = this.container.scrollLeft;
		},
		
		onColumnSwap : function(colA, colB, idxA, idxB){
			//swap header
			this.header.swap(idxA, idxB);
			//swap grid views
			this.each(function(){
				this.swapColumn(idxA, idxB);
			});
		},
		
		/**
		 * 实际对列排序的方法.
		 */
		onColumnSort : function(col, idx, sortType) {
			//
			if(!col.comparator)
				col.createComparator();
			//切换排序样式
			if(sortType == 'desc')
				col.switchClass(this.ascCS, this.descCS);
			else 
				col.switchClass(this.descCS, this.ascCS);
			var ct = col.parentContainer;
			if(ct.sortedColumn && ct.sortedColumn != col)
				ct.sortedColumn.delClass(this.ascCS).delClass(this.descCS);
			
			//第一次排序?
			var bs = idx === this.currSortedIdx;
			//排序数据视图
			this.each(function(){
			  if(!bs)
					this.sort(col.comparator);
				else this.reverse();
			});
			this.currSortedIdx = idx;
		},
		
		onColumnResize : function(col, idx) {
			if(this.autoFit){
				//避免再次被布局
				col.disabledResize = true;
				this.header.doLayout();
				this.doLayout();
				col.disabledResize = false;
		  }
		  else {
		  	var w = col.getWidth(true);
		  	this.each(function(){
		  		this.setCellWidth(idx, w);
		  	});
		  }
		},
		
		selectNext:function(){
			
		},
		
		selectPre:function(){
		
		}
	};
});
