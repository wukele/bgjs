
(function(){

var CC = window.CC;

CC.Tpl.def( 'CC.ui.Tree', '<div class="g-tree"><div class="g-panel-body g-panel-body-noheader" id="_scrollor"><ul id="_ctx" class="g-tree-nd-ct  g-tree-arrows" tabindex="1" hidefocus="on"></ul></div></div>' )
      .def( 'CC.ui.TreeItem', '<li class="g-tree-nd"><div class="g-tree-nd-el g-unsel" unselectable="on" id="_head"><span class="g-tree-nd-indent" id="_ident"></span><img class="g-tree-ec-icon" id="_elbow" src="'+CC.Tpl.BLANK_IMG+'"/><img unselectable="on" class="g-tree-nd-icon" src="'+CC.Tpl.BLANK_IMG+'" id="_ico" /><a class="g-tree-nd-anchor" unselectable="on" hidefocus="on" id="_tle"></a></div><ul class="g-tree-nd-ct" id="_bdy" style="display:none;" tabindex="1" hidefocus="on"></ul></li>' )
      .def( 'CC.ui.TreeItemSpacer', '<img class="g-tree-icon" src="'+CC.Tpl.BLANK_IMG+'"/>');

var cbx = CC.ui.ContainerBase;
var spr = cbx.prototype;

/**
 * 树项.
 * @class CC.ui.TreeItem
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.TreeItem', cbx, {
  /**
   * 每个TreeItem都有一个指向根结点的指针以方便访问根结点.
   * @type CC.ui.TreeItem
   */
  root : null,

  ct : '_bdy',

  dragNode : '_head',
  hoverCS : 'g-tree-nd-over g-tree-ec-over',
  splitEndPlusCS : 'g-tree-split-end-plus',
  splitEndMinCS : 'g-tree-split-end-minus',
  splitPlusCS : 'g-tree-split-plus',
  splitMinCS :'g-tree-split-minus',
  splitCS : 'g-tree-split',
  splitEndCS : 'g-tree-split-end',
  nodeOpenCS : 'g-tree-nd-opn',
  nodeClsCS : 'g-tree-nd-cls',
  nodeLeafCS : 'g-tree-nd-leaf',
  loadCS:'g-tree-nd-loading',
  /**
   * 空占位结点样式.
   * @private
   */
  elbowLineCS :'g-tree-elbow-line',

  springCS : 'spring',
  /**
   * 鼠标掠过时添加样式的触发结点id
   * @private
   * @see CC.Base#bindAlternateStyle
   */
  mouseoverNode : '_head',

  /**
   * 鼠标掠过时添加样式目标结点id.
   * @private
   */
  mouseoverTarget : '_head',

  /**@cfg {Boolean} nodes 树结点是否为目录,默认false.*/
  nodes : false,

  clickEvent : 'mousedown',

  clickEventNode : '_head',

  initComponent : function(opt) {
    //
    if(!this.root)
      this.root = this;
    if(this.array && !this.nodes)
      this.nodes = true;

    spr.initComponent.call(this);
    this._ident = this.$$('_ident');
    this._elbow = this.$$('_elbow');
    this._head  = this.$$('_head');

    //文件夹
    if(this.nodes) {
      this.domEvent('dblclick', this.expand, true, null, this._head.view);
      this.domEvent('mousedown', this.expand, true, null, this._elbow.view, false);
    }
    else
      this._head.addClass(this.nodeLeafCS);

    this._decElbowSt(false);
  },
/**
 * 添加小图标.
 * @param {String} cssIcon 图标样式.
 * @param {Object} config  额外信息.
 */
  addIcon : function(icon, cfg){
    var cn = CC.Tpl.$('CC.ui.TreeItemSpacer');
    if(cfg)
      CC.extend(cn, cfg);
    CC.fly(cn).addClass(icon).unfly();
    this.fly(this.titleNode).insertBefore(cn).unfly();
    return this;
  },

  addSpring : function(spring){
    if(spring.view)
      this.follow(spring);
    this.fly(this.titleNode).insertBefore(spring).unfly();
    CC.fly(spring).addClass(this.springCS).unfly();
  },
  
/**
 * 展开/收缩子项.
 * @param {Boolean} expand
 */
  expand : function(b) {
    if(b !== true && b !== false)
      b = !CC.display(this.ct);
    if(this.root.tree.fire('expand', this, b)===false)
      return false;
    this._decElbowSt(b);

    CC.display(this.ct,b);
    this.expanded = b;

    if(this.root.tree.fire('expanded', this, b)===false)
        return false;
  },

  _decElbowSt : function(b) {
    if(arguments.length==0)
      b = CC.display(this.ct);

    var p = this.pCt;
    var last = (!p) || (p.ct.lastChild == this.view);
    var en = this._elbow,
        sepcs = this.splitEndPlusCS,
        semcs = this.splitEndMinCS,
        spcs = this.splitPlusCS,
        smcs = this.splitMinCS;

    if(this.nodes){
      if(!last) {
          if(en.hasClass(sepcs))
            en.delClass(sepcs);
          else if(en.hasClass(semcs))
            en.delClass(semcs);
      }else {
          if(en.hasClass(spcs))
            en.delClass(spcs);
          else if(en.hasClass( smcs))
            en.delClass(smcs);
      }
      if (b) {
        if(!last)
          en.switchClass(spcs, smcs);
        else
          en.switchClass(sepcs, semcs);
        this._head.switchClass(this.nodeClsCS, this.nodeOpenCS);

      } else {
        if(!last)
           en.switchClass(smcs, spcs);
        else
          en.switchClass(semcs, sepcs);
        this._head.switchClass(this.nodeOpenCS, this.nodeClsCS);
      }
      return;
    }
    //leaf
    (last) ?
      en.switchClass(this.splitCS, this.splitEndCS) :
      en.switchClass(this.splitEndCS, this.splitCS);
  },

  add : function(item) {
    var pre = this.children[this.children.length-1];
    spr.add.call(this, item);
    item._decElbowSt();
    item._applyChange(this);
    if(pre){
      pre._decElbowSt();
      pre._applyChange(this);
    }
  },
  /**
   * 该结点发生变动时重组
   * @private
   */
  _applyChange : function(parentNode) {
    //所有事件由据结点的事件监听者接收
    this._applyRoot(parentNode.root);
    this._applySibling();
    this._fixSpacer(parentNode);
    if(this.nodes) {
      this.itemCls = parentNode.root.itemCls;
    }
  },

  _applyRoot : function(root){
    if(this.root === root)
      return;
    this.root = root;
    if(this.nodes){
      var chs = this.children;
      for(var k=chs.length - 1;k>=0;k--){
        if(chs[k].nodes)
          chs[k]._applyRoot(root);
        else chs[k].root = root;
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
      return;
    }

    var ct = this.pCt;
    if(!ct){
      this.previous = this.next = null;
      return;
    }
    c = ct.children, idx = c.indexOf(this);
    this.next = c[idx+1];
    if(this.next)
      this.next.previous = this;
    this.previous = c[idx-1];
    if(this.previous)
      this.previous.next = this;
  },

/**
 * @private
 * 子项点击事件回调,发送clickEvent事件
 */
   clickEventTrigger : function(e){
     this.root.tree.fire('itemclick', this, e);
   },

/**
 * 以深度优先遍历所有子项.
 * @param {Function} callback this为treeItem, 参数为 callback(treeItem, counter), 返回false时终止遍历.
 * @override
 */
  eachH : function(cb, acc){
    var chs = this.children, ch;

    if(acc === undefined) acc = 0;

    for(var i=0,len = chs.length; i<len; i++){
      ch = chs[i];
      if(cb.call(ch, ch, ++acc) === false)
        return false;

      if(ch.nodes)
        if(ch.eachH(cb, acc) === false)
          return false;
    }
  },

/**
 * 遍历查找结点(包括当前结点)
 * @param {String} childId
 * @return {CC.ui.TreeItem}
 */
  findH : function(childId){
    if(this.id === childId)
      return this;

    if(!this.nodes)
       return false;

    var n = false;
    this.eachH(function(){
      if(this.id === childId){
        n = this;
        return false;
      }
    });
    return n;
  },

  remove : function(item) {
    var item = this.$(item);
    var last = this.children[this.children.length-1] == item;
    var pre = item.previous;
    item._applySibling(true);
    spr.remove.call(this, item);

    //如果删除当前选择项,重设选择为空.
    this.root.tree.getSelectionProvider().onItemRemoved(item);

    if(last)
      if(this.size()>0)
        this.children[this.children.length-1]._decElbowSt();
    if(pre)
      pre._applyChange(this);

    return this;
  },
/**
 * @cfg {Boolean} expanded 是否展开结点.
 */
 
  /**
   * 只有在渲染时才能确定根结点
   * @private
   */
  onRender : function(){
    this.root = this.pCt.root;
    this._applySibling();
    spr.onRender.call(this);
    if(this.expanded)
      this.expand(true);
  },

  insert : function(idx, item){
    spr.insert.call(this, idx, item);
    item._applyChange(this);
    item._decElbowSt();
  },

  getSpacerNodes : function() {
    var nd = CC.Tpl.forNode(CC.Tpl['CC.ui.TreeItemSpacer']);
    if(this.root === this)
      return nd;

    var chs = this._ident.view.childNodes,
        fr = document.createDocumentFragment();

    for(var i=0,len=chs.length;i<len;i++){
      fr.appendChild(chs[i].cloneNode(true));
    }

    fr.appendChild(nd);

    return fr;
  },

  _fixSpacer : function(parentNode) {
    var sp = this._ident.view;
    sp.innerHTML = '';
    sp.appendChild(parentNode.getSpacerNodes());
    //是否有连接线依据:父层有往下有兄弟结点
    if(parentNode.next)
      CC.addClassIf(sp.lastChild,parentNode.elbowLineCS);

    if(this.nodes){
      for(var i=0,len=this.size();i<len;i++) {
        this.children[i]._fixSpacer(this);
      }
    }
  }
});

CC.ui.TreeItem.prototype.itemCls = CC.ui.TreeItem;

CC.ui.def('treeitem', CC.ui.TreeItem);

var sprs = CC.ui.ContainerBase.prototype;

var undefined = window.undefined;

CC.create('CC.ui.tree.TreeSelectionProvider', CC.util.SelectionProvider, {

  selectedCS : 'g-tree-selected',

  //@override
  decorateSelected : function(it, b){
    var h = it._head, c = this.selectedCS;
    h.checkClass(c, b);
  },

  isSelected : function(item){
    return item._head.hasClass(this.selectedCS);
  },

  getNext : function(t){
    var s = this.selected, root = this.t.root, n, dir;

    if(!s){
      n = root;
    }else {
      n = s;
      dir = !(n.nodes && n.expanded && n.children.length>0);

      if(!dir)
        //向下
        n = n.children[0];

      while(true){
        if(dir){
          if(!n.next){
              //上溯到顶
              if(n === root){
                n = null;
                break;
              }
              n = n.pCt;
              continue;
          }
          n = n.next;
          if(this.canNext(n))
            break;
        }else if(!this.canNext(n)){
          dir = true;
        }else break;
      }
    }
    return n;
  },

  getPre : function(){
    var s = this.selected, root = this.t.root, n;
    if(!s){
      n = root;
    }else {
      n = s.previous;
      while((!n || !this.canPre(n) || (n.nodes && n.expanded && n.children.length>0)) && n != root){
        if(!n){
          n = s===root ? null : s.pCt;
          break;
        }
        else if(n.nodes && this.canPre(n)){
          n = n.children[n.children.length-1];
        }else n = n.previous;
      }

      if(n===s)
        n = null;
    }
    return n;
  }
});


CC.create('CC.ui.tree.TreeItemLoadingIndicator', CC.ui.Loading, {

  markIndicator : function(){
    this.target._head.addClass(this.target.loadCS);
  },

  stopIndicator : function(){
    var t = this.target;
    t._head.delClass(t.loadCS);
    //@bug reminded by earls @v2.0.8 {@link http://www.bgscript.com/forum/viewthread.php?tid=33&extra=page%3D1}
    if(t.loaded)
      t.expand(true);
  }
});


CC.ui.TreeItem.prototype.indicatorCls = CC.ui.tree.TreeItemLoadingIndicator;

/**
 * @class CC.ui.Tree
 * 树形控件, 可以指定一个根结点root,或者由树自己生成.<br>
 * <pre><code>
  var tree = new CC.ui.Tree({
    root:{
      title:'title of tree'
      // 子项数据
      array:[
        {title:'leaf'},
        {title:'nodes', nodes:true}
      ]
    },
    
    // 展开自动ajax加载
    autoLoad : true,
    parentParamName : 'pnodeid',
    url : 'http://www.example.com/tree'
  });
   </code></pre>
 * @extends CC.ui.ContainerBase
 */

/**
 * @event expand
 * 展开/收缩前发送,可返回false取消操作.
 * @param {CC.ui.TreeItem} treeItem 当前操作的树项.
 * @param {Boolean} expand 指示当前操作是展开或收缩. 
 */
/**
 * @event expanded
 * 展开/收缩后发送
 * @param {CC.ui.TreeItem} treeItem 当前操作的树项.
 * @param {Boolean} expand 指示当前操作是展开或收缩. 
 */
var rootCfg = {
  nodes : true,
  draggable : false,
  itemCls : CC.ui.TreeItem,
  ctype:'treeitem'
};

CC.create('CC.ui.Tree', CC.ui.ContainerBase, {

  ct : '_ctx',
/**
 * @cfg {String} url 设置自动加载子项数据时请求的url.参见{@link #autoLoad}, {@link #parentParamName}.
 */
  url : false,
/**
 * @cfg {Boolean} autoLoad 展开时是否自动加载子项数据,参见{@link #parentParamName}, {@link #url}.
 */
  autoLoad : false,
/**
 * @cfg {String} parentParamName 设置自动加载子项时父结点id提交参数的名称,默认为pid=pCt.id.
 */
  parentParamName : 'pid',

  keyEvent : true,
  
  clickEventTrigger : CC.ui.TreeItem.prototype.clickEventTrigger,

  /**
   * @private
   * 项的选择事件触发结点为视图中指向的id结点.
   */
  clickEventNode : '_head',

  clickEvent : true,

  selectionProvider : CC.ui.tree.TreeSelectionProvider,

  initComponent : function() {
    var arr = CC.delAttr(this, 'array');
    sprs.initComponent.call(this);

    if(!this.root || this.root.cacheId === undefined) {
      var cfg = this.root || this.rootCfg;
      if(cfg)
        delete this.rootCfg;
      this.root = this.instanceItem(CC.extendIf(cfg, rootCfg));
    }
    
    if(this.hideRoot){
      this.root._head.hide();
      delete this.hideRoot;
    }
    
    this.root.tree = this;

    var self = this;
    this.add(this.root);
    this.on('expand', this.onExpand, this);
  },

  /**
   * @private
   * 自动加载功能
   */
  onExpand : function(item, b) {
    //
    // 如果结点已经加载,忽略.
    //
    if(this.autoLoad  && b){
      if(!item.getConnectionProvider()
              .getIndicator()
              .isLoaded()){
        this.loadItem(item);
        return (item.children.length>0);
      }
    }
  },

/**
 * 当autoLoad为true时,结点展开即时加载,也可以调用该方法手动加载子结点
 * 加载子项, 该方法通过子项的connectionProvider来实现载入数据功能.
 * @param {CC.ui.TreeItem} treeItem
 */
  loadItem : function(item){
      var url = this.getItemUrl(item);
      if(url){
        var cp = item.getConnectionProvider(), ind = cp.getIndicator();
        if(!ind.isLoaded() && !ind.isBusy())
          cp.connect(url);
      }
  },

/**
 * 获得子项用于请求数据的url,可重写该方法,自定义请定的URL.
 */
  getItemUrl : function(item){
    var url = CC.templ(this, this.url);
    if(url){
      //@bug reminded by earls @v2.0.8 {@link http://www.bgscript.com/forum/viewthread.php?tid=33&extra=page%3D1}
      //contains '?' already ??
      url+= (url.indexOf('?') > 0 ?'&':'?') + encodeURIComponent(this.parentParamName)+'='+encodeURIComponent(item.id);
    }
    return url;
  },

  $ : function(id){
    return id;
  },

/**
 * 遍历树所有结点(包括深层结点)
 */
  each : function(cb){
    var r = this.root;
    if(cb.call(r, r, 0) !== false)
      return r.eachH(cb, 1);
  },
  // @override fix ie no horizon scrollbar
  setSize : function(w, h){
    sprs.setSize.apply(this, arguments);
    if(w !== false && CC.ie){
      this.getScrollor().setWidth(this.width);
    }
  }
});

CC.ui.def('tree', CC.ui.Tree);

})();