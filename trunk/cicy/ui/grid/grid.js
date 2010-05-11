

//~@ui/grid.js
(function(){

var CC = window.CC,
    Math = window.Math,
    undefined,
    B = CC.Base,
    C = CC.Cache;

/**
 * 表格中的列,包含在表头中,表格中所有对列的设宽操作都通过
 * {@link setWidth}方法实现
 * @name CC.ui.grid.Column
 * @class
 */
CC.create('CC.ui.grid.Column', B, function(father){

    return {
        // bdEl,
        
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

/**
 * 可以统一设置该列数据的显示数据的具体内容, 返回字符串以innerHTML形式加进表单元格的内容元素中.
 * @field
 * @scope cell
 * @type Function
 * @param {Object} cellValue
 * @return {String}
 * @example
 <pre>
   header : {array:[ {title:'第一列' , cellBrush : function( v ){ return '<b>'+v+'</b>' } } ]}
 </pre>
 */
        cellBrush : function(v){
          return v;
        },

/**
 * 此时Column的setWidth不再执行具体的设宽操作,
 * 而是向grid发送一个事件,让其它处理列宽的插件(通常是表头)来执行实际的设宽操作,
 * 这也是有理由的,因为单单一个Column它并不知道全局是如何安排列宽的.
 * 尽管这样,setWidth对话外部来说,还是可以正常调用,它并不影响方法来本的意义,只是
 * 具体操作托管了.
 */
        setWidth : function(w){
          var p = this.pCt;

          if(this.resizeDisabled ||
             (p && p.fireUp('befcolwidthchange', p.indexOf(this), this, w) === false))
            return this;

          var pr = this.preWidth, dx;

          dx = !pr ? false : w - pr;

          if(p){
            p.fireUp('colwidthchange', this.pCt.indexOf(this), this, w, dx);
            if(w !== this.width){
              w  = this.width;
              if(dx !== false)
                dx = w - pr;
            }
            p.fireUp('aftercolwidthchange', this.pCt.indexOf(this), this, w, dx);
          }
          // cached the width for init.
          else this.width = w;
          
          this.preWidth = w;
          
          return this;
        }
    };
});

CC.Tpl.def('CC.ui.Grid', '<div class="g-grid"></div>');

/**
 * 表,实体主要由 表头(Header) + 内容(Content) + 插件(plugins) 组成
 */
CC.create('CC.ui.Grid', CC.ui.Panel, function(father){

return {
  layout:'row',
/**
 * 存放表内容的插件,
 * 通过 CC.ui.Grid.prototype.plugins.push(pluginDefinitions) 可以向全局表组件添加一个插件;
 * @type Array
 */
  plugins : [
    {name:'header', weight:-100, ctype:'gridhd'},
    {name:'content',weight:-80,  ctype:'gridcontent'}
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
    if(p1.weight === p2.weight)
      return 0;
    return (p1.weight||0) < (p2.weight||0) ? -1 : 1;
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
 * @name CC.ui.Grid#beforeaddplugin
 * @event
 * @param {CC.Base} pluginUI 添加到表格的控件,该控件由initPlugin返回
 * @param {Object} plugin
 */
/**
 * @name CC.ui.Grid#afteraddplugin
 * @event
 * @param {CC.Base} pluginUI 添加到表格的控件,该控件由initPlugin返回
 * @param {Object} plugin
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
  
/**
 * @private
 */
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
 * 单元格
 * @name CC.ui.grid.Cell
 * @class
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

/**
 * 设为空,内容交给CC.grid.Column填充,也可以非空自定义填充方式
 */
  brush : false,

  getTitleNode : function(){
    return this.view.firstChild;
  },

/**
 * 忽略自身设置标题方式
 * @override
 */
  setTitle : function(t){
    //ignore
    return this;
  },

/**
 * @private
 */
  findBrush : function(){
    if(this.brush)
      return this.brush;
    var b;
    try {
      b = this.pCt.pCt.pCt.header.$(this.pCt.indexOf(this)).cellBrush;
    }catch(e){}
    return b;
  }
};
});

/**
 * @name CC.ui.grid.Row
 * @class
 */
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
    this.view = C.get('CC.ui.grid.Row');
    CC.ui.ContainerBase.prototype.createView.call(this);
  },

  mouseoverCallback: function(e){
    this.pCt.onRowOver(this, e);
  },

  mouseoutCallback: function(e){
    this.pCt.onRowOut(this, e);
  },
/**
 *
 */
  getCell : function(colId){
    var hd = this.pCt.pCt.header;
    return this.$(hd.indexOf(hd.$(colId)));
  },
  
  fire:fGo
});

CC.ui.def('gridrow', CC.ui.grid.Row);
})();