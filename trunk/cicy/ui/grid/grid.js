(function(){

var CC = window.CC,
    Math = window.Math,
    undefined,
    B = CC.Base,
    C = CC.Cache;
/**
 * @class CC.ui.grid
 * @namespace
 */

/**
 * @class CC.ui.grid.plugin
 * @namespace
 */
 
/**
 * @class CC.ui.grid.Column
 * 表格中的列,包含在表头中.
 */
 
/**@cfg {Boolean} resizeDisabled 是否禁止改变列宽*/

/**
 * @cfg {Function} cellBrush 可以统一设置该列数据的显示数据的具体内容, 返回字符串以innerHTML形式加进表单元格的内容元素中.
 <pre><code>
   header : {array:[ {title:'第一列' , cellBrush : function( v ){ return '<b>'+v+'</b>' } } ]}
 </code></pre>
 * @param {Object} cellValue
 * @return {String}
 */
 
/**
 * @cfg {Function} sortDecorator decorator(order, precolumn)
 */
 
/**
 * @event colwidthchange
 * 列宽改变前发送.
 * @param {Number} columnIndex
 * @param {CC.ui.grid.Column} column
 * @param {Number} width
 * @param {Number} dx 前后改变宽差
 * @member CC.ui.Grid
 */

/**
 * @event aftercolwidthchange
 * 列宽改变后发送.
 * @param {Number} columnIndex
 * @param {CC.ui.grid.Column} column
 * @param {Number} width
 * @param {Number} dx 前后改变宽差
 * @member CC.ui.Grid
 */

/**
 * @event showcolumn
 * 显示或隐藏列后发送
 * @param {Boolean} displayOrNot
 * @param {CC.ui.grid.Column} column
 * @param {Number} columnIndex
 */
 
/**
 * @property locked
 * 列是否已锁定,该属性主要提供给控制列宽的插件,提示该列宽已锁定,将影响自适应宽度的计算,参见{@link lock}.
 * @type Boolean
 */

CC.create('CC.ui.grid.Column', B, function(father){

    return {

        // bdEl,
        resizeDisabled : false,

        sortedCS : 'sorted',
        
        ascCS : 'asc',
        
        descCS :'desc',
        
        sortIndicatorCS : 'sort-icon',
          
        createView : function(){
          this.view = CC.$C({
            tagName:'TD',
            innerHTML : '<div class="hdrcell"></div>'
          });
          
          this.bdEl = this.view.firstChild;
          this.createViewBody(this.bdEl);
        },
/**
 * 创建td内容结点,这里是一个div
 * @private
 */
        createViewBody : function(bd){
          bd.appendChild(CC.$C({
                      tagName: 'span',
                      id: '_tle'
          }));
        },

        onRender : function(){
          //忽略列宽设置(父onRender将设置宽度)
          if(this.width !== false){
            var w = CC.delAttr(this, 'width');
            father.onRender.call(this);
            this.width = w;
          } else {
            father.onRender.call(this);
          }
        },

        cellBrush : function(v){
          return v;
        },

        sortDecorator : function(order, pre){
            this.addClassIf(this.sortedCS);
            
            if(pre && pre !== this &&  !pre.order){
              pre.checkClass(this.descCS, false);
              pre.checkClass(this.ascCS,  false);
            }
            
            var desc = (order === 'desc');
            this.switchClass(
                            desc?this.ascCS:this.descCS, 
                            desc?this.descCS:this.ascCS
                           );
            
            if(this.pCt){
               var decEl = this.pCt._sortDecorateEl;
               if(!decEl){
                 decEl = this.pCt._sortDecorateEl = CC.Tpl.forNode('<span class="'+this.sortIndicatorCS+'"></span>');
               }
               if(decEl.parentNode !== this.bdEl)
                 this.bdEl.appendChild(decEl);
            }
        },
        
/**
 * 此时Column的setWidth不再执行具体的设宽操作,
 * 而是向grid发送一个事件,让其它处理列宽的插件(通常是表头)来执行实际的设宽操作,
 * 这也是有理由的,因为单单一个Column它并不知道全局是如何安排列宽的.
 * 尽管这样,setWidth对话外部来说,还是可以正常调用,它并不影响方法来本的意义,只是
 * 具体操作托管了.
 * @param {Number} width
 * @private
 */
        setWidth : function(w, autoLock){
          var p = this.pCt;
          var pr = this.preWidth, dx;

          dx = !pr ? false : w - pr;

          if(p){
            
            // 锁定列宽,使得列宽改变能正确完成.
            if(autoLock) this.lock(true);
            // 留给事件处理器来设置列宽
            // 并更新this.width
            p.fireUp('colwidthchange', this.pCt.indexOf(this), this, w, dx);
            //
            if(w !== this.width){
              w  = this.width;
              if(dx !== false)
                dx = w - pr;
            }
            p.fireUp('aftercolwidthchange', this.pCt.indexOf(this), this, w, dx);
            
            if(autoLock) this.lock(false);
          }
          // cached the width for init.
          else this.width = w;
          
          this.preWidth = w;
          
          return this;
       },
       
       onShow : function(){
         this.pCt.fireUp('showcolumn', true, this, this.pCt.indexOf(this));
       },
       
       onHide : function(){
         this.pCt.fireUp('showcolumn', false, this, this.pCt.indexOf(this));
       },
       
       locked : 0,
 /**
  * 锁定/解锁列宽,该属性主要提供给控制列宽的插件,提示该列宽已锁定,将影响自适应宽度的计算,参见{@link locked}.
  */
        lock : function(locked){
          locked ? this.locked ++ : this.locked --;
          if(this.locked<0){
            if(__debug) throw 'lock operation failed: locked < 0';
            this.locked = 0;
          }
        }
    };
});

CC.Tpl.def('CC.ui.Grid', '<div class="g-grid"></div>');

/**
 * @class CC.ui.Grid
 * 表,实体主要由 表头(Header) + 内容(Content) + 插件(plugins) 组成.
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Grid', CC.ui.Panel, function(father){

return {
  
  layout:'row',
/**
 * @cfg {Array} plugins 存放表内容的插件,
 * 通过 CC.ui.Grid.prototype.plugins.push(pluginDefinitions) 可以向全局表组件添加一个插件.<br>
 * 插件格式为:
 <pre><code>
  plugins : [
    {
      // name ,名称,以后可通过grid[name]访问插件
      name:'header', 
      // 权重,影响插件初始化顺序
      weight:-100, 
      // 插件类
      ctype:'gridhd'
    },
    
    {name:'content',weight:-80,  ctype:'gridcontent'}
  ]
 </code></pre>
 */
  plugins : [
    {name:'header', ctype:'gridhd'},
    {name:'content',ctype:'gridcontent'}
  ],

  initComponent : function(){

    father.initComponent.call(this);
    
    var pls = this.getInitPlugins();
    
    //初始化插件
    this.plugins = this.addPluginsInner(pls);
  },

  onRender : function(){
    var w = false, h = false;

    // 全部子控件rendered后调用后再设width, height
    if(this.width !== false)
      w = CC.delAttr(this, 'width');

   if(this.height !== false)
      h = CC.delAttr(this, 'height');
      
   father.onRender.call(this);
   
   if(w !== false || h !== false)
    this.setSize(w, h);
  },

// -------------------------------------------------------
//
// 表格插件支持实现,插件是在容器事件模型的基础上的功能扩展
//
// -------------------------------------------------------
  
/**
 * 从对象实例到对象原型链接枚举事件处理函数,并注册到表格中.
 * @param {CC.Base} component
 * @private
 */
  extraRegisterEventMaps : function(comp){
    var maps = CC.getObjectLinkedValues(comp, 'gridEventHandlers', true);
    for(var i=0,len=maps.length;i<len;i++){
      this.attachPluginEventHandlers(comp, maps[i]);
    }
  },
  
/**
 * key as event name, value as event handler
 * @param {CC.Base} component
 * @param {Object} gridEventMap
 * @private
 */
  attachPluginEventHandlers : function(comp, map){
    if(typeof map === 'function')
       map = map(comp);
     
    for(var k in map)
      this.on(k, map[k], comp);
  },

/**
 * 权重值越小越排前
 * @private
 */
  pluginComparator : function(p1, p2){
    var w1 = p1.weight === undefined? p1.ctype? CC.ui.getCls(p1.ctype).prototype.weight:0 : p1.weight;
    var w2 = p2.weight === undefined? p2.ctype? CC.ui.getCls(p2.ctype).prototype.weight:0 : p2.weight;
    if(w1 === w2)
      return 0;
    return w1 < w2 ? -1 : 1;
  },
  
/**
 * 获得将要初始化的插件列表.
 * @private
 * @return {Array} 返回要初始化的插件列表
 */
  getInitPlugins : function(){
    var arrs = CC.getObjectLinkedValues(this, 'plugins'), pls;
    //merge arrays
    if(arrs.length === 1){
      pls = arrs[0];
    }else if(arrs.length === 0){
      return arrs;
    }else {
      pls = [];
      for(var i=0,len=arrs.length;i<len;i++){
        pls = pls.concat(arrs[i]);
      }
    }
    return pls;
  },
/**
 * @event beforeaddPLUGINNAME
 * 在附有UI的插件当UI添加到表格前该事件都会发送,如添加了一个工具条插件,名称为tb,就会发送beforeaddtb.
 * @param {CC.Base} pluginUI 添加到表格的控件,该控件由{@link #initPlugin}返回
 * @param {Object} plugin 当前插件实例
 */
/**
 * @event afteraddPLUGINNAME
 * 在附有UI的插件当UI添加到表格后该事件都会发送,如添加了一个工具条插件,名称为tb,就会发送afteraddtb.
 * @param {CC.Base} pluginUI 添加到表格的控件,该控件由{@link #initPlugin}返回
 * @param {Object} plugin 当前插件实例
 */
/**
 * @event beforeinitPLUGINNAME
 * 在初始化插件前,发送该事件.如一个工具条插件,名称为tb,初始化前就会发送beforeinittb.
 * @param {Object} plugin 当前插件实例
 * @param {CC.ui.Grid} grid
 */
 
/**
 * @event afterinitPLUGINNAME
 * 在初始化插件后,发送该事件.如一个工具条插件,名称为tb,初始化后就会发送afterinittb.
 * @param {Object} plugin 当前插件实例
 * @param {CC.ui.Grid} grid
 */
/**
 * 批量添加插件
 * @private
 * @param {Array} pluginArray 要注册的插件列表
 * @return {Array} 返回实例化后的插件列表,位置一一对应
 */
  addPluginsInner : function(ps){
    // sort
    ps.sort(this.pluginComparator);
    
    var 
       // plugin name
       name, 
       // plugin ctype
       ctype, 
       // plugin config indexed name to grid
       cfgId, 
       // plugin configeration
       opt, 
       // plugin instance
       pl , 
       i, len,
       nps = [];
    // prepare, instance and register events
    for(i=0,len=ps.length;i<len;i++){
      pl   = ps[i];
      name = pl.name;
      cfgId = pl.cfgId || name;
      opt = {};
      // from grid indexed cfgId
      CC.extend(opt, pl);
      CC.extend(opt, CC.delAttr(this, cfgId));
      ctype = opt.ctype;
      // make a reference to grid
      opt.grid = this;
      if(__debug) tester.ok(!!ctype, true);
      opt   = CC.ui.instance(ctype, opt);
      this.extraRegisterEventMaps(opt);
      // new plugin list
      nps[i] = opt;
      //make a reference
      this[cfgId] = opt;
    }

    var rt = [], ui;
    //init
    for(i=0,len=nps.length;i<len;i++){
      pl = nps[i];
      name = pl.name;
      this.fireOnce('beforeinit'+name, pl, this);
      if(pl.initPlugin){
        ui = pl.initPlugin(this);
        if(ui){
          rt.push(name);
          // 插件本身
          if(ui === true)
            ui = pl;
          rt.push(ui);
          rt.push(pl);
        }
      }
      this.fireOnce('afterinit'+name, pl, this);
    }
    // list to add to grid
    if(rt.length){
      for(i=0,len=rt.length;i<len;i+=3){
        this.fireOnce('beforeadd'+rt[i], rt[i+1], rt[i+2]);
        this.layout.add(rt[i+1]);
        this.fireOnce('afteradd'+rt[i], rt[i+1], rt[i+2]);
      }
    }
    
    return nps;
  },


/**
 * 往表格添加一个插件
 * @param {Object} plugin
 */
  addPlugin : function(pl){
    pl = this.addPluginsInner([pl]);
    this.plugins.push(pl[0]);
  },

  destoryPlugins : function(){
    var g = this;
    CC.each(this.plugins, function(){
      if(this.destoryPlugin)
        this.destoryPlugin(g);
    });
  },


  destory : function(){
    this.destoryPlugins();
    father.destory.call(this);
  }
};
});

