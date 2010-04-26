/**
 * @name CC.ui.grid.StoreProvider
 * @class
 */
CC.create('CC.ui.grid.ContentStoreProvider', CC.util.StoreProvider, /**@lends CC.ui.grid.ContentStoreProvider#*/{
	
	modifyCS : 'g-form-mdy',
/**
 * 是否只提交已更改的行记录,默认为true, false时提交所有行记录.
 */
	filterChanged : true,

/**@override*/
	isModified : function(row){
		var md = false;
		row.each(function(){
			if(this.modified){
				md = true;
				return false;
			}
		});
		return md;
	},
	
/**@override*/
	decorateModified : function(row, b){
		var self = this;
		row.each(function(){
			if(this.modified)
				self.decorateCellModified(this, b);
		});
	},
	
	decorateCellModified : function(cell, b){
   if(cell.modified !== b){
	   cell.checkClass(cell.modifyCS || this.modifyCS, b);
	   cell.modified = b;
   }
	},
	
	createNew : function(opt, scroll){
		if(!opt){
			opt = {array:[]};
			this.t.pCt.header.each(function(){
				opt.array.push({title:''});
			});
		}
		CC.util.StoreProvider.prototype.createNew.call(this, opt, scroll);
	},

/**@override*/
	getItemQuery : function(item, qs){
		var s = [], q, idx=0, chs = item.children;
		this.t.pCt.header.each(function(a, cnt){
			q = this.qid || this.id;
			//query id string
			if(q)
				s[s.length] = q + '=' + encodeURIComponent(chs[cnt].getValue());
		});
		q = s.length?s.join('&') : '';
		if(q){
		  if(!qs) 
		    qs = q;
		  else qs += '&' + q;
		}
		return qs;
	}
});
CC.ui.grid.Content.prototype.storeProvider = CC.ui.grid.ContentStoreProvider;