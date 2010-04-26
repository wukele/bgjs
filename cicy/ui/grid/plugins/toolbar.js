/**
 * @name CC.ui.grid.plugins.Toolbar
 */
CC.create('CC.ui.grid.plugins.Toolbar', null, /**@lends CC.ui.grid.plugins.Toolbar#*/{
/**
 * 当表格指定事件发生后安装工具栏到表格中
 * @type String
 * @default afteraddcontent
 */
  installWhen : 'afteraddcontent',
/**
 * 指定要创建工具栏的ctype类型
 * @type String
 * @default smallbar
 */
  defCType : 'smallbar',
  
  initialize : function(opt){
    CC.extend(this, opt);
    this.gridEventHandlers = {};
    this.gridEventHandlers[this.installWhen] = this.installUI;
  },
  
  initPlugin : function(g){
  	
  	this.grid = g;
  	
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