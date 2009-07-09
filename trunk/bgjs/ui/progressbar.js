CTemplate['CProgressbar'] = '<table class="g-progressbar" cellspacing="0" cellpadding="0" border="0"><tr><td class="g-progress-l"><i>&nbsp;</i><input type="hidden" id="_el" /></td><td class="g-progress-c"><img id="_img" src="http://www.bgscript.com/s.gif" alt=""/></td><td class="g-progress-r"><i>&nbsp;</i></td></tr></table>';
CC.create('CProgressbar', CFormElement, function(father){
	if(!CProgressbar.img)
		CProgressbar.img = 'http://www.bgscript.com/images/progressbar.gif';
	return {
		range : 100,
		value : 0,
		template :'CProgressbar',
		initComponent : function(){
			this.createView();
			if(CProgressbar.img){
				this.img = this.dom('_img');
				this.img.src = CProgressbar.img;
		  }
			//else 
			father.initComponent.call(this);
		},
		
		setValue : function(v){
			if(v>=100){
				CC.fly(this.img).setStyle('width','100%').unfly();
				this.onStop();
				this.fire('progressstop', this);
				return father.setValue.call(this, 100);
			}
			
			CC.fly(this.img).setStyle('width',v+'%').unfly();
			return father.setValue.call(this, v);
		},

		onStop : fGo
	};
});