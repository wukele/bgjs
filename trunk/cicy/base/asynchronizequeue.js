/**
 * @class CC.util.AsynchronizeQueue
 */

/**
 * @cfg {Object} caller scope object of callbacks.
 */
 
/**
 * @cfg {Function} onincrease
 */

/**
 * @cfg {Function} ondecrease
 */
 
/**
 * @cfg {Function} onempty
 */
 
/**
 * @property waitQueue
 * @type Array
 */

/**
 * @property requestQueue
 * @type Array 
 */
CC.create('CC.util.AsynchronizeQueue',null, {
  
  initialize : function(opt){
    
    this.waitQueue = [];
    
    this.requestQueue = [];
    
    if(opt)
      CC.extend(this, opt);

    // connector cache
    // connector -- > key
    this.connectorKeys = {};
    // key -- > connector
    this.connectors    = {};
    
    this.max = 0;
  },
/**
 * 入队
 * @param {CC.Ajax} connector
 * @return {String} connectorKey uniqued indexed id for this connector
 */
  join : function(connector){
    this.waitQueue.push(connector);
    connector.on('open', this.getConnectorBinder('open'));
    this.max++;
    
    var key = CC.uniqueID().toString();
    this.connectorKeys[connector] = key;
    this.connectors[key] = connector;
    
    if(this.onincrease)
      this.onincrease.call(this.caller?this.caller:this, connector, this);
      
    return key;
  },

/**
 * 出队
 * @param {CC.Ajax} connector
 */
  out : function(connector){
    if(this.waitQueue.indexOf(connector) >= 0){
      this.waitQueue.remove(connector);
      connector.un('open', this.getConnectorBinder('open'));
      this.onOut(connector);
    }else if(this.requestQueue.indexOf(connector) >= 0){
      this.requestQueue.remove(connector);
      connector.un('final',this.getConnectorBinder('final'));
      this.onOut(connector);
    }
  },

/**
 * @param {String} connectorKey
 * @return {CC.Ajax} ajax
 */
  getConnector : function(key){
    return this.connectors[key];
  },

/**
 * 是否请求中
 * @return {Boolean} busy
 */
  isConnectorBusy : function(key){
    var c = this.getConnector(key);
    return c && c.busy;
  },
  
/**
 * 是否已成功返回
 * @return {Boolean} busy
 */
  isConnectorLoaded : function(key){
    var c = this.getConnector(key);
    return c && c.loaded;
  },
  
  // private
  onOut : function(connector){
    
    delete this.connectors[CC.delAttr(connector, this.connectorKeys)];
    
    if(this.ondecrease)
      this.ondecrease.call(this.caller?this.caller:this, connector, this);
      
    if(this.waitQueue.length == 0 && this.requestQueue.length == 0 && this.onempty){
        this.onempty.call(this.caller?this.caller:this, this);
        this.max = 0;
    }
  },

  // private
  getConnectorBinder : function(key){
    var bnds = this.connectorBinders;
    if(!bnds)
      bnds = this.connectorBinders = {};
    var bd = bnds[key];
    if(!bd){
      switch(key){
        case 'final' :
          bd = this.onConnectorFinal.bindAsListener(this);
          break;
        case 'open' :
          bd = this.onConnectorOpen.bindAsListener(this);
          break;
      }
      
      if(bd)
        bnds[key] = bd;
    }
    return bd;
  },

  onConnectorFinal : function(j){
    if(this.onfinal)
      this.onfinal.call(this.caller?this.caller:this, j, this);
    this.out(j);
  },
  
  onConnectorOpen : function(j){
    this.waitQueue.remove(j);
    this.requestQueue.push(j);
    
    if(this.requestQueue.length === 1) {
      if(this.onfirstopen)
        this.onfirstopen.call(this.caller?this.caller:this, j, this);
    }
    
    if(this.onopen)
      this.onopen.call(this.caller?this.caller:this, j, this);
      
    j.on('final',this.getConnectorBinder('final'));
  }
});