class FileUploadForm {
	constructor(dParent, title, route, onSubmit, hasText=false) {
		this.dParent = dParent;
		this.title = title;
		this.route = route;
		this.onSubmit = onSubmit;
		this.hasText=hasText;
		let id = this.id = getUID();
		this.uploadUrl = SERVERURL + route;
		this.createHtml(id);
		this.addEventHandlers();
	}
	getImageInput() { return mBy('dImage' + this.id); }
	getTextInput() { return mBy('dText' + this.id); }
	getSubmitButton() { return mBy('dSubmit' + this.id); }
	getPreview() { return mBy('dPreview' + this.id); }
	addEventHandlers() {
		let imageInput = this.getImageInput();
		let submitButton = this.getSubmitButton();
		let textInput = this.getTextInput();
		let preview = this.getPreview();
		let route=this.route;
		imageInput.addEventListener('change', (e) => {
			const [file] = imageInput.files;
			updatePreviewImage(preview, file);
		});

		submitButton.addEventListener('click', async (e) => {
			e.preventDefault();
			const [file] = imageInput.files;
			if (!file) { if (isdef(this.onSubmit)) this.onSubmit(null); return;}//throw new Error('File was not selected'); }
			console.log({ file });
			const formData = new FormData();
			file.TAG = route;
			formData.append(route, file);
			formData.append('myText', textInput.value || 'empty text');
			const response = await fetch(this.uploadUrl, {
				method: 'POST',
				body: formData,
			});
			if (isdef(this.onSubmit)) this.onSubmit(file.name);
		});

	}
	createHtml() {
		this.formElement = createElementFromHTML(`
			<form id='dForm${this.id}'>
				<h4>${this.title}</h4>
				<input id="dText${this.id}" type="text" name="myText" />
				<br />
				<input id="dImage${this.id}" type="file" name="${this.route}" accept="image/*" />
				<br />
				<input id="dSubmit${this.id}" type="submit" value="click to upload!" />
				<hr />
				<h4>Preview</h4>
				<div id="dPreview${this.id}"></div>
			</form>
		`);
		let form = mAppend(this.dParent, this.formElement);
		console.log('form',form)
		if (!this.hasText){hide(form.children[1]);}
	}
}

function updatePreviewImage(dParent, file) {
	const url = URL.createObjectURL(file);
	dParent.innerHTML = `<img src="${url}" height=768/>`;
}
