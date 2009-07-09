CTemplate['CFolderItem'] = '<li class="g-unsel"><b id="_ico" class="icos"></b><a id="_tle" class="g-tle"></a></li>';
CTemplate['CFolder'] = '<div class="g-folder"><div id="_scrollor" class="g-panel-wrap g-grp-bdy"><ul id="_bdy" tabindex="1" hidefocus="on"></ul></div></div>';

CUtil.createFolder = function(opt, type){
	opt = CC.extendIf(opt, {
        itemOptions : {template : 'CFolderItem', hoverCS:'on'},
        navKeyEvent : true,
        container : '_bdy',
				useContainerMonitor : true,
				template:'CFolder',
				scrollor:'_scrollor'
  });
	return new CSelectedContainer(opt);
};