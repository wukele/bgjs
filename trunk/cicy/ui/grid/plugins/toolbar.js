/**
 * @name CC.ui.grid.plugins.Toolbar
 */
CC.create('CC.ui.grid.plugins.Toolbar', null, /**@lends CC.ui.grid.plugins.Toolbar#*/{
/**
 * �����ָ���¼�������װ�������������
 * @type String
 * @default afteraddcontent
 */
  installWhen : 'afteraddcontent',
/**
 * ָ��Ҫ������������ctype����
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