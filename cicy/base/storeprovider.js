/**
 * @name CC.util.StoreProvider
 * @class
 */
CC.util.ProviderFactory.create('Store', null, {
/**
 * 
 */
  modifyUrl : false,
/**
 * 
 */  
  addUrl  : false,
/**
 * 
 */  
  delUrl : false,
  
  updateIdOnAdd : true,
/**
 * @type {Object}
 @example
  shareParams : {appName:'cicy'}
 */
  shareParams : false,
/**
 * 
 */  
  setupUrlFromItem : true,

/**
 * 
 */
  isResponseOk : function(ajax){
    return (CC.util.StoreProvider.isResponseOk && 
            CC.util.StoreProvider.isResponseOk(ajax))
           || true;
  },
  
/**
 * @private
 */  
  createAsycQueue : function(name){
    this[name+'Queue'] = new CC.util.AsynchronizeQueue(this[name+'QueueCfg']);
    if( this[name+'QueueCfg'] )
      delete this[name+'QueueCfg'];
  },
/**
 * 
 */
  getDelQueue : function(){
    if(!this.delQueue){
      this.createAsycQueue('del');
    }
    return this.delQueue;
  },
/**
 * 
 */  
  getSaveQueue : function(){
    if(!this.saveQueue){
      this.createAsycQueue('save');
    }
    return this.saveQueue;
  },


/**
 * @private
 */
  mappingUrl : function(url, item){
    if(url){
      //query data from share object
      if(this.shareParams)
        url = CC.templ(this.shareParams, url, 2, true);
      // query data from item
      if(item && this.setupUrlFromItem)
        url = CC.templ(item, url, 0, true);
    }
    return url;
  },
  
/**
 * http://www.example.com/del.jsp?itemId={id}
 */
  getDelUrl : function(item){
    return this.mappingUrl(this.delUrl, item);
  },
/**
 * getpost data for item deleting
 */
  getDelQuery : function(item){
    var q = '';
    if(item){
    	q = this.itemQueryTempl || '';
      
      if(this.shareParams)
        q = CC.templ(this.shareParams, q, 2, true);
          
      // query data from item
      // query data from item
      if(q)
        q = CC.templ(item, q, 0, true);
    }
          //query data from share object
    if(this.shareParams){
     if(q){
       q += '&';
     }
     q += CC.queryString(this.shareParams);
    }
    return q;
  },
/**
 * 
 */  
  getSaveUrl : function(item, isNew){
    return this.mappingUrl(isNew?this.addUrl:this.modifyUrl, item);
  },
/**
 * 
 */  
  onSaveFail : fGo,
/**
 * 
 */  
  beforeDel : function(item){
    return this.t.getValidationProvider().isInvalid(item, 'del')===false;
  },
/**
 * 
 */  
  del : function(item){
    if(item && this.isNew(item)){
      item.pCt.remove(item);
      item.destory();
    }else if(this.beforeDel(item) !== false 
      && this.t.fire('store:beforedel', item, this) !== false){
      this.onDel(item);
    }
    return this;
  },
  
  
  
/**
 * 
 */  
  delAll : function(){
    var self = this;
    this.each(function(){
      self.del(this);
    });
  },
/**
 * 
 */
  delSelection : function(){
    var self = this;
    CC.each(this.t.getSelectionProvider().getSelection(), function(){
      self.del(this);
    });
  },

  
/**
 * 
 */
  onDel : function(item){
    CC.Ajax.connect({
      url:this.getDelUrl(item),
      method : 'POST',
      data : this.getDelQuery(item),
      caller : this,
      success:function(j){
        if(this.isResponseOk(j)) {
          this.afterDel(item);
          this.t.fire('store:afterdel', item, j, this);
        }else j.failure.call(j.caller, j);
      },
    
      failure : function(j){
        this.onDelFail(item, j);
        this.t.fire('store:delfail', item, j, this);
      },
      
      onfinal : function(){
        this.getDelQueue().decrease();
      }
    });
    this.getDelQueue().increase();
  },
  
  onDelFail : fGo,
/**
 * 
 */
  afterDel : function(item){
    if(item){
      item.pCt.remove(item);
      item.destory();
    }
  },
/**
 * 
 */
  save : function(item){
    var isNew = this.isNew(item),
        isMd  = this.isModified(item);
    if(isMd){    	
      if(this.beforeSave( item, isNew)!== false && 
           this.t.fire('store:beforesave', item, isNew, this)!==false){
        this.onSave(item, isNew);
     }
    }
    return this;
  },

/**
 * 过滤未修改过的
 * @override
 */
	each : function(cb){
		var self = this;
		if(this.filterChanged){
			this.t.each(function(){
				if(self.isModified(this)){
					cb.apply(this, arguments);
				}
			});
		}else CC.util.StoreProvider.prototype.each.apply(this, arguments);
	},
	
/**
 * 
 */
  saveAll : function(uncheck){
  	if(!uncheck){
  		if(this.t.getValidationProvider().validateAll() !== true)
  			return this;
  	}
    var self = this;
    this.each(function(){
      self.save(this, true);
    });
    
    return this;
  },
/**
 * @return {CC.ui.Item}
 */
  createNew : function(itemOption, scrollIntoView){
    var item = this.t.instanceItem(itemOption);
    this.decorateNew(item, true);
    this.t.layout.add(item);
    if(scrollIntoView) {
      item.scrollIntoView( this.t.getScrollor() );
    }
    return item;
  },
  
/**
 * @protected
 */
  beforeSave : function(item, isNew){
    return this.t.getValidationProvider().isInvalid(item, 'save')===false;
  },
/**
 * 
 */
  onSave : function(item, isNew){
      CC.Ajax.connect({
        url : this.getSaveUrl(item, isNew),
        method : 'POST',
        caller : this,
        data : this.queryString(item),
        success:function(j){
          if(this.isResponseOk(j)) {
            this.decorateModified(item, false);
            
            if(isNew)
              this.decorateNew(item, false);
            
            this.afterSave(item, isNew, j);
            this.t.fire('store:aftersave', item, isNew, j, this);
          }else j.failure.call(j.caller, j);
        },
        
        failure : function(j){
          this.onSaveFail(item, isNew, j);
          this.t.fire('store:savefail', item, isNew, j, this);
        },
        
        onfinal : function(){
          this.getSaveQueue().decrease();
        }
      });
      this.getSaveQueue().increase();
  },
  
/**
 * @name CC.util.StoreProvider#updateIdOnAdd
 * @property {Boolean} [updateIdOnAdd=true]
 */
  afterSave  : function(item, isNew, ajax){
    if(isNew && this.updateIdOnAdd)
      item.id = this.getCreationId(ajax);
  },
/**
 * 
 */
  getCreationId : function(ajax){
    return (ajax.getText()||'').trim();
  },
  
/**
 * @protected
 */
  decorateNew : function(item, b){
    if(item)
      item.newed = b;
    return this;
  },
/**
 * @protected
 */
  decorateModified : function(item, b){
    if(item)
      item.modified = b;
    return this;
  },

/**
 * 
 */
  isModified : function(item){
    return item ? item.modified : false;
  },
/**
 * 容器数据是否被修改过.
 */
  isModifiedAll : function(){
  	var self = this, md = false;
  	this.each(function(){
  	  if(self.isModified(this)){
  	  	md = true;
  	  	return false;
  	  }
  	});
  	return md;
  },
  
/**
 * 
 */
  isNew : function(item){
    return item ? item.newed : false;
  },

/**
 * @name CC.util.StoreProvider#shareParams
 */ 

/**
 * @name CC.util.StoreProvider#itemQueryTempl
 */ 
 
/**
 * 
 */
  queryString : function(item){
    var q = '';
    if(item){
    	q = this.itemQueryTempl || '';
      //query data from share object
      if(this.shareParams)
        q = CC.templ(this.shareParams, q, 2, true);
      
      // query data from item
      if(q)
        q = CC.templ(item, q, 0, true);
       
      q = this.getItemQuery(item, q);
    }
    if(this.shareParams)
     if(q){
       q += '&';
     }
     q += CC.queryString(this.shareParams);
    return q;
  },
  
/**
 * 如果自定义子项的提交参数内容,可重写该方法
 * @param {CC.Base}
 * @param {String} itemQueryTemplateString
 * @return {String}
 */
  getItemQuery : fGo
});