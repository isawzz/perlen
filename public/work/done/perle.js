function makePerlenDiv(item, dParent, s, poolOrBoard) {
	//console.log('s', s, '\npoolOrBoard', poolOrBoard, '\ndParent', dParent);
	//console.log('item',item)

	let sz = s.szPerle;
	let margin = poolOrBoard == 'pool' ? 6 : 0;
	let bg = poolOrBoard == 'pool' ? s.bgPool : s.bgBoard;
	let fg = poolOrBoard == 'pool' ? s.fgPool : s.fgBoard;

	let dOuter = mDiv(dParent, { bg: bg, fg: fg, w: sz, h: sz, rounding: '50%', margin: margin });

	let img = mImg(item.path, dOuter, { w: sz, h: s.sz, rounding: '50%' });
	img.onmouseenter = ev => onEnterPerle(item, ev);
	img.onmouseleave = ev => onExitPerle(item, ev);

	//let d2 = mDover(dOuter);
	let dLabel = mText(item.label, dOuter, { fz: s.fzLabel });

	item.type = 'perle'; dOuter.id = iRegisterX(item,'index'); iAdd(item, { div: dOuter, dLabel: dLabel, dImg: img });
	return dOuter;

	if (labelPos[0] == 'b') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 'b') { mAppend(dOuter,dLabel); }//{ dLabel = mText(item.label, dOuter, labelStyles); }

	if (isdef(handler)) dOuter.onclick = ev => handler(ev, item);


	return dOuter;

}





