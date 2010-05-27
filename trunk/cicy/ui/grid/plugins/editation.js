/**
 * @class CC.ui.grid.plugins.Editation
 * 支持表格编辑的插件
 */
CC.create('CC.ui.grid.plugins.Editation', null, function(){
  var E = CC.Event, Math = window.Math;
  
  CC.ui.grid.Column.prototype.editable = true;
  CC.ui.grid.Row.prototype.editable    = true;
  CC.ui.grid.Cell.prototype.editable   = true;

/**
 * 获得该单元格值, 如果cell.value已定义,返回cell.value,否则返回cell.title
 * @param {CC.ui.grid.Cell} cell
 * @return {Object} value
 * @method getValue
 * @member CC.ui.grid.Cell
 */
  CC.ui.grid.Cell.prototype.getValue = function(cell){
     return this.value === undefined ? this.title : this.value;
  };
/**
 * @param {Object} cellValue
 * @method setValue
 * @member CC.ui.grid.Cell
 */ 
  CC.ui.grid.Cell.prototype.setValue = function(v){
      this.value = v;
      return this;
  };
  

return {
/**
 * @cfg {Boolean} editable 是否允许或禁止编辑当前表格
 */
  editable : true,
  
/**@private*/
  editorCS : 'g-flot-editor',
  
  initialize : function(opt){
    if(opt)
      CC.extend(this, opt);
  },

/**
 * 当前单元格是否允许编辑
 * this.editable && !cell.disabled &&  col.editor && col.editable && cell.pCt.editable && cell.editable
 * @param {CC.ui.grid.Cell} cell
 * @return {Boolean}
 */
  isCellEditable : function(cell, col){
    if(!col)
      col = this.grid.header.$(cell.pCt.indexOf(cell));

    return this.editable      &&
           col.editor         && 
           col.editable       && 
           cell.pCt.editable  && 
           !cell.disabled     &&
           cell.editable
  },
  
  gridEventHandlers : {
    cellclick : function(cell){
        var idx = cell.pCt.indexOf(cell),
            col = this.grid.header.$(idx);
        if(this.isCellEditable(cell, col)){
          this.startEdit(cell, idx, col);
        }
    }
  },

/**
 * 获得单元格编辑器.
 * @param {CC.ui.grid.Column} column
 * @return {CC.ui.form.FormElement}
 */
  getEditor : function(col){
    var ed = col.editor;
    if(ed && (!ed.cacheId || typeof ed === 'string')){
      if(typeof ed === 'string')
        ed = {ctype:ed};

      CC.extendIf(ed, {
        showTo:document.body, 
        autoRender:true, 
        shadow:true
      });
      
      if(ed.shadow === true)
         ed.shadow = CC.ui.instance({ctype:'shadow', inpactH:6,inpactY:-2, inpactX : -5, inpactW:9});
      
      ed = col.editor = this.createEditor(ed);
      ed.addClass(this.editorCS);
    }
    return ed;
  },

/**@private*/
  createEditor : function(cfg){
    var inst = CC.ui.instance(cfg);
    var self = this;
    
    inst.on('blur', function(){
        if(this.bindingCell){
          self.endEdit(this.bindingCell);
        }
      });
      
    inst.on('keydown', function(e){
      if( this.bindingCell){
        var cell = this.bindingCell;
        if(E.TAB === e.keyCode){
          self.endEdit(cell);
          var nxt = self.getNextEditableBlock(cell.pCt, cell.pCt.indexOf(cell));
          
          if(nxt){
            self.startEdit(nxt);
            E.stop(e);
            return false;
          }
        }
        else if(E.ESC === e.keyCode){
          self.endEdit(cell);
          E.stop(e);
          return false;
        }
      }
    });
    
    return inst;
  },
  
  getNextEditableBlock : function(row, cellIdx){
    var c = row.children[cellIdx + 1];
    if(!c){
      row = row.pCt.children[row.pCt.indexOf(row) + 1];
      if(row){
        c = this.getNextEditableBlock(row, -1);
      }
    }else if(!this.isCellEditable(c)){
       c = this.getNextEditableBlock(row, cellIdx + 1);
    }
    return c;
  },
  
    /**
     * @property editingCell 
     * 当前正在编辑的单元格
     * @type CC.ui.GridCell
     */
     
/**
 * 开始编辑指定格元格.
 * @param {CC.ui.grid.Cell} gridcell
 */
  startEdit : function(cell,  idx, col){
    // make a timeout to avoid effection from self dom event
    this.startEdit0.bind(this, cell, idx, col).timeout(0);
  },
  
  startEdit0 : function(cell, idx, col){
    
    cell.scrollIntoView(this.grid.content.getScrollor(), true);
    
    if(idx === undefined)
      idx = cell.pCt.indexOf(cell);

    if(!col)
      col = this.grid.header.$(idx);
    
    var et = this.getEditor(col);
    if(et){
      et.bindingCell = cell;
      cell.bindingEditor = et;
      
      this.setBoundsForEditor(cell, et);
      
      et.setValue(cell.getValue())
        .setTitle(cell.getTitle())
        .show().focus();
      this.grid.fire('editstart', cell, et, col, idx, this);
    }
  },
/**
 * 结束编辑指定单元格.
 * @param {CC.ui.grid.Cell} cell
 */
  endEdit : function(cell){
    var g = this.grid;
    var idx = cell.pCt.indexOf(cell),
    et =  cell.bindingEditor,
    v, prev;
    
    if(g.fire('edit', cell, et, idx, this) !== false){
      et.hide();
      v = et.getValue(), prev = cell.getValue();
      if(v != prev){
        var txt = et.getText();
        g.content.updateCell(cell, txt);
        cell.setValue(v);
        cell.title = txt;
        this.grid.content.getValidationProvider().validateCell(cell);
        if(!cell.modified)
          g.content.getStoreProvider().decorateCellModified(cell, true);
      }
      g.fire('editend', cell, et, idx, this);
      et.bindingCell = null;
      delete cell.bindingEditor;
    }
  },

  setBoundsForEditor : function(cell, ed){
    var cz = cell.getSize(),
        xy = cell.absoluteXY();

    ed.setSize(cz);
    if(ed.height < cz.height){
      xy[1] = xy[1] + Math.floor((cz.height - ed.height)/2);
    }
  
    ed.setXY(xy);
  }
};
});

CC.ui.def('grideditor', CC.ui.grid.plugins.Editation);