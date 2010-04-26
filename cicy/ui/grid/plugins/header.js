CC.Tpl.def('CC.ui.grid.Header', '<div class="g-grid-hd"><div class="hd-inner" id="_hd_inner"><table class="hd-tbl" id="_hd_tbl" cellspacing="0" cellpadding="0" border="0"><tbody><tr id="_ctx"></tr></tbody></table></div><div class="g-clear"></div></div>');

/**
 * 表头
 * @name CC.ui.grid.Header
 * @class
 */
CC.create('CC.ui.grid.Header', CC.ui.ContainerBase, function(father){
	
 var  B = CC.Base;
 
return {

  itemCls : CC.ui.grid.Column,

  ct:'_ctx',

  initComponent : function(){
    father.initComponent.call(this);
    this.hdTbl = this.$$('_hd_tbl');
  },

/**
 * @name CC.ui.Grid#header
 * @property {CC.ui.grid.Header} header
 */
  initPlugin : function(grid){
    // add to grid container
    return true;
  },

  updateColWrapTblWidth : function(colWidth, dx){
    var hdTbl = this.hdTbl;
    if(hdTbl.width === false){
      hdTbl.setWidth(colWidth);
    }else if(dx === false){
      hdTbl.setWidth(hdTbl.width + colWidth);
    }else {
      hdTbl.setWidth(hdTbl.width + dx);
    }
  },
/**
 * 插件监听Grid事件的事件处理函数
 * @private
 */
  gridEventHandlers : {

    colwidthchange : function(idx, col, w){
      // 由表头设置具体列宽
      B.prototype.setWidth.call(col, w);
    },

    aftercolwidthchange : function(idx, col, width, dx){
      this.updateColWrapTblWidth(width, dx);
    },

    //同步表头与内容的滚动
    contentscroll : function(e, scrollLeft, ct){
        if(parseInt(this.view.scrollLeft, 10) !== scrollLeft)
          this.view.scrollLeft = scrollLeft;
    }
  },

/**
 * 发送父层表格事件,如果此时存在父组件,调用父组件的fire发送事件
 */
  fireUp : function(){
    var p = this.pCt;
    if(p){
      return p.fire.apply(p, arguments);
    }
  },

/**
 * 获得列数
 * @param {Number}
 */
  getColumnCount : function(){
    return this.children.length;
  }
};
});

/**
 * @name CC.ui.gridhd
 * @field
 */
CC.ui.def('gridhd', CC.ui.grid.Header);