CC.Tpl.def('CC.ui.Button', '<table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>');
/**
 * @name CC.ui.Button
 * @class
 * @extends CC.Base
 */
CC.create('CC.ui.Button', CC.Base, function(superclass){
    return /**@lends CC.ui.Button#*/{
        iconNode: '_tle',
        focusNode: '_tle',
        hoverCS: 'g-btn-over',
        clickCS: 'g-btn-click',
        iconCS: 'g-btn-icon',
        focusCS: 'g-btn-focus',
        tip : false,
        disableNode: '_tle',
        innerCS: 'g-btn',
        blockMode: '',

        _onclick: function(){
            if (this.onclick)
                this.onclick.call(this);
        },

        initComponent: function(){
            superclass.initComponent.call(this);
            if (!this.title || this.title == '')
                this.addClass(this.noTxtCS || 'g-btn-notxt');
            this.element = this.dom('_tle');
            this.domEvent('mousedown', this._gotFocus);
            this.domEvent('click', this._onclick);
            if (this.focusCS)
                this.bindFocusStyle(this.focusCS);
            if (this.dockable && this.docked) {
                this.setDocked(true);
            }
        },
/**
 * @param {Boolean} dockOrNot
 */
        setDocked: function(b){
          /**
           * @type Boolean
           */
            this.docked = b;
            this.checkClass(this.clickCS, b);
            return this;
        },

        _gotFocus: function(ev){
            try {
                this.element.focus();
            }
            catch (e) {
            }
        },

        mouseupCallback: function(){
            if (this.dockable) {
                this.docked = !this.docked;
                return this.docked;
            }
        }
    };
});

CC.create('CC.ui.DropButton', CC.ui.Button, {

  downCS : 'g-btn-dwn',
/**
 * @protected
 */
  _onclick : function(e){
    if(this.array)
      this.createMenu();

    if(this.menu){
      CC.Event.stop(e);
      this.showMenu(!!this.menu.hidden);
    }

    CC.ui.DropButton.superclass._onclick.apply(this, arguments);
  },

  showMenu : function(b){
    if(b){
      this.menu.at(this, true);
      this.menu.focus(0);
    }else {
      this.menu.hide();
    }
  },

  decorateDown : function(b){
    this.checkClass(this.downCS, b);
  },
/**
 * array attr will be deleted after creation
 * @private
 */
  createMenu : function(mcfg){
    var
        self = this,
        cfg =
        CC.extendIf(mcfg || this.menuCfg , {
          ctype : 'menu',
          array : this.array,
          width:120,
          showTo: document.body,
        /**
         * 重载CC.ui.Menu.onDisplay方法
         * @private
         */
          onDisplay : function(b){
            self.decorateDown(b);
          }
        });

    delete this.array;

    this.menu = CC.ui.instance(cfg);
    this.menu.render();
  }
});

CC.ui.def('button', CC.ui.Button);
CC.ui.def('dropbutton', CC.ui.DropButton);