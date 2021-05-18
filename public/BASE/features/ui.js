
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
	dLeiste = mDiv(dParent,{ 'min-width':2, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' },'dLeiste');
}
function initAux() {
	dAux = mBy('dAux');
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
function mMagnify(img, path) {
	if (isdef(MAGNIFIER_IMAGE) && MAGNIFIER_IMAGE.src == path) {
		console.log('schon offen!!!')
		return;
	}
	let center = getCenter(img);
	//console.log('center', center);
	let img1 = MAGNIFIER_IMAGE = mImg(path, document.body, { position: 'absolute',left:0,top:0 });
}
function mCancelMagnify(img, path) {
	if (isdef(MAGNIFIER_IMAGE)) {MAGNIFIER_IMAGE.remove(); MAGNIFIER_IMAGE=null;}
}
//#endregion

function setTitle(s) { mBy('hTitle').innerHTML = s; }
function setSubtitle(s) { mBy('dSubtitle').innerHTML = s; }


