/**
 * @class CC.ui.grid.Content
 * 表格数据视图控件.
 * @extends CC.ui.ContainerBase
 */
 
/**
 * @cfg {Boolean} ignoreClick 是否禁止本单元的cellclick事件的发送,如果为true,当点击该单元时Grid并不发送cellclick事件,默认未置值
 * @member CC.ui.grid.Cell
 */

/**
 * @cfg {Boolean} ignoreClick 是否禁止本行的itemclick事件的发送,如果为true,当点击该行时Grid并不发送itemclick事件,默认未置值
 * @member CC.ui.grid.Row
 */

/**@cfg {Boolean} hoverEvent 是否允许发送rowover,rowout事件.*/

/**
 * @property batchUpdating
 * 是否正在批量更新中
 * @type {Boolean}
 * @private
 */
 
/**
 * @event cellclick
 * 单元格点击事件
 * @param {CC.ui.grid.Cell} cell
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event rowclick
 * 行点击事件
 * @param {CC.ui.grid.Row} row
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event rowdblclick
 * 行双击事件
 * @param {CC.ui.grid.Row} row
 * @param {CC.ui.grid.Cell} cell 双击所有地单元格，无则则为空
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event contentscroll
 * 数据视图grid.content滚动条滚动时发送.
 * @param {DOMEvent} event
 * @param {Number} scrollLeft
 * @param {CC.ui.grid.plugin.Content} content
 * @member CC.ui.Grid
 */


/**
 * @event rowover
 * 允许content.hoverEvent后,鼠标mouseover时发送.
 * @param {CC.ui.grid.Row} row
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */

/**
 * @event rowout
 * 允许content.hoverEvent后,鼠标mouseout时发送.
 * @param {CC.ui.grid.Row} row
 * @param {DOMEvent} event
 * @member CC.ui.Grid
 */
 
 
