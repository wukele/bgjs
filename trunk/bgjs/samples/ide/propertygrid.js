/**
 * 每个类配置都有一个属性编辑器与之对应
 * 
 */
CC.create('CAttributeView', CGridGroupView, function(superclass){
	return {
		keyCS : 'cell-k',
		valueCS : 'cell-v',
    initComponent : function(){
    	superclass.initComponent.call(this);
    	if(this.propertySet)
    		this.bindPropertySet(this.propertySet);
    },
    
    /**
     * 传入类属生配置信息后绑定后,就可调用applyComponent就可生成控件编辑器
     */
    bindPropertySet : function(cfg){
			var i, len, cell, row, it;
			for(i in cfg){
				it = cfg[i];
				row = new CGridRow();
				this.add(row);
				//name
				row.keyCell = cell = new CGridCell();
				cell.setTitle(it.key).addClass(this.keyCS);
				row.add(cell);
				row.valueCell = cell = new CGridCell();
				cell.addClass(this.valueCS);
				row.add(cell);
				//
				row.vsProperty = it;
				it.vsRow = row;				
			}
			
			this.propertySet = cfg;
    },
    
		/**
		 * 传入控件配置信息,生成属性编辑视图
		 */
		applyComponent : function(comp){
			var i,len,cfg = this.propertySet;
			for(i in cfg){
				if(cfg[i].applyComponent)
					cfg[i].applyComponent(comp);
			}
		}
	};
});