CC.ui.Grid.SCROLLBAR_WIDTH = 17;

CC.ui.def('grid', CC.ui.Grid);
/**
 * @class CC.ui.grid.Cell
 * 单元格
 * @extends CC.Base
 */
C.register('CC.ui.grid.Cell', function(){
  var td = CC.$C({
    tagName: 'TD',
    className:'grid-td'
  });

  td.appendChild(CC.$C({
    tagName: 'DIV',
    id: '_tle',
    className:'cell'
  }));
  return td;
});

CC.create('CC.ui.grid.Cell', CC.Base, function(father){
return {
  
  // 设为空,内容交给CC.grid.Column填充,也可以非空自定义填充方式
  brush : false,

  getTitleNode : function(){
    return this.view.firstChild;
  },

  // 忽略自身设置标题方式
  setTitle : function(){
    //ignore
    return this;
  }
};
});

/**
 * 表格行
 * @class CC.ui.grid.Row
 * @extends CC.ui.ContainerBase
 */

/**
 * @cfg {String|CC.Base} 指定该列单元格类，未设定时采用CC.ui.grid.Cell 
 * @member CC.ui.grid.Column
 */ 
CC.ui.grid.Column.prototype.colCls = CC.ui.grid.Cell;

C.register('CC.ui.grid.Row', function(){
  return CC.$C({
    tagName: 'TR',
    className: 'grid-row'
  });
});

