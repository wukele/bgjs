CTemplate['CBarItem'] = '<table class="g-baritem" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>';
CTemplate['CToolbar'] = '<div class="g-panel"><div class="g-panel-wrap g-bigbar" id="_wrap"></div><div class="g-clear"></div></div>';
CPanel.createBigBar = (function(opt){
	return new CSelectedPanel(CC.extend(
	{
	 itemCallback:true,
	 forceSelect:true,
	 navKeyEvent:false,
	 itemOptions : {
	 	template : 'CBarItem', 
	 	maxH:31,
	 	hoverCS:'g-baritem-over',
		clickCS:'g-baritem-click',
		focusCS:false
	 },
	 height : 38,
	 ItemClass : CButton,
	 template : 'CToolbar'
	}, 
	opt));
});