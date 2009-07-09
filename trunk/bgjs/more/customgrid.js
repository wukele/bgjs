/**
 *
 */
CC.create('CCustomRow', CGridRow, {
  customCellCS: 'g-grid-custom-cell',
  initComponent:function(){
  	this.createCustomComponent();
    CGridRow.prototype.initComponent.call(this);
		this.applyCustomComponent();
  },
  
  /**
   * 可重写该方法.
   */
  createCustomComponent: function() {
		this.customComp = new CCheckbox();
  },
  /**
   * 可重写该方法.
   */
  applyCustomComponent : function(){
		var cp = this.customComp, cell = new CGridCell();
		this.follow(cp);
    cell.addClass(this.customCellCS).fly('_tle').append(cp).unfly();
    this.add(cell);
  },
  
  disable : function(b){
  	CGridRow.prototype.disable.call(this, b);
  	this.customComp.disable(b);
  }
});

CC.create('CCustomColumn', CColumn, {
  draggable: false,
  ondropable: false,
  disabledResize: true,
  inherentCS: 'g-grid-custom-hd',
  initComponent: function() {
  	this.createCustomComponent();
    CColumn.prototype.initComponent.call(this);
		this.applyCustomComponent();
  },
  
  createCustomComponent : function(){
  	this.customComp =  new CCheckbox();
  },
  
  applyCustomComponent : function(){
    var chk = this.customComp;
    this.follow(chk);
    this.dom('_tle').appendChild(chk.view);
  },
  
  disable : function(b){
  	CColumn.prototype.disable.call(this, b);
  	this.customComp.disable(b);
  }
});