CTemplate['CDatepicker'] = '<div class="g-datepicker" ><div style="position: relative;"><table cellspacing="0" cellpadding="0" class="entbox"><tbody><tr><td class="headline"><table width="100%" cellspacing="0" cellpadding="1" align="center" class="dxcalmonth"><tbody><tr><td align="left" class="month_btn_left"><span></span></td><td align="center"><table cellspacing="0" cellpadding="0" align="center"><tbody><tr><td><div id="_seltor" class="g-datepicker-selecor" style="display:none;"></div><div id="_planeY" class="planeYear" title="点击选择或直接输入年份值" style="cursor: pointer;">1955</div></td><td class="comma">,</td><td><div id="_planeM" class="planeMonth" title="点击选择或直接输入年份值"></div></td></tr></tbody></table></td><td align="right" class="month_btn_right"><span></span></td></tr></tbody></table></td></tr><tr><td><table width="100%" cellspacing="0" cellpadding="0"class="dxcaldlabel"><tbody><tr><th class="month_spr"><span>月</span></th><th><span>日</span></th><th><span>一</span></th><th><span>二</span></th><th><span>三</span></th><th><span>四</span></th><th><span>五</span></th><th><span>六</span></th><th class="month_spr"><span>月</span></th></tr></tbody></table></td></tr><tr><td id="_monthWrap"></td></tr><tr><td style="text-align:center;padding-bottom:5px;" id="_tdytd"></td></tr></tbody></table></div></div>';

/**
 *
 *@cfg value
 */
