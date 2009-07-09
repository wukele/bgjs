CTemplate['CTitlePanel'] = '<div class="g-panel g-titlepanel"><h3 class="g-titlepanel-hd" id="_tleBar"><a id="_btnFN" class="g-icoFld" href="javascript:fGo()"></a><a id="_tle" class="g-tle" href="javascript:fGo()"></a></h3><div id="_scrollor" class="g-panel-wrap g-titlepanel-wrap"></div></div>';

CC.create('CTitlePanel', CPanel, function(superclass){
    return {
  
				scrollor : '_scrollor',
				
        unselectable : '_tleBar',
        
        template : 'CTitlePanel',
        
        container:'_scrollor',
        
        initComponent: function() {
            superclass.initComponent.call(this);
            //evName, handler, cancel, caller, childId
            this.domEvent(this.toggleEvent || 'mousedown', this._btnFNOnclick, true, null, this.foldNode || '_btnFN');
            //_tleBar
            this.header = this.$$('_tleBar');
            console.debug(this.wrapper);
        },
				
				getWrapperInsets : function(){
				 	return [29 , 0, 0, 0, 29, 0];
				},
				
        //点击收缩图标时触发,可重写自定.
        _btnFNOnclick: function() {
            var v = this.wrapper.display();
            this.fold(v);
        }
        ,
        //b:true or false.
        fold: function(b) {
            this.inspectDomAttr('_btnFN', 'className', b ? this.openCS || 'g-icoOpn' : this.clsCS || 'g-icoFld');
            this.wrapper.display(!b);
            this.folded = b;
        }
    }
});