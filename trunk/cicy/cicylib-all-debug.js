﻿/** * Javascript Utility for web development. * 反馈 : www.bgscript.com/forum * @author Rock - javeejy@126.com * www.bgscript.com ? 2010 - 构建自由的WEB应用 */(function(list){	// open debug mode	// window.__debug = false;	var base = window.CICY_BASE;	if(!base){	  var scripts = document.getElementsByTagName('SCRIPT');	  for(var i=0,len=scripts.length;i<len;i++){	    var src = scripts[i].src;	    if(src){	      var idx = src.lastIndexOf("/cicylib-all-debug.js");	      if(idx>=0){	        base = src.substring(0, idx) + '/';	        break;	      }	    }	  }	  if(!base)	    base = 'http://bgjs.googlecode.com/svn/trunk/cicy/';	    	  CICY_BASE = base;	}	  var s = [];  for(var i=0,len=list.length;i<len;i++){    s.push('<script charset="utf-8" type="text/javascript" src="'+base+list[i]+'"></script>');  }  document.write(s.join(''));})(["base/cc.js","base/prototypeext.js","base/cache.js","base/typeconverter.js","base/cssparser.js","base/eventable.js","base/event.js","base/console.js","base/ajax.js","base/cbase.js","base/brushfactory.js","base/d2d.js","base/asynchronizequeue.js","base/tracker.js","ui/container.js","base/dd.js","base/providerbase.js","base/connectionprovider.js","base/selectionprovider.js","base/validationprovider.js","base/storeprovider.js","base/validatorset.js","base/ctddmonitor.js","base/datatranslator.js","ui/layout/borderlayout.js","ui/layout/mixedlayout.js","ui/layout/tablizelayout.js","ui/layout/tabitemlayout.js","ui/shadow.js","ui/loading.js","ui/masker.js","ui/viewport.js","ui/folder.js","ui/button.js","ui/toolbar.js","ui/tab.js","ui/tip.js","ui/titlepanel.js","ui/foldable.js","ui/iframepanel.js","ui/resizer.js","ui/window.js","ui/dialog.js","ui/msgbox.js","ui/menu.js","ui/tree.js","ui/datepicker.js","ui/grid/grid.js","ui/grid/plugins/header.js","ui/grid/plugins/content.js","ui/grid/contentstoreprovider.js","ui/grid/contentvalidationprovider.js","ui/grid/plugins/widthcontrollor.js","ui/grid/plugins/editation.js","ui/grid/plugins/toolbar.js","ui/grid/plugins/pagenation.js","ui/grid/plugins/colresizer.js","ui/grid/plugins/rowchecker.js","ui/grid/plugins/sorter.js","ui/grid/plugins/expandablerow.js","ui/form/form.js","ui/form/formbuilder.js","ui/form/combox.js","ui/form/progressbar.js","ui/form/datepickerfield.js","ui/form/validationprovider.js","ui/form/storeprovider.js"]);