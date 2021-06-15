class LastStateClass {
	static Verbose = true;
	static LOAD_LAST_STATE = false;
	static SAVE_EACH_GAMESTATE = false;
	static SAVE_ON_F5 = false;
	constructor() {
		let l = localStorage.getItem('lastState');
		logg('lastStateClass created!')
		if (isdef(l) && l !== 'undefined') {
			this.lastState = JSON.parse(l);
			this.history = [this.lastState]; //stack of states
			logg(':::lastState retrieved!', this.lastState.settings.boardFilename)
		} else {
			logg(':::lastState is empty!')
			this.lastState = null;
			this.history = [];
		}

		this.isFirst = true;

	}
	filterState(state) {
		let o = { boardArr: state.boardArr, poolArr: state.poolArr, pool: {} };
		//console.log('filterState state.pool',state.pool)
		for(const k in state.pool){
			let oNew=o.pool[k]={};
			copyKeys(state.pool[k], oNew, {}, ['index', 'key']);
		}
		
		//console.log('result o.pool',o.pool);
		return o;
	}
	filter(g) {
		return {
			randomIndices: g.randomIndices,
			settings: g.settings,
			state: this.filterState(g.state),
		};
		//logg('filter', this.lastState.settings.boardFilename);
	}
	getFirst() { return this.history.length > 0 ? this.history[0] : this.lastState; }
	get() { return this.lastState; }
	save(g, hasSettings) {
		//calc if condition met to warrant save to history!
		let boardArr = g.state.boardArr.filter(x => x !== null);
		hasSettings = hasSettings && boardArr.length > 2;

		let lastState = this.lastState = this.filter(g);
		if (hasSettings) this.history.push(jsCopy(this.lastState));
		console.log('saving to localStorage.lastState:', this.lastState.settings.boardFilename);
		localStorage.setItem('lastState', JSON.stringify(this.lastState));
	}
	downloadHistory() { downloadAsYaml(this.history, 'perlenGames'); }

}
function logg() { if (LastStateClass.Verbose) console.log('lastState: ', ...arguments); }
