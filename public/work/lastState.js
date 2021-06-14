class LastStateClass {
	constructor() {
		let l = localStorage.getItem('lastState');
		console.log('l',l)
		if (isdef(l) && l!=='undefined') {
			console.log(l)
			this.lastState = JSON.parse(l);
			this.history = [this.lastState]; //stack of states
		}else{
			this.lastState = null;
			this.history=[];
		}

		this.isFirst = true;

	}
	filterState(state) {
		let o = { boardArr: state.boardArr, poolArr: state.poolArr, pool: {} };
		copyKeys(state.pool, o.pool, {}, ['index', 'key']);
		return o;
	}
	filter(g) {
		let lastState = this.lastState = {
			randomIndices: g.randomIndices,
			settings: g.settings,
			state: this.filterState(g.state),
		};
	}
	getFirst() { return this.history.length > 0 ? this.history[0] : this.lastState; }
	get() { return this.lastState; }
	saveSettings(g) {
		//only save lastState if board contains at least 3!
		let boardArr = g.state.boardArr.filter(x => x !== null);
		console.log('boardArr', boardArr);
		if (boardArr.length > 2) this.history.push(jsCopy(this.lastState));
		this.saveMove(g)

	}
	saveMove(g) { localStorage.setItem('lastState', JSON.stringify(this.filter(g))); }
	downloadHistory() { downloadAsYaml(this.history, 'perlenGames'); }

}
