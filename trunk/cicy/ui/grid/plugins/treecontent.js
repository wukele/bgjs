CC.Tpl.def('CC.ui.grid.TreeCellBody', [
  '<div class="g-tree-nd-el g-tree-nd-cls g-tree-nd g-tree-arrows">',
      '<div class="g-tree-nd-indent" id="_ident">',
        '<div class="g-tree-ec-icon" id="_pls"></div>',
        '<div class="g-tree-nd-icon" id="_ico"></div>',
      '</div>',
      '<div class="g-tree-nd-anchor" id="_wr">',
        '<span id="_tle" class="g-unsel" unselectable="on"></span>',
      '</div>',
      '<div class="g-clear"></div>',
  '</div>'
].join(''));

/**
 * 该类并无新增公开的方法和属性，生成了控制表格树项的单元格UI。
 * @class CC.ui.grid.TreeCell
 * @extends CC.ui.grid.Cell
 */

CC.create('CC.ui.grid.TreeCell', CC.ui.grid.Cell, function(superclass){

return {
  splitPlusCS : 'g-tree-split-plus',
  splitMinCS :'g-tree-split-minus',
  nodeOpenCS : 'g-tree-nd-opn',
  nodeClsCS : 'g-tree-nd-cls',
  nodeLeafCS : 'g-tree-nd-leaf',
  // private
  rowHoverCS : 'g-tree-nd-over g-tree-ec-over',

  identW : 16,
  
  initComponent : function(){
    superclass.initComponent.call(this);
      // init event
      this.domEvent('mousedown', this.onElbowClick, true, null, this._elbow.view)
          .domEvent('click', CC.Event.noUp, true, null, this._elbow.view);
      
      this._checkIfNodes(false);
    // make parent row a reference to self
    this.pCt.treeCell = this;
  },
  
  // private
  onElbowClick : function(){
    this.pCt.expand(!this.pCt.expanded);
  },
  
  // private
  createView : function(){
    superclass.createView.call(this);
    var bd = CC.Tpl.$('CC.ui.grid.TreeCellBody');
    // 标题结点
    this.titleNode = CC.$('_tle', bd);
    // expand装饰结点
    this._elbow    = this.$$(CC.$("_pls", bd));
    // 图标装饰结点
    this._icon     = this.$$(CC.$("_ico", bd));
    
    this._ident     = this.$$(CC.$("_ident", bd));
    
    // 
    this._head     = this.$$(bd);
    var wrap = this.view.firstChild;
    // 取消作为标题结点
    wrap.id = '';
    wrap.appendChild(bd);
    this.addClass('g-treegrid-cell');
  },
  
  // override
  getTitleNode : function(){
    return this.titleNode;
  },
  
  // 调整结点样式,展开/收缩时调用本方法更新结点样式状态
  _decElbowSt : function(b) {
    
    if(b===undefined)
      b = this.pCt.expanded;

    if(this.pCt.nodes){
      if (b) {
         this._elbow.switchClass(this.splitPlusCS, this.splitMinCS);
         this._head.switchClass(this.nodeClsCS, this.nodeOpenCS);
      } else {
         this._elbow.switchClass(this.splitMinCS, this.splitPlusCS);
         this._head.switchClass(this.nodeOpenCS, this.nodeClsCS);
      }
    }
  },
  
  // 调整结点叶子结点/非叶子结点样式，当子项数量发生变动时调用更新
  // 里面同时也调用了_decElbowSt方法
  _checkIfNodes : function(b){
    if(this.pCt.nodes){
      if(this._head.hasClass(this.nodeLeafCS)){
        this._head.delClass(this.nodeLeafCS);
      }
    }else if(!this._head.hasClass(this.nodeLeafCS)){
        this._head.addClass(this.nodeLeafCS);
    }
    
    this._decElbowSt(b);
  }
};
});


CC.ui.def('treecell', CC.ui.grid.TreeCell);

/**
 * @class CC.ui.grid.TreeRow
 * @extends CC.ui.grid.Row
 */

/**
 * @property previous
 * 上个结点
 * @type CC.ui.grid.TreeRow
 */

/**
 * @property next
 * 下个结点
 * @type CC.ui.grid.TreeRow
 */

/**
 * @property treeCell
 * 该行树结点UI所在单元的格
 * @type CC.ui.grid.GridCell
 */

/**
 * @cfg {Boolean} expanded 是否展开
 */
