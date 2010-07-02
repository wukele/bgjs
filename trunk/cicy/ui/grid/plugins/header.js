CC.Tpl.def('CC.ui.grid.Header', '<div class="g-grid-hd"><div class="hd-inner" id="_hd_inner"><table class="hd-tbl" id="_hd_tbl" cellspacing="0" cellpadding="0" border="0"><colgroup id="_grp"></colgroup><tbody><tr id="_ctx"></tr></tbody></table></div><div class="g-clear"></div></div>');

/**
 * @class CC.ui.grid.Header
 * 表头
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.grid.Header', CC.ui.ContainerBase, function(father){
	
 var  B = CC.Base;
 
return {

  itemCls : CC.ui.grid.Column,

  ct:'_ctx',
  
  peerCS : 'peer',

  createView : function(){
    father.createView.call(this);
    this.grpEl = this.dom('_grp');
    this.hdTbl = this.$$('_hd_tbl');
  },
  
  // create td <-> col peer
  onAdd : function(col){
    father.onAdd.apply(this, arguments);
    var peer = CC.$C('COL');
    peer.className = this.peerCS;
    this.grpEl.appendChild(peer);
    col._colPeer = peer;
  },
  
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
      var tmp = col.view;
      col.view = col._colPeer;
      B.prototype.setWidth.call(col, w);
      col.view = tmp;
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
  
  // 发送父层表格事件,如果此时存在父组件,调用父组件的fire发送事件
  fireUp : function(){
    var p = this.pCt;
    if(p){
      return p.fire.apply(p, arguments);
    }
  },

  getColumnCount : function(){
    return this.children.length;
  }
};
});
/**
 * 表头权重
 * @static
 */
CC.ui.grid.Header.WEIGHT = CC.ui.grid.Header.prototype.weight = -100;

CC.ui.def('gridhd', CC.ui.grid.Header);