/**
 * 与Java swing中的BorderLayout具有相同效果.
 * 将容器内控件作为沿边框布局.
 */
CTemplate['CBorderLayoutSpliter'] = '<div class="g-layout-split"></div>';
CC.create('CBorderLayout', CLayout, function(superclass) {

  var CBorderLayoutSpliter = CC.create(CSpliter, function(spr) {

    return {

      type: 'CBorderLayoutSpliter',

      initComponent: function() {
        this.container = this.layout.wrapper;
        if (this.dir == 'north' || this.dir == 'south') this.disableLR = true;
        else this.disableTB = true;
        spr.initComponent.call(this);
        this.domEvent('dblclick', this.onDBClick);
      },

      onDBClick: function() {
        this.calculateRestrict();
        //this.applyDist(this.min);
      },

      calculateRestrict: function() {
        var ly = this.layout,
        wr = this.container;
        var max, min, dir = this.dir,
        comp = ly[dir],
        cfg = comp.layoutCfg[ly.type],
        lyv = ly.vgap,
        lyh = ly.hgap,
        vg = cfg.gap == undefined ? lyv: cfg.gap,
        hg = cfg.gap == undefined ? lyh: cfg.gap,
        cfg2,
        ch = wr.height,
        cw = wr.width;
        switch (dir) {
        case 'north':
          min = -1 * comp.height;
          max = ch + min - vg;
          if (ly.south) {
            cfg2 = ly.south.layoutCfg[ly.type];
            max -= ly.south.height + (cfg2.gap == undefined ? lyv: cfg2.gap);
          }

          if(max>comp.maxH-comp.height)
          	max = comp.maxH - comp.height;
          if(Math.abs(min)>comp.height - comp.minH)
          	min = -1*(comp.height - comp.minH);
          break;
        case 'south':
          max = comp.height;
          min = -1 * ch + max + vg;
          if (ly.north) {
            cfg2 = ly.north.layoutCfg[ly.type];
            min += ly.north.height + (cfg2.gap == undefined ? lyv: cfg2.gap);
          }
          if(max>comp.height - comp.minH)
          	max = comp.height - comp.minH;
          if(Math.abs(min)>comp.maxH-comp.height)
          	min = -1*(comp.maxH-comp.height);
          break;
        case 'west':
          min = -1 * comp.width;
          max = cw + min - hg;
          if (ly.east) {
            cfg2 = ly.east.layoutCfg[ly.type];
            max -= ly.east.width + (cfg2.gap == undefined ? lyh: cfg2.gap);
          }
          if(max > comp.maxW - comp.width)
          	max = comp.maxW - comp.width;
          if(Math.abs(min)>comp.width - comp.minW)
          	min = -1*(comp.width - comp.minW);
          break;
        case 'east':
          max = comp.width;
          min = -1 * cw + max + hg;

          if (ly.west) {
            cfg2 = ly.west.layoutCfg[ly.type];
            min += ly.west.width + (cfg2.gap == undefined ? lyh: cfg2.gap);
          }
          if(max > comp.width - comp.minW)
          	max = comp.width - comp.minW;
          if(Math.abs(min)>comp.maxW - comp.width)
          	min = -1*(comp.maxW - comp.width);
        }

        if (dir == 'west' || dir == 'east') {
          this.minLR = min;
          this.maxLR = max;
        } else {
          this.minTB = min;
          this.maxTB = max;
        }
      },

      applyDist: function(dt) {
        var c = this.layout[this.dir];
        //this.presize = this.enableH ? c.height:c.width;
        var wr = this.container;
        if (this.disableLR) {
          c.setHeight(this.dir == 'north' ? c.height + dt: c.height - dt);
        } else {
          c.setWidth(this.dir == 'west' ? c.width + dt: c.width - dt);
        }
        this.layout.doLayout();
      },

      onSplitEnd: function() {
        var c = this.layout[this.dir];
        //this.presize = this.enableH ? c.height:c.width;
        var wr = this.container;
        if (this.disableLR) {
          c.setHeight(this.dir == 'north' ? c.height + this.splitDY: c.height - this.splitDY);
        } else {
          c.setWidth(this.dir == 'west' ? c.width + this.splitDX: c.width - this.splitDX);
        }
        this.layout.doLayout();
      }
    };
  });

  return {

    hgap: 7,

    vgap: 7,

    addComponent: function(comp, dir) {
      superclass.addComponent.call(this, comp, dir);
      var d, s;
      if (dir === null || dir === undefined) d = 'center';
      if (typeof dir == 'object') {
        d = dir.dir;
        s = dir.split;
      }

      else d = dir;

      this[d] = comp;

      comp.makePositioned('absolute');
      comp.style('overflow', 'hidden');
      //center component hasn't a separator.
      if (s && d != 'center') {
        var sp = dir.separator = new CBorderLayoutSpliter({
          dir: d,
          layout: this
        });
        if (d == 'west' || d == 'east') sp.addClass(this.separatorVCS || 'g-ly-split-v');
        else sp.addClass(this.separatorHCS || 'g-ly-split-h');
        sp.display(1).appendTo(this.ctNode);
      }

      this.doLayout();
    },

    onLayout: function() {
      var wr = this.container.wrapper;
      var w = wr.getWidth(true),
      h = wr.getHeight(true),
      l = 0,
      t = 0,
      c = this.north;

      var dd, n, sp, vg = this.vgap,
      hg = this.hgap,
      cfg, cg;
      if (c) {
        dd = c.getHeight(true);
        c.setBounds(l, t, w, c.height);
        t += dd;
        cfg = c.layoutCfg[this.type];
        cg = cfg.gap === undefined ? vg: cfg.gap;
        sp = cfg.separator;
        if (sp) {
          sp.setBounds(l, t, w, cg);
        }
        t += cg;
      }

      c = this.south;
      if (c) {
        dd = c.getHeight(true);
        h -= dd;
        c.setBounds(l, h, w, c.height);
        cfg = c.layoutCfg[this.type];
        cg = cfg.gap === undefined ? vg: cfg.gap;
        sp = cfg.separator;
        h -= cg;
        if (sp) sp.setBounds(l, h, w, cg);
      }

      h -= t;

      c = this.east;
      if (c) {
        dd = c.getWidth(true);
        w -= dd;
        c.setBounds(w, t, c.width, h);
        cfg = c.layoutCfg[this.type];
        sp = cfg.separator;
        cg = cfg.gap === undefined ? hg: cfg.gap;
        w -= cg;
        if (sp) sp.setBounds(w, t, cg, h);
      }

      c = this.west;
      if (c) {
        dd = c.getWidth(true);
        c.setBounds(l, t, c.width, h);
        l += dd;
        cfg = c.layoutCfg[this.type];
        cg = cfg.gap === undefined ? hg: cfg.gap;
        sp = cfg.separator;
        w -= dd + cg;
        if (sp) sp.setBounds(l, t, cg, h);
        l += cg;
      }

      c = this.center;
      if (c) {
        c.setBounds(l, t, w, h);
      }
      
      CLayout.prototype.onLayout.call(this);
    },

    removeComponent: function(c) {
      if (!c) return;

      if (arguments.length > 1) {
        var as = CC.$(arguments);
        for (var i = 0, len = as.length; i < len; i++) {
          this.removeComponent(as[i]);
        }
        return this;
      }

      if (CC.isString(c)) {
        c = this[c];
      }

      if (!c.layoutCfg || !c.layoutCfg[this.type]) return this;

      if (c) {
        if (this.east == c) this.east = null;
        else if (this.south == c) this.south = null;
        else if (this.west == c) this.west = null;
        else if (this.center == c) this.center = null;
        else if (this.north == c) this.north = null;
        var cfg = c.layoutCfg[this.type];
        var sp = cfg.separator;
        if (sp) {
          sp.del();
          cfg.separator = null;
        }
        this.doLayout();
      }
      return this;
    },

    detach: function() {
      this.disabled = true;
      this.removeComponent(this.north, this.south, this.east, this.west, this.center);
    }
  };
});

CLayout['border'] = CBorderLayout;
