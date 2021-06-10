
//#region init UI
function initTable(rect,startingAt=0) {
	let table = mBy('table');
	clearElement(table);
	if (isdef(rect)) mStyleX(table,{wmin:rect.w,hmin:rect.h});

	if (startingAt == 0) initLineTop();
	if (startingAt <= 1) initLineTitle();
	initLineTable();
	initLineBottom();

	dTable = dLineTableMiddle;
	if (startingAt <= 1) dTitle = dLineTitleMiddle;
	//console.log(dTable,dTitle)
}
function initSidebar() {
	let dParent = mBy('sidebar');
	clearElement(dParent);
	// mStyleX(dParent,{bg:colorLighter(BaseColor)});
	// dLeiste = mDiv(dParent,{ 'min-width':2, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' },'dLeiste');
	dLeiste = mDiv(dParent,{ 'min-width':2, display: 'flex', 'flex-flow': 'column wrap' },'dLeiste');
}
function initAux() {
	dAux = mBy('dAux');dAuxContent=mBy('dAuxContent');
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottom = mDiv(dLineBottom); dLineBottom.id = 'lineBottomMiddle';

	mLinebreak(table);
}
//#endregion

//#region MAGNIFY
var MAGNIFIER_IMAGE;
function iMagnifyX(ui, item, pos) {
	let path = item.path;
	if (isdef(MAGNIFIER_IMAGE) && MAGNIFIER_IMAGE.src == path) {
		console.log('schon offen!!!')
		return;
	}else if (isdef(MAGNIFIER_IMAGE)) mCancelMagnify();

	let imgSize = 514,fontSize=24;
	let [w,h,fz]=[imgSize,imgSize+fontSize+10,fontSize];
	let dPresent=MAGNIFIER_IMAGE = mDiv(document.body, { bg:HeaderColor, position: 'absolute',left:0,top:0,w:w,h:h });
	let d=dPresent; //mDiv(dPresent);
	let dText = mText(item.text,d,{color:'white',fz:fz});
	let dImage = mDiv(d,{rounding:'50%',w:w,h:w});
	mCenterCenterFlex(dImage);
	let img1 = mImg(path, dImage,{});

	//let dPresent = mDiv(document.body, { bg:HeaderColor, rounding:'50%', position: 'absolute',left:0,top:0,w:512,h:512 });
	//mContainer(dPresent);
	// let img1 = mImg(path, dPresent,{});
	mCenterCenterFlex(dPresent);

	// let img1 = MAGNIFIER_IMAGE = mImg(path, document.body, { position: 'absolute',left:0,top:0 });

}
function mMagnify(img, item) {
	let path = item.path;
	if (isdef(MAGNIFIER_IMAGE) && MAGNIFIER_IMAGE.src == path) {
		console.log('schon offen!!!')
		return;
	}else if (isdef(MAGNIFIER_IMAGE)) mCancelMagnify();

	let imgSize = 514,fontSize=24;
	let [w,h,fz]=[imgSize,imgSize+fontSize+10,fontSize];
	let dPresent=MAGNIFIER_IMAGE = mDiv(document.body, { bg:HeaderColor, position: 'absolute',left:0,top:0,w:w,h:h });
	let d=dPresent; //mDiv(dPresent);
	d.style.zIndex=100000;
	let dText = mText(item.text,d,{color:'white',fz:fz});
	let dImage = mDiv(d,{rounding:'50%',w:w,h:w});
	mCenterCenterFlex(dImage);
	let img1 = mImg(path, dImage,{});

	//let dPresent = mDiv(document.body, { bg:HeaderColor, rounding:'50%', position: 'absolute',left:0,top:0,w:512,h:512 });
	//mContainer(dPresent);
	// let img1 = mImg(path, dPresent,{});
	mCenterCenterFlex(dPresent);

	// let img1 = MAGNIFIER_IMAGE = mImg(path, document.body, { position: 'absolute',left:0,top:0 });

}
function mCancelMagnify(img, path) {
	if (isdef(MAGNIFIER_IMAGE)) {MAGNIFIER_IMAGE.remove(); MAGNIFIER_IMAGE=null;}
}
function iMagnify(perle){mMagnify(null,perle);}
function iMagnifyCancel(){mCancelMagnify();}
		//magnify on hover
		//magnify richtung oben links
		// ui.onmouseenter = ev => {
		// 	if (ev.ctrlKey) {
		// 		mStyleX(ui, {
		// 			'transform': `scale(2)`,
		// 			'transform-origin': 'bottom right',
		// 		});
		// 		mStyleX(ui.children[1], { fg: 'black', bg: 'white', align: 'center' });
		// 	}
		// };
		// ui.onmouseleave = ev => {
		// 	mRemoveStyle(ui, ['transform', 'transform-origin']);
		// 	mStyleX(ui.children[1], { fg: 'white', bg: 'transparent', });
		// };

//#endregion

function setTitle(s) { mBy('hTitle').innerHTML = s; }
function setSubtitle(s) { mBy('dSubtitle').innerHTML = s; }
function setNewBackgroundColor(bg) {
	if (nundef(bg)) bg = randomDarkColor();
	//bg = 'rgb(192,96,6)';
	BaseColor = bg; HeaderColor = colorDarker(BaseColor); SidebarColor =colorLighter(BaseColor,.125);
	setBackgroundColor(bg);
	mStyleX(dHeader, { bg: HeaderColor });
	//mStyleX(dSubtitle, { fg: colorLighter(bg) });
	mStyleX(mBy('sidebar'), { bg: SidebarColor });
	mStyleX(mBy('dAux'), { bg: SidebarColor });
	localStorage.setItem('BaseColor', BaseColor);
	if (isdef(G)) G.settings.baseColor = bg;
}


