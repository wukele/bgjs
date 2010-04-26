CC.create('CC.ui.grid.ContentValidation', CC.util.ValidationProvider, {
	
/**@override */
  decorateValidation : fGo,
  
  decorateCellValidation : function(cell, b, msg){
    cell.checkClass(this.errorCS, !b);
    if(!b)
    	cell.setTip(msg);
    else cell.setTip('');
  },
  
/**@override */
  validator : function(row, collector){
  	var idx=0, 
  	    cols = this.t.pCt.header.children, 
  	    r = true ,
  	    n = this.t.getStoreProvider().isNew(row),
  	    self = this;
  	//
  	row.each(function(){
  		// 只验证修改过的
  		if(n || this.modified){
	  		if(self.validateCell(this, cols[idx].validator)===false && r === true){
	  			r = false;
	  		}
	  	}
	  	idx++;
  	});
  	
  	if(!r) 
  	 collector.push(r);
  	return r;
  },
  
/**
 * @return {Boolean} true | false
 */
  validateCell : function(cell, /**@inner*/ vd){
  	var r = true;
  	if(!vd){
  		vd = this.t.pCt.header.$(cell.pCt.indexOf(cell)).validator;
  	}
  	
		if(vd){
			var msg = vd.call(cell, cell.getValue());
			if(msg !== true)
				r = false;
			this.decorateCellValidation(cell, msg === true, msg);
		}
		return r;
  },
  
  each : function(){
  	var s = this.t.getStoreProvider();
  	s.each.apply(s, arguments);
  }
});
CC.ui.grid.Content.prototype.validationProvider = CC.ui.grid.ContentValidation;