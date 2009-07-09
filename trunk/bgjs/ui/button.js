CTemplate['CButton'] = '<table class="g-btn" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>';

/**
 *@class CButton
 *@extend CBase
 * ∞¥≈•¿‡
 */
CC.create('CButton', CBase,
function(superclass) {
  return {
    iconNode: '_tle',
    focusNode: '_tle',
    hoverCS: 'g-btn-over',
    clickCS: 'g-btn-click',
    iconCS: 'g-btn-icon',
    template: 'CButton',
    focusCS: 'g-btn-focus',
    disableNode: '_tle',
    blockMode: '',
    _onClick: function() {
      if (this.onClick) this.onClick.call(this);
    },

    initComponent: function() {
      superclass.initComponent.call(this);
      if (!this.title || this.title == '') this.addClass(this.noIconCS || 'g-btn-notxt');
      this.element = this.dom('_tle');
      this.domEvent('mousedown', this._gotFocus);
      this.domEvent('click', this._onClick);
      if (this.focusCS) this.bindFocusStyle(this.focusCS);
    },

    _gotFocus: function(ev) {
      this.element.focus();
    }
  };
});

CFormElement['button'] = CButton;