CC.create('CC.ui.grid.TreeRow', CC.ui.grid.Row, function(superclass){
return {
  // private
  _curIdent : 0,
  
  initComponent : function(){
    superclass.initComponent.call(this);
    // folder node
    if(this.nodes){
      nds = CC.delAttr(this, 'nodes');
      for(var i=0,len=nds.length;i<len;i++){
        this.addItem(nds[i]);
      }
      
      if(!nds.length)
        this.nodes = nds;
    }
  },
  
  onRender : function(){
    superclass.onRender.call(this);
    if(this.expanded){
      delete this.expanded;
      this.expand(true);
    }
  },

/**
 * 添加子项
 * @param {CC.ui.grid.TreeRow} treeRow
 <pre><code>
   row.addItem({
      array:[{title:'ac'}, {title:'ac'}, {title:'ac'}],
      nodes : [
        { array:[{title:'aca'}, {title:'acb'}, {title:'acc'}] }
      ]
  });
 </code></pre>
 */
  addItem : function(item, cancelAddIntoView){
    var nds = this.nodes;
    if(!nds)
      nds = this.nodes = [];
    item.hidden = this.hidden || !this.expanded;
    
    item = this.pCt.instanceItem(item);
    
    item.pNode = this;
    
    if(this.view.parentNode === this.pCt.ct)
      this._addItemView(item);
      
    nds.push(item);
    
    //item.treeCell._decElbowSt();
    item._applyChange(this);
    
    if(this.rendered)
      this.treeCell._checkIfNodes();
    
    var pre = item.previous;
    if(pre){
      //pre.treeCell._decElbowSt();
      pre._applyChange(this);
    }
    return item;
  },

/**
 * 删除子项
 * @param {CC.ui.grid.TreeRow} treeRow
 */
  removeItem : function(item, cancelNotifyParent){
    if(this.rendered)
      item._removeFromView(cancelNotifyParent);
    
    item.pNode = null;
    var pre  = item.previous;

    this.nodes.remove(item);
    item._applySibling(true);

    if(pre)
      pre._applySibling();
    
    if(this.rendered)
      this.treeCell._checkIfNodes();
  },
/**
 * 插入子项表结点
 * @param {Number} index
 * @param {CC.ui.grid.TreeRow} item
 * @return {CC.ui.grid.TreeRow}
 */
  insertItem: function(idx, item) {
    var nds = this.nodes;

    if(item.pNode === this && nds.indexOf(item)<idx)
      idx --;


      if(!nds)
        nds = this.nodes = [];
        
      if (item.pNode){
          item.pNode.removeItem(item);
          item.pNode = this;
      }
      else {
        item.hidden = this.hidden || !this.expanded;
        item = this.pCt.instanceItem(item);
        item.pNode = this;
      }

      nds.insert(idx, item);
      
      if(this.rendered){
        delete item.pCt;
        if (nds[idx+1])
           this.pCt.insert(this.pCt.indexOf(nds[idx+1]), item);
        else this.pCt.insert(this.pCt.indexOf(this)+1, item);
        item.pCt = this.pCt;
        this.treeCell._checkIfNodes();
      }
      // child nodes..
      item._applyChange(this);
    return item;
  },

  expanded : false,
  
/**
 * 展开/收缩子项.
 * @param {Boolean} expand
 */
  expand : function(b) {
    if(this.expanded !== b){
      if(this.pCt.grid.fire('expandtree', this, b)===false)
        return false;
      this.treeCell._decElbowSt(b);
      this._expandContent(b);
      this.expanded = b;
      return this.pCt.grid.fire('expandedtree', this, b);
    }
  },

  // override
  onHide : function(){
    superclass.onHide.call(this);
    if(this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++){
        if(!nds.hidden)
          nds[i].display(false);
      }
    }
  },
  
  // override
  onShow : function(){
    superclass.onShow.call(this);
    if(this.expanded && this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++){
        if(nds[i].hidden)
          nds[i].display(true);
      }
    }
  },
  
  _applySibling : function(detach){
    if(detach){
      if(this.previous)
        this.previous.next = this.next;
      if(this.next)
        this.next.previous = this.previous;
      this.next = this.previous = null;
    }else {
      var ct = this.pNode;
      if(ct){
        c = ct.nodes, idx = c.indexOf(this);
        this.next = c[idx+1];
        if(this.next)
          this.next.previous = this;
        this.previous = c[idx-1];
        if(this.previous)
          this.previous.next = this;        
      }else {
        this.previous = this.next = null;
      }
    }
  },
  
  _applyChange : function(){
    this._applySibling();
    this._fixSpacer();
  },
  
  _fixSpacer : function(pNode) {
    pNode = pNode || this.pNode;
    if(pNode){
      var tc  = this.treeCell, 
          idt = pNode._curIdent + tc.identW;
      
      tc._head.view.style.paddingLeft = idt + 'px';
      this._curIdent = idt;
      
      if(this.nodes){
        for(var i=0,nds = this.nodes,len=nds.length;i<len;i++) {
          nds[i]._fixSpacer(this);
        }
      }
    }
  },
  
  _navInsertPlaceHold : function(){
    return this.nodes ?
      !this.nodes[this.nodes.length - 1] ? this : this.nodes[this.nodes.length - 1]._navInsertPlaceHold() 
      : this;
  },
  
  _addItemView : function(item){
    // 是否已在nodes列表中而还没加到grid view上?
    var nxt = this._navInsertPlaceHold(), 
        idx = this.pCt.indexOf(nxt) + 1;
    
    delete item.pCt;
    this.pCt.insert(idx, item);
    item.pCt = this.pCt;
    
    if(item.nodes){
      idx ++;
      for(var nds=item.nodes,len=nds.length, i=0;i<len;i++){
        idx = item._batchAddItemView(nds[i], idx);
      }
    }
  },
  
  _batchAddItemView : function(item, idx){
    delete item.pCt;

    this.pCt.insert(idx, item);
    item.pCt = this.pCt;
    idx++;
    
    if(item.nodes){
      for(var nds=item.nodes,len=nds.length, i=0;i<len;i++){
        idx = item._batchAddItemView(nds[i], idx);
      }
    }
    return idx;
  },
    
  _removeFromView : function(cancelNotifyParent){
    // remove from grid view
    if(this.nodes){
      var nds = this.nodes;
      for(var i=0,len=nds.length;i<len;i++){
        if(nds[i].nodes)
          nds[i]._removeFromView();
        else if(nds[i].pCt)
          nds[i].pCt.remove(nds[i], true);
      }
    }
    // 防止重复调用
    if(!cancelNotifyParent && this.pCt)
      this.pCt.remove(this, true);
  },
   
  _expandContent : function(b){
    if(this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++)
         nds[i].display(b);
    }
  },
  
  mouseoverCallback : function(){
    this.treeCell._ident.addClass(this.treeCell.rowHoverCS);
    superclass.mouseoverCallback.apply(this, arguments);
  },
  
  mouseoutCallback : function(){
    this.treeCell._ident.delClass(this.treeCell.rowHoverCS);
    superclass.mouseoutCallback.apply(this, arguments);
  },
  
  destory : function(){
    if(this.nodes){
      for(var i=0,nds=this.nodes,len=nds.length;i<len;i++){
        nds[i].destory();
      }
    }
    superclass.destory.call(this);
  }
};
});