CC.Tpl.def('CC.ui.grid.Content', '<div class="g-grid-ct"><table class="ct-tbl" id="_ct_tbl" cellspacing="0" cellpadding="0" border="0"><colgroup id="_grp"></colgroup><tbody id="_ctx"></tbody></table></div>');
CC.create('CC.ui.grid.Content', CC.ui.Panel, function(father){
	var undefined, C = CC.Cache, CX = CC.ui.ContainerBase.prototype;
return {

 itemCls : CC.ui.grid.Row,

 ct : '_ctx',

 useContainerMonitor : true,

 syncWrapper : false,

 clickEvent : 'click',

 selectionProvider : { selectedCS : 'row-select' },

 lyInf : {h:'lead'},

 initComponent : function(){
    father.initComponent.call(this);
    this.ctTbl = this.$$('_ct_tbl');
  },

  initPlugin : function(){
    return true;
  },
  
/**
 * 创建列宽控制器,这里采用 &lt;colgroup&gt;&lt;col /&gt;&lt;/colgroup&gt;控制方式
 * @private
 */
  setupColumnLever : function(){
    var n, i,
        levers = this.levers = [],
        cs = this.grid.header.children,
        len = cs.length,
        cp = this.dom('_grp');

    // 创建列宽控制点
    for(i=0;i<len;i++){
      n = this.$$(CC.$C('COL'));
      levers[i] = n;
      if(cs[i].hidden)
        this.setCellsVisible(false, i, n);
      cp.appendChild(n.view);
    }

    var cws = this.cacheWidths;

    if(cws){
      delete this.cacheWidths;
      for(i=0,len=cws.length;i<len;i++){
        if(cws[i] !== undefined){
          levers[i].setWidth(cws[i]);
        }
      }
    }
  },

/**
 * @private
 */
  onRender : function(){
   this.setup();
   father.onRender.call(this);

   this.batchUpdating = true;
   this.updateView();
   this.batchUpdating = false;
  },

  /**
   * 用于初始化数据表,数据表结点处于就绪状态,就绪后所有接口方法都能正常调用
   * @private
   */
  setup : function(){
    this.setupColumnLever();
    this.setupEvent();
  },

/**
 * @private
 */
  setupEvent : function(){
    this.domEvent('scroll' , this.onScroll);
    this.on('resized', this.onResized);
  },

/**
 * @override
 * @private
 */
  bindClickInstaller : function(){
    this.itemAction(
             this.clickEvent,
             this.onRowClick,
             false,
             null,
             this.dom('_ct_tbl')
    );
    
    this.itemAction(
             'dblclick',
             this.onRowDblClick,
             false,
             null,
             this.dom('_ct_tbl')
    );    
  },
  
  updateContentWrapTblWidth : function(colWidth, dx){
    var ctTbl = this.ctTbl;
    if(ctTbl.width === false){
      ctTbl.setWidth(colWidth);
    }else if(dx === false){
      ctTbl.setWidth(ctTbl.width + colWidth);
    }else {
      ctTbl.setWidth(ctTbl.width + dx);
    }
  },
  
  updateLeversWidth : function(idx, width, dx){
    if(this.levers){
      this.levers[idx].setWidth(width);
    }else {
      var cws = this.cacheWidths;
      if(!cws){
        cws = this.cacheWidths = [];
      }
      cws[idx] = width;
    }
  },
  
  setCellsVisible : function(b, idx, lever){
    if(this.levers){
      var lv = lever || this.levers[idx];
      if(!b)
        lv.view.style.width = '0px';
      else lv.view.style.width = lv.width + 'px';
    }
  },
  
  // @override
  getScrollor : function(){
    return this;
  },

  onAdd : function(c){
    if(this.altCS && (this.size()%2)){
      c.addClass(this.altCS);
    }
    father.onAdd.apply(this, arguments);
    if(this.rendered && !this.batchUpdating){
      this.updateRow(c);
    }
  },
  
/**
 * @private
 */
  onScroll : function(e){
    this.grid.fire('contentscroll', e, parseInt(this.view.scrollLeft, 10) || 0, this);
  },


  onRowClick : function(row, e){
    if(!this.clickDisabled && !row.ignoreClick){
      var cell = row.$(e.srcElement || e.target), rt;
      if(cell){
        if(cell.disabled)
         return;
        
        if(!row.clickDisabled && !cell.ignoreClick){
          rt = this.grid.fire('cellclick', cell, e);
        }
      }

      if(rt !== false){
        this.fire('itemclick', row, e);
        this.grid.fire('rowclick',  row, e);
      }
    }
  },
  
  dblclickDisabled : false,
  
  onRowDblClick : function(row, e){
    if(!this.dblclickDisabled){
      var cell = row.$(e.srcElement || e.target);
      if(!cell || !cell.disabled)
        this.grid.fire('rowdblclick', row, cell, e);
    }
  },
  
  hoverEvent : false,
 
  // @interface
  onRowOver : function(r, e){
    if(this.hoverEvent === true){
      this.grid.fire('rowover', r, e);
    }
  },
  
  // @interface
  onRowOut : function(r, e){
    if(this.hoverEvent === true){
      this.grid.fire('rowout', r, e);
    }
  },
  
  // @interface
  instanceItem : function(item){
    if(item && !item.cacheId){
      // 检查是否有非数据列
      var hds = this.grid.header.children;
    	
    	if(!item.array){
    		var arr = item.array = []
        for(i=0,len=hds.length;i<len;i++){
          arr[arr.length] = {title:''};
        }
      }

      else if(item.array.length !== hds.length){
        arr = item.array;
        for(i=0,len=hds.length;i<len;i++){
          if(!hds[i].dataCol){
            arr.insert(i, {});
          }
        }
      }
    }
    return father.instanceItem.apply(this, arguments);
  },
  
  onResized : function(w){
    if(w !== false){
      //fix ie no scroll event bug
      if(CC.ie){
        this.grid.fire('contentscroll', null, parseInt(this.view.scrollLeft, 10) || 0, this);
      }
    }
  },
// --- Interface
/**
 * @private
 */
  gridEventHandlers : {

    aftercolwidthchange : function(idx, col, width, dx){
      this.updateContentWrapTblWidth(width, dx);
      this.updateLeversWidth(idx, width, dx);
    },
    
    sortcol : function(){
      this.sortByCol.apply(this, arguments);
    },
    
    showcolumn : function(b, col, idx){
      this.setCellsVisible(b, idx);
      if(!b)
        this.updateContentWrapTblWidth(false, -col.width);
    }
  },
  
  
  sortByCol : function(col, idx, order, comparator){
    this.sort(function(ra, rb){
      var a = ra.children[idx].getValue(),
          b = rb.children[idx].getValue();
      return order === 'asc' ? comparator(a, b) : comparator(b, a);
    });
  },
  
  updateView : function(){
    var cs = this.grid.header.children,
        hl = cs.length,
        i, rs = this.children,
        rl = rs.length,
        bs = [], c;

    for(i=0;i<hl;i++)
      bs[i] = cs[i].cellBrush;

    for(i=0;i<rl;i++){
      for(j=0;j<hl;j++){
        this.updateCell(rs[i].children[j],undefined, rs[i].brush || bs[j]);
      }
    }
  },
/**
 * 当行初始化时,委托父类生成view结点,当通过fromArray方式载行数据时才生效.
 * @param {CC.ui.grid.GridRow} row
 */
  createRowView : function(row){
    row.view = C.get('CC.ui.grid.Row');
    CX.createView.call(row);
  },
  
/**
 * 当一行数据添加到表格时,调用该方法更新行数据.
 * @param {CC.ui.grid.GridRow} row
 */
  updateRow : function(row){
    var cs = this.grid.header.children,
        i, rs = row.children,
        rl = rs.length;

    for(i=0;i<rl;i++){
      this.updateCell(rs[i], undefined, rs[i].brush || cs[i].cellBrush);
    }
  },

/**
 * 更新单元格html
 * @param {CC.ui.grid.Cell} cell
 * @param {String} title
 */
  updateCell : function(cell, title, brush){
    if(!brush)
    	brush = cell.brush || this.grid.header.$(cell.pCt.indexOf(cell)).cellBrush;
    if(title === undefined){
      title = cell.title===undefined?cell.value:cell.title;
    }
    cell.getTitleNode().innerHTML = brush.call(cell, title);
  },

/**
 * 获得位置i行,j列上的单元格.
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @return {CC.ui.grid.Cell} cell
 */
  cellAt : function(i, j){
    return this.children[i].children[j];
  },

/**
 * 获得第i行j列的数据.
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @param {Object} [value] 
 * @return {Object}
 */
  dataAt : function(i, j, v){
    if(v === undefined) return this.$(i).$(j).getValue();
    this.$(i).$(j).setValue(v);
  },
/**
 * 获得第i行j列的标题.
 * @param {Number} rowIndex
 * @param {Number} cellIndex
 * @param {Object} [text] 
 * @return {String}
 */
  textAt : function(i, j, v){
    if(v === undefined) return this.$(i).$(j).getTitle();
    this.$(i).$(j).setTitle(v);
  }
};
});

/**
 * @cfg {Boolean} dataCol 指明该列是否为数据项,如果为非数据项,则表格数据视图在添加行时自动插入数据到该列.
 * @member CC.ui.grid.Column
 */
CC.ui.grid.Column.prototype.dataCol = true;

// 插件权重
CC.ui.grid.Content.WEIGHT = CC.ui.grid.Content.prototype.weight = -80;
CC.ui.def('gridcontent', CC.ui.grid.Content);