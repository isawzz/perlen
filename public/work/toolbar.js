var Toolbar;
function openToolbar(){
	let d=mBy('dLeiste');
	show(d);
	mStyleX(d,{w:100});
	Toolbar = new ToolbarClass(d);
}

class ToolbarClass{
	constructor(dParent){
		this.dParent = dParent;
		clearElement(dParent);
		this.buttons={};
		this.populate();
	
	}
	addButton(key,handler,caption){
		if (nundef(caption)) caption = key;
		
		let b=this.buttons[key]=mButton(caption,handler,this.dParent,null,null,'b_'+key);
	}
	removeButton(){}
	showButton(){}
	hideButton(){}
	populate(){
		this.addButton('uploadBoard',onClickUploadBoard,'upload board');
		this.addButton('uploadPerlen',onClickUploadPerlen,'upload perlen');
		this.addButton('chooseBoard',onClickChooseBoard,'choose board');
		this.addButton('prefabGallery',onClickPrefabGallery,'prefab gallery');
		this.addButton('editLayout',onClickEditLayout,'EDIT layout');
		this.addButton('activateLayout',onClickActivateLayout,'activate layout');
		this.addButton('clearPerlenpool',onClickClearPerlenpool,'clear perlenpool');
		this.addButton('clearAllPerlen',onClickClearAllPerlen,'clear all perlen');
		this.addButton('clearBoard',onClickClearBoard,'clear board');
		this.addButton('addToPool',onClickAddToPool,'add to pool');
		// this.addButton('addToPool',onClickAddToPool,'add to pool');
		
	}
}