/**
 * @class CC.ui.grid.TreeContent
 * @extends CC.ui.grid.Content
 */
CC.create('CC.ui.grid.TreeContent', CC.ui.grid.Content, function(superclass){
return {
  
  itemCls : CC.ui.grid.TreeRow,
  
  onAdd : function(row){
    superclass.onAdd.apply(this, arguments);
    row._applyChange();
    if(row.nodes){
      var idx = this.indexOf(row) + 1;
      for(var i=0,nds=row.nodes,len=nds.length;i<len;i++){
        idx = row._batchAddItemView(nds[i], idx);
      }
    }
  },
  /*
  onInsert : function(row){
    superclass.onInsert.apply(this, arguments);
    row._applyChange();
    if(row.nodes){
      var idx = this.indexOf(row) + 1;
      for(var i=0,nds=row.nodes,len=nds.length;i<len;i++){
        idx = row._batchAddItemView(nds[i], idx);
      }
    }
  },
  */
  remove : function(item , cancelNotifyPNode){
    superclass.remove.apply(this, arguments);
    if(!cancelNotifyPNode && item.pNode) {
      item.pNode.removeItem(item, true);
    }else {
      // grid level
      item._removeFromView(true);
    }
  }
};
});

CC.ui.def('treecontent', CC.ui.grid.TreeContent);