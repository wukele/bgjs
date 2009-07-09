/**
 * ÿ�������ö���һ�����Ա༭����֮��Ӧ
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
     * ����������������Ϣ��󶨺�,�Ϳɵ���applyComponent�Ϳ����ɿؼ��༭��
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
		 * ����ؼ�������Ϣ,�������Ա༭��ͼ
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