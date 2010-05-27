/**
 * @class CC.ui.grid.plugins.Toolbar
 * 表格工具条插件
 */
CC.create('CC.ui.grid.plugins.Toolbar', null, {
/**
 * @cfg {String} installWhen 当表格指定事件发生后安装工具栏到表格中,默认值为afteraddcontent
 */
  installWhen : 'afteraddcontent',
/**
 * @cfg {String} defCType 指定要创建工具栏的ctype类型,默认值为smallbar
 */
  defCType : 'smallbar',
/**
 * @property tb
 * 工具条UI控件.
 * @type {CC.Base}
 */
  tb : false,
  
  initialize : function(opt){
    CC.extend(this, opt);
    this.gridEventHandlers = {};
    this.gridEventHandlers[this.installWhen] = this.installUI;
  },
  
  initPlugin : function(g){
  	
    var tb = this.tb || {};
    
    if(!tb.ctype)
     tb.ctype = this.defCType;
    
    tb.layout = 'tablize';
    this.tb = CC.ui.instance(tb);
  },
  
  installUI : function(){
  	this.grid.fire('beforeadd' + this.name, this.tb, this);
    this.grid.layout.add(this.tb);
    this.grid.fire('afteradd' + this.name, this.tb, this);
  }
});

CC.ui.def('gridtb', CC.ui.grid.plugins.Toolbar);