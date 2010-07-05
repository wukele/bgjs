/**
 * @cfg {String} expandableRowContent 该属性来自{@link CC.ui.grid.plugins.ExpandableRow}, 行内容模板,将应用CC.templ结合当前行数据进行匹配
 * <br>
 <code>
   {
     // apply CC.templ(row, expandableRowContent);
     expandableRowContent : '<div>name:{name}</div>'
   }
 </code>
 * @member CC.ui.grid.Content
 */
 

CC.ui.grid.Content.prototype.expandableRowContent = false;

CC.ui.grid.Cell.prototype._isExpandTrig = false;

/**
 * @class CC.ui.grid.plugins.ExpandableRow
 */
 
CC.create('CC.ui.grid.plugins.ExpandableRow', null, {
   
   initialize : function( opt ){
      var cell = CC.extend({}, this.cell);
      if(opt){
        if(opt.cell) {
          CC.extend(cell, CC.delAttr('cell', opt));
        }
        CC.extend(this, opt);
      }
      
      this.grid.header.array && this.grid.header.array.insert(0, cell);
      
      // implements
      var gct = this.grid.content;
      if(gct) {
        gct.template = '<div class="g-grid-ct"><table class="ct-tbl" id="_ct_tbl" cellspacing="0" cellpadding="0" border="0"><colgroup id="_grp"></colgroup></table></div>';
        gct.ct = '_ct_tbl';
        gct.createRowView = this._createRowViewProxy;
      }
   },
  
  cell : {
    dataCol : false,
    title:'&nbsp;',
    maxW : 20,
    minW : 20,
    resizeDisabled : true,
    sortable : false,
    cellBrush: function(){
      // 做个标识
      this.pCt._rowExpandind = false;
      this._isExpandTrig     = true;
      this.addClass('exptrigcell');
      return '<a href="javascript:void(0)" class="trig"></a>';
    }
  },
  
  _createRowViewProxy : function(row){
      var cols = this.grid.header.children.length,
          erc = this.expandableRowContent;
      
      if(erc)
        erc = CC.templ(row, erc);
      
      var nd = CC.Tpl.forNode([
        '<table><tbody>',
          // cell data
          '<tr></tr>',
          
          // content
          '<tr>',
            // 竖条
            '<td class="g-gridrow-expandtd0"></td>',
            '<td class="g-gridrow-expandtd1" colspan="'+ (cols - 1) +'"><div id="_expand_area" class="g-gridrow-expandarea hid">' + (erc?erc:'') +'</div></td>',
          '</tr>',
        '</tbody></table>'
      ].join(''), row);
  
      row.view = nd.removeChild(nd.firstChild);
      row.ct = row.view.firstChild;
      row.expandRowContentEl = row.dom('_expand_area');
      
      nd = null;
      cols = null;
  },
  
  gridEventHandlers : {
    cellclick : function(cell, e){
      if(cell._isExpandTrig){
        var row = cell.pCt;
        this.expandRow(row, !row._rowExpandind);
        CC.Event.stop(e);
      }
    }
  },

/**
 * @return {HTMLElement}
 */
  getRowContentEl : function(row){
    return row.dom('_expand_area');
  },
  
  expandRow : function(row, expand){
    if(row._rowExpandind !== expand){
      if(this.grid.fire('expandablerow:beforeexpand', row, expand) !== false){
        row._rowExpandind = expand;
        CC.fly(row.expandRowContentEl)
          .display(expand)
          .unfly();
          
        row.checkClass('g-gridrow-expand', expand);
        
        this.grid.fire('expandablerow:afterexpand', row, expand);
      }
    }
  }
});

CC.ui.grid.plugins.ExpandableRow.WEIGHT = CC.ui.grid.plugins.ExpandableRow.prototype.weight = CC.ui.grid.Header.WEIGHT - 1;

CC.ui.def('gridexpandablerow', CC.ui.grid.plugins.ExpandableRow);