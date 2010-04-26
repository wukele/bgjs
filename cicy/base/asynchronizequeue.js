/**
 * @name CC.util.AsynchronizeQueue
 * @class
 */
CC.create('CC.util.AsynchronizeQueue',null, {
  
  initialize : function(opt){
    
    this.seed = this.seed || 0;
    
    if(opt)
      CC.extend(this, opt);
      
    this.counter = this.seed;
  },
  
  increase : function() {
    this.seed ++;
    if(this.seed > this.counter)
      this.counter = this.seed;
    
    if(this.onincrease)
      this.onincrease.call(this.caller?this.caller:this, this);
  },
  
  decrease : function() {
    this.seed --;
    
    if(this.ondecrease)
      this.ondecrease.call(this.caller?this.caller:this, this);
      
    if(this.seed <= 0 && this.callback){
        this.callback.call(this.caller?this.caller:this, this);
    }
  }
});