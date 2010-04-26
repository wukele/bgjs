CC.Tpl.def('CC.ui.FolderItem', '<li class="g-unsel"><b id="_ico" class="icos"></b><a id="_tle" class="g-tle"></a></li>')
      .def('CC.ui.Folder', '<div class="g-folder g-grp-bdy"><div class="g-grp-bdy" id="_scrollor"><ul id="_bdy" tabindex="1" hidefocus="on"></ul></div></div>');
/**
 * @name CC.ui.Folder
 * @class
 * @extends CC.ui.ContainerBase
 */
CC.create('CC.ui.Folder', CC.ui.ContainerBase, /**@lends CC.ui.Folder#*/{
  itemCfg : {template : 'CC.ui.FolderItem', hoverCS:'on', icon:'icoNote', blockMode:2},
  keyEvent : true,
  ct : '_bdy',
  clickEvent : true,
  useContainerMonitor : true,
  template:'CC.ui.Folder',
  selectionProvider : true
});

CC.ui.def('folder', CC.ui.Folder);