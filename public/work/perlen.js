
class GPerlen {
	constructor(dParent, N) {

		let perlenItems = isdef(N) ? choose(Perlen, N) : Perlen;
		//perlenItems[0] = Perlen[0];

		[this.perlenItems, this.board] = createPerlenAndFields(dParent, perlenItems);

		//console.log(this.board)

		this.activateDD();

	}
	activateDD() {
		enableDD(this.perlenItems, this.board.fields.filter(x => x.row > 0 && x.col > 0), this.onDropPerle.bind(this), false);
	}
	clone(perle) {
		let clone = {};
		copyKeys(perle, clone, { live: true, div: true });
		return clone;
	}
	remove(perle) {
		let field = perle.field;
		if (isdef(field)) {
			perle.field = null;
			field.item = null;
			iDiv(perle).remove;
		}
	}
	add(perle, field) {
		//what if this perle is on a different field? should I clone it then? NO
		//console.log('addto field', field);
		addItemToField(perle, field, dTable);
	}
	onDropPerle(source, target, isCopy = false) {
		let dSource = iDiv(source);
		let dTarget = iDiv(target);

		//console.log('drop!', '\nperle', source, '\nfield', target, isCopy);
		//was soll jetzt passieren?
		if (!isCopy) {
			this.remove(source);
			this.add(source, target);
		} else {
			let newPerle = this.clone(source);
			let dNew = mImg(perle.path, dTarget, { w: 70, h: 70 });
			iAdd(newPerle, { div: dNew });
			this.add(source, target);
			addDDSource(dNew, false);
		}
	}

}

//#region key handlers, mouse enter exit perle handlerrs
function onEnterPerle(perle) {
	if (IsControlKeyDown) {
		//if (MAGNIFIER_IMAGE) iMagnifyCancel();
		iMagnify(perle);
	}
}
function onExitPerle() { if (IsControlKeyDown) iMagnifyCancel(); }
function keyUpHandler(ev) {
	if (ev.key == 'Control') {
		IsControlKeyDown = false;
		iMagnifyCancel();
	}
}
function keyDownHandler(ev) {

	if (IsControlKeyDown && MAGNIFIER_IMAGE) return;
	if (!MAGNIFIER_IMAGE && ev.key == 'Control') {
		IsControlKeyDown = true;
		let elements = document.querySelectorAll(":hover");
		//console.log('elements under mouse',elements);
		//check if perle is under mouse!
		for (const el of elements) {
			let id = el.id;
			if (isdef(id) && isdef(Items[id]) && Items[id].type == 'perle') {
				iMagnify(Items[id]); return;
			}

		}
	}
}











//#region fitText code 
function simpleFit(text, wmax, hmax, fz) {
	let sz = { h: 10000 };
	while (sz.h > hmax && fz > 8) {
		sz = getSizeWithStyles(text, { w: wmax, fz: fz });
		fz -= 1;
	}
	sz.fz = fz;
	return sz; //returns {w,h,fz}
}


function centerFit(d, child) {
	let bChild = getBounds(child);
	let b = getBounds(d);
	let padding = firstNumber(d.style.padding);
	let wdes = b.width;
	let hdes = b.height;
	let wdesChild = wdes - 2 * padding;
	let hdesChild = hdes - 2 * padding;
	let wChild = bChild.width;
	let hChild = bChild.height;
	let padx = Math.floor(padding + (wdesChild - bChild.width) / 2);
	let pady = Math.floor(padding + (hdesChild - bChild.height) / 2);
	//console.log('\npadding', padding, '\nwdes', wdes, '\nhdes', hdes, '\nwdesChild', wdesChild, '\nhdesChild', hdesChild, '\nwChild', wChild, '\nhChild', hChild, '\npadx', padx, '\npady', pady);
	d.style.padding = pady + 'px ' + padx + 'px';
}
function fitText(text, rect, dParent, styles, classes) {
	let l = rect.cx - (rect.w / 2);
	let t = rect.cy - (rect.h / 2);
	if (dParent.style.position != 'absolute') dParent.style.position = 'relative';
	let d = mDivPosAbs(l, t, dParent);
	styles.display = 'inline-block';
	styles.w = rect.w;
	let fz = 20; if (isdef(styles.fz)) fz = styles.fz;
	let over = textCorrectionFactor(text, styles, rect.w, rect.h, fz); let MAX = 20; let cnt = 0;
	let oldFz = 0; let oldOldFz = 0;
	while (over > 0 && fz >= 8) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }
		//console.log('over',over);
		if (over == 0) break; //perfect font!
		oldOldFz = oldFz;
		oldFz = fz;
		fz = Math.round(fontTransition(fz, over));
		if (oldFz == fz || oldOldFz == fz) break;
		let newOver = textCorrectionFactor(text, styles, rect.w, rect.h, fz);
		over = newOver;
	}
	//console.log(fz)
	d.innerHTML = text;
	mStyleX(d, styles);
	return d;
}
function textCorrectionFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	if (Math.abs(size.h - h) > fz) { return size.h / h; } else return 0;
}
function fitWord(text, rect, dParent, styles, classes) {
	let d = mDiv(dParent)
	styles.display = 'inline-block';
	let fz = rect.h;
	let over = wordCorrectionFactor(text, styles, rect.w, rect.h, fz); let MAX = 20; let cnt = 0;
	let oldFz = 0; let oldOldFz = 0;
	while (over > 0 && fz >= 8) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }
		//console.log('over',over);
		if (over == 0) break; //perfect font!
		oldOldFz = oldFz;
		oldFz = fz;
		fz = Math.round(fontTransition(fz, over));
		//console.log('oldFz', oldFz, 'fz', fz)
		if (oldFz == fz || oldOldFz == fz) break;
		let newOver = wordCorrectionFactor(text, styles, rect.w, rect.h, fz);
		over = newOver;
	}
	//console.log(fz)
	d.innerHTML = text;
	mStyleX(d, styles);
	return d;
}
function wordCorrectionFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	let hFactor = 1; let wFactor = 1;
	if (size.h > h - 1) { hFactor = size.h / h; }
	if (size.w > w - 1) { wFactor = size.w / w; }
	if (size.w < w && size.h < h) return 0;
	else return Math.max(hFactor, wFactor);


}
