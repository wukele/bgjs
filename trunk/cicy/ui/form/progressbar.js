CC.Tpl.def('CC.ui.form.Progressbar' , '<table class="g-progressbar" cellspacing="0" cellpadding="0" border="0"><tr><td class="g-progress-l"><i>&nbsp;</i><input type="hidden" id="_el" /></td><td class="g-progress-c"><img id="_img" src="http://www.bgscript.com/s.gif" alt=""/></td><td class="g-progress-r"><i>&nbsp;</i></td></tr></table>');
/**
 * @class CC.ui.form.Progressbar
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Progressbar', CC.ui.form.FormElement, function(father){
  if(!CC.ui.form.Progressbar.img)
    CC.ui.form.Progressbar.img = 'http://bgjs.googlecode.com/svn/trunk/cicy/default/ru/progressbar.gif';

  return {
    /**@cfg {Number} range 范围,默认100*/
    range : 100,

    value : 0,

    initComponent : function(){
      this.createView();
      if(CC.ui.form.Progressbar.img){
        this.img = this.dom('_img');
        this.img.src = CC.ui.form.Progressbar.img;
      }
      //else
      father.initComponent.call(this);
    },

    setValue : function(v){
      if(v>=100){
        CC.fly(this.img).fastStyleSet('width','100%').unfly();
        this.onstop();
        this.fire('progressstop', this);
        return father.setValue.call(this, 100);
      }

      CC.fly(this.img).fastStyleSet('width',v+'%').unfly();
      return father.setValue.call(this, v);
    },
/**@cfg {Function} onstop*/
    onstop : fGo
  };
});

CC.ui.def('progressbar', CC.ui.form.Progressbar);