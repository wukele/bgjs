CC.create('CColumnLayout', CLayout,
function(superclass) {
  return {

    orient: 'lr',

    vgap: 0,

    onLayout: function() {
      var its = this.items,
      c, cfg, t = false;
      if (its.length == 0) return;
      var vg = this.vgap,
      lr = (this.orient == 'lr');
      var w = this.container.wrapper.width - vg * (its.length - 1);
      var l = lr ? 0 : w,
      dd,
      ty = this.type;
      for (var i = 0, len = its.length; i < len; i++) {
        c = its[i];
        cfg = c.layoutCfg[ty];
        //fixed posing
        if (cfg === undefined) {
          dd = c.getWidth(true);
          w -= cfg;
        }
        else if (cfg < 1) dd = Math.floor(cfg * w);
        else {
          w -= cfg;
          dd = cfg;
        }

        if (lr) {
          c.setBounds(l, t, dd, c.height);
          l += dd + vg;
        } else {
          l -= dd;
          c.setBounds(l, t, dd, c.getHeight(true));
          l -= vg;
        }
      }
      CColumnLayout.superclass.onLayout.call(this);
    },

    addComponent: function(c, cfg) {
      superclass.addComponent.call(this, c, cfg);
      this.items[this.items.length] = c;
    },

    removeComponent: function(c) {
      this.items.remove(c);
      this.doLayout();
    },

    detach: function() {
      this.items = null;
      superclass.detach.call(this);
    },

    attach: function(c) {
      superclass.attach.call(this, c);
      this.items = [];
    }
  };
});

CLayout['column'] = CColumnLayout;