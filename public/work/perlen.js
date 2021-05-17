
class GPerlen {
	constructor(dParent, N) {

		let perlenItems = isdef(N) ? choose(Perlen, N) : Perlen;

		[this.perlenItems, this.board] = createPerlenAndFields(dParent, perlenItems);

		//console.log(this.board)

		this.activateDD();

	}
	activateDD() {
		enableDD(this.perlenItems, this.board.fields.filter(x=>x.row>0&&x.col>0), this.onDropPerle.bind(this), false);
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