CC.create('CC.ui.grid.Row', CC.ui.ContainerBase, {

  eventable: false,
  
  brush : false,

  itemCls: CC.ui.grid.Cell,

  hoverCS: 'row-over',
  
  //display:'' 
  blockMode  : 0,
  
  displayMode:3,
  
  createView : function(){
    // deletage to parent container to create row view
    if(this.pCt){
      this.pCt.createRowView(this);
    }else {
      this.view = C.get('CC.ui.grid.Row');
      CC.ui.ContainerBase.prototype.createView.call(this);
    }
  },

  mouseoverCallback: function(e){
    this.pCt.onRowOver(this, e);
  },

  mouseoutCallback: function(e){
    this.pCt.onRowOut(this, e);
  },
  
  /**
   * @param {Array} array
   */
  fromArray: function(array) {
    
    var it, cols = this.pCt.grid.header.children;

    for (var i = 0, len = array.length; i < len; i++) {
      cls = cols[i].colCls;
      if (typeof cls === 'string')
        cls = CC.ui.ctypes[cls];

      it = array[i];
      // already instanced
      if (!it.cacheId){
      
        if(!it.ctype)
          it = CC.extendIf(it);
          
        it = this.instanceItem(it, cls, true);
      }
      
      this.add(it);
    }
    return this;
  },
/**
 * 根据列id获得单元格.
 * @param {String} columnId 列ID
 * @return {CC.ui.grid.Cell}
 */
  getCell : function(colId){
    var hd = this.pCt.pCt.header;
    return this.$(hd.indexOf(hd.$(colId)));
  },

/**
 * 获得或设置列数据.
 * @param {Number} columnIdOrIndex
 * @param {Object} [value] 
 * @return {Object}
 */
  dataAt : function(i, v){
    if(v === undefined) return this.getCell(i).getValue();
    this.getCell(i).setValue(v);
  },
/**
 * 获得或设置列标题.
 * @param {Number} columnIdOrIndex
 * @param {Object} [text]
 * @param {Boolean} update 是否更新到数据视图，此时保证数据视图(GridContent)已创建.
 * @return {String}
 */
  textAt : function(i, v, update){
    if(v === undefined) return this.$(i).getTitle();
    var cell = this.getCell(i);
    cell.setTitle(v);
    if(update) {
      this.pCt.updateCell(cell, v);
    }
  },
  fire:fGo
});

CC.ui.def('gridrow', CC.ui.grid.Row);
})();