CC.create('CDatepicker', CPanel,
function(superclass) {
  var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  //是否闰年
  function isLeapYear(year) {
    return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
  }
  //指定月天数,mm由1开始
  function sumDays(yy, mm) {
    return (mm != 2) ? monthDays[mm - 1] : (isLeapYear(yy)) ? 29 : 28;
  }
  //该月的第一天为星期几
  function firstDayOfMonth(date) {
    var day = (date.getDay() - (date.getDate() - 1)) % 7;
    return (day < 0) ? (day + 7) : day;
  }

  return {

    shadow: true,

    unselectable: true,

    eventable: true,

    value: new Date(),

    mm: null,

    yy: null,

    dd: null,

    initComponent: function() {
      superclass.initComponent.call(this);
      this.monthWrap = this.dom('_monthWrap');
      this.domEvent('click', this.onDayClick, true, null, this.monthWrap);
      this.domEvent('click', this.onYearList, true, null, '_planeY');
      if (this.value) {
        this.setValue(this.value);
      }
      this.todayBtn = new CButton({
        showTo: this.dom('_tdytd'),
        title: '今天'
      });
      this.follow(this.todayBtn);
      this.domEvent('click', this.toToday, true, null, this.todayBtn.view);
    },

    _hideYearSel: function() {
      CC.fly(this.dom('_seltor')).display(false).unfly();
    },

    _selYear: function(yy) {
      this.setValue(new Date(yy, this.mm, 1));
    },

    toToday: function() {
      this.setValue(new Date());
    },

    onYearList: function() {
      var dv = this.dom('_seltor');

      var c = CC.fly(dv);
      c.bindContext().display(true).unfly();

      if (!dv.firstChild) {
        var html = ['<select>'];
        for (var i = 1900; i <= 2100; i++) {
          html.push('<option value="' + i + '">' + i + '</option>');
        }
        html.push('<input type="text" />');
        dv.innerHTML = html.join('');
        html = null;
        var pan = this.fly('_planeY');
        var sz = pan.getSize(),
        sel = dv.firstChild,
        txt = dv.lastChild;
        pan.unfly();
        CC.fly(txt).style('width', sel.offsetWidth).style('height', sel.offsetHeight).unfly();

        this.noUp('click', dv);
        this.domEvent('change',
        function() {
          this._selYear(sel.value);
          this._hideYearSel();
        },
        false, null, sel);
        this.bindEnter(function() {
          var v = parseInt(txt.value.trim());
          if (!isNaN(v)) this._selYear(v);

          this._hideYearSel();
        },
        false, null, txt);
      }

      dv.firstChild.value = this.yy;
      dv.lastChild.value = '';
      (function() {
        dv.lastChild.focus();
      }).timeout(30);
    },
    onDayClick: function(evt) {
      var el = Event.element(evt);
      if (el == this.monthWrap) return;
      var id = CC.tagUp(el, 'TD').id;
      if (id.indexOf('/') > 0) this.setValue(id);
      else this.setValue(new Date(this.yy, parseInt(id), 1));
    },

    setValue: function(v) {
      var pre = this.currentDate;
      if (!CC.isDate(v)) v = new Date(v);

      var yy = v.getFullYear();
      if (isNaN(yy)) {
        console.debug('invalid date :' + v);
        return;
      }

      var mm = v.getMonth(),
      dd = v.getDate();
      if (this.disableFilter) if (this.disableFilter(yy, mm + 1, dd)) return;
      this.yy = yy;
      this.mm = mm;
      this.dd = dd;

      this.currentDate = v;
      this.update(pre);
      this.fire('select', v);
    },

    update: function(preDate) {
      var mm = this.mm + 1,
      yy = this.yy,
      dd = this.dd;

      this.dom('_planeM').innerHTML = mm + '月';
      this.dom('_planeY').innerHTML = yy + '年';
      var mw = CC.fly(this.monthWrap),
      id;
      if (preDate && yy == preDate.getFullYear() && mm == preDate.getMonth() + 1) {
        id = (preDate.getMonth() + 1) + '/' + preDate.getDate() + '/' + preDate.getFullYear();
        CC.delClass(mw.dom(id), 'selday');
      } else this.monthWrap.innerHTML = this.getMonthHtml(this.currentDate);

      id = mm + '/' + dd + '/' + yy;
      var dom = mw.dom(id);
      if (dom) CC.addClass(dom, 'selday');
      mw.unfly();
    },

    getMonthHtml: function(date) {
      var html = [];
      var mm = date.getMonth() + 1,
      yy = date.getFullYear(),
      days = sumDays(yy, mm),
      ct = mm - 1,
      py = date.getFullYear();

      var ny = py;
      var preM = ct == 0 ? 12 : ct;
      if (preM == 12) py -= 1;

      ct = mm + 1;
      var nxtM = ct > 12 ? 1 : ct;
      if (nxtM == 1) ny += 1;

      var fstday = firstDayOfMonth(date);
      var psum = sumDays(py, preM);
      var psd = psum - fstday + 1;
      //sunday, show more days to previous month.
      if (fstday == 0) psd = psum - 6;

      html.push('<table class="dxcaldays"  width="100%" cellspacing="0" cellpadding="0"><tbody>');
      //visible two months
      var state = 0,
      cls = 'preday',
      m = preM,
      y = py,
      df = this.disableFilter;

      for (var i = 0; i < 6; i++) {
        //week days
        html.push('<tr><td class="month_sep" id="' + i + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 1) + '</a></td>');
        for (var j = 0; j < 7; j++) {
          html.push('<td class="' + cls);
          if (j == 6) html.push(' sateday');
          else if (j == 0) html.push(' sunday');

          if (df) if (df(y, m, psd)) html.push(' disabledday');
          html.push('" id="' + m + '/' + psd + '/' + y + '"><a href="javascript:fGo()" hidefocus="on">' + psd + '</a></td>');

          psd++;
          if (psd > psum && state == 0) {
            psd = 1;
            state = 1;
            cls = 'curday';
            m = mm;
            y = yy;
          } else if (state == 1 && psd > days) {
            state = 2;
            psd = 1;
            cls = 'nxtday';
            m = nxtM;
            y = ny;
          }
        }
        html.push('<td class="month_sep month_r" id="' + (i + 6) + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 7) + '</a></td></tr>');
      }
      html.push('</tbody></table>');
      return html.join('');
    }
  };
});