function createPerle(perle, dParent, sz, bg, fg, labelPos, fz) {
	let h = labelPos == 'none' || labelPos == 'hover' ? sz + fz + 6 : sz;
	let d = makePerleDiv(perle,
		{ wmin: sz, h: h, bg: bg, fg: fg, margin: 10 },
		{ w: sz, h: sz }, { wmax: sz * 1.3, hmax: fz + 4, fz: fz },
		labelPos, true);
	mAppend(dParent, d);
	return d;
}
function makePerleDiv1(item, outerStyles, imgStyles, labelStyles, labelPos = null, magnify = true, handler = null) {
	let defOuterStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		padding: 0, box: true
	};
	addKeys(defOuterStyles, outerStyles);

	let dOuter = mCreate('div', outerStyles);

	if (labelPos && nundef(item.label)) { item.label = item.Name.toLowerCase(); }

	let dLabel;
	let [w, h, fz] = [labelStyles.wmax, labelStyles.hmax, labelStyles.fz];
	let sz = simpleFit(item.label, w, h, fz);
	//console.log(sz);
	labelStyles = sz; //dLabel
	dLabel = mTextFit(item.label, { wmax: w, hmax: h }, null, labelStyles);//,['truncate']);

	if (labelPos[0] == 't') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 't') { mAppend(dOuter,dLabel); }// = mText(item.label, dOuter, labelStyles); }

	let x = mImg(item.path, dOuter, imgStyles);

	if (labelPos[0] == 'h') {
		console.log('hallo!!!!!')
		dOuter.position = 'relative';
		//labelStyles.top='50%';
		//labelStyles = simpleFit(item.label, 90, 90, 20);
		labelStyles = { fz: 16, position: 'absolute', hpadding: 5, vpadding: 2 };
		console.log('labelStyles', labelStyles);
		labelStyles.bg = 'black';
		labelStyles.position = 'absolute';
		dLabel = mText(item.label, dOuter, labelStyles);
		//mStyleX(dLabel,{bg:'black',bottom:10,vpadding:10});
		//mClass(dLabel,'showOnHover');
	}

	if (magnify) {
		x.onmouseenter = ev => onEnterPerle(item, ev); // (ev) => { if (ev.ctrlKey) mMagnify(x, item); }
		x.onmouseleave = ev => onExitPerle(item, ev); //() => mCancelMagnify(x, item.path);
	}

	if (labelPos[0] == 'b') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 'b') { mAppend(dOuter,dLabel); }//{ dLabel = mText(item.label, dOuter, labelStyles); }

	if (isdef(handler)) dOuter.onclick = ev => handler(ev, item);

	item.type = 'perle'; dOuter.id = iRegister(item);
	iAdd(item, { div: dOuter, dLabel: dLabel, dImg: x });

	return dOuter;

}
function createPerle_dep(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
	let d = makePerleDiv(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	return d;
}
function makePerleDivOrig(item, outerStyles, imgStyles, labelStyles, labelPos = null, magnify = true, handler = null, useNewImage = false) {
	//labelPos null,'top','bottom'
	//console.log('MMMMMMMMMMMMMMMMMMMMMMMMMMM',magnify)

	let defOuterStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		padding: 0, box: true
	};
	addKeys(defOuterStyles, outerStyles);

	let dOuter = mCreate('div', outerStyles);

	if (labelPos && nundef(item.label)) { item.label = item.Name.toLowerCase(); }

	let dLabel;
	let [w, h, fz] = [labelStyles.wmax, labelStyles.hmax, labelStyles.fz];
	let sz = simpleFit(item.label, w, h, fz);
	//console.log(sz);
	labelStyles = sz; //dLabel
	dLabel = mTextFit(item.label, { wmax: w, hmax: h }, null, labelStyles);//,['truncate']);

	if (labelPos[0] == 't') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 't') { mAppend(dOuter,dLabel); }// = mText(item.label, dOuter, labelStyles); }

	let x;
	imgStyles.rounding = '50%';
	if (useNewImage) {
		//console.log('hhhhhhhhhhhhhhhhhhhh')
		imgStyles.rounding = '50%';
		x = mAppend(dOuter, NEWLY_CREATED_IMAGE);
		mStyleX(x, imgStyles);
	} else {
		x = mImg(item.path, dOuter, imgStyles);
	}
	if (magnify) {
		x.onmouseenter = ev => onEnterPerle(item, ev); // (ev) => { if (ev.ctrlKey) mMagnify(x, item); }
		x.onmouseleave = ev => onExitPerle(item, ev); //() => mCancelMagnify(x, item.path);
	}

	if (labelPos[0] == 'b') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 'b') { mAppend(dOuter,dLabel); }//{ dLabel = mText(item.label, dOuter, labelStyles); }

	if (isdef(handler)) dOuter.onclick = ev => handler(ev, item);

	item.type = 'perle'; dOuter.id = iRegister(item);
	iAdd(item, { div: dOuter, dLabel: dLabel, dImg: x });

	return dOuter;

}
function makePerleDiv_dep(item, outerStyles, imgStyles, labelStyles, labelPos = null, magnify = true, handler = null, useNewImage = false) {
	//labelPos null,'top','bottom'
	//console.log('MMMMMMMMMMMMMMMMMMMMMMMMMMM',magnify)

	let defOuterStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		padding: 0, box: true
	};
	addKeys(defOuterStyles, outerStyles);

	let dOuter = mCreate('div', outerStyles);

	if (labelPos && nundef(item.label)) { item.label = item.Name.toLowerCase(); }

	let dLabel;
	let [w, h, fz] = [labelStyles.wmax, labelStyles.hmax, labelStyles.fz];
	let sz = simpleFit(item.label, w, h, fz);
	//console.log(sz);
	labelStyles = sz; //dLabel
	dLabel = mTextFit(item.label, { wmax: w, hmax: h }, null, labelStyles);//,['truncate']);

	if (labelPos[0] == 't') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 't') { mAppend(dOuter,dLabel); }// = mText(item.label, dOuter, labelStyles); }

	let x;
	imgStyles.rounding = '50%';
	if (useNewImage) {
		//console.log('hhhhhhhhhhhhhhhhhhhh')
		imgStyles.rounding = '50%';
		x = mAppend(dOuter, NEWLY_CREATED_IMAGE);
		mStyleX(x, imgStyles);
	} else {
		x = mImg(item.path, dOuter, imgStyles);
	}
	if (magnify) {
		x.onmouseenter = ev => onEnterPerle(item, ev); // (ev) => { if (ev.ctrlKey) mMagnify(x, item); }
		x.onmouseleave = ev => onExitPerle(item, ev); //() => mCancelMagnify(x, item.path);
	}

	if (labelPos[0] == 'b') dLabel = mText(item.label, dOuter, labelStyles);
	// if (labelPos[0] == 'b') { mAppend(dOuter,dLabel); }//{ dLabel = mText(item.label, dOuter, labelStyles); }

	if (isdef(handler)) dOuter.onclick = ev => handler(ev, item);

	item.type = 'perle'; dOuter.id = iRegister(item);
	iAdd(item, { div: dOuter, dLabel: dLabel, dImg: x });

	return dOuter;

}
function createPerle_dep(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
	let d = makePerlenDivOrig(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	return d;
}
