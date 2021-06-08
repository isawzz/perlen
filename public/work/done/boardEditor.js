class FileUploadForm {
	constructor(dParent, title, route, onSubmit) {
		this.dParent = dParent;
		this.title = title;
		this.route = route;
		this.onSubmit = onSubmit;
		let id = this.id = getUID();
		this.uploadUrl = SERVERURL + route;
		this.createHtml(route)
	}

	bretter(){this.createHtml('bretter');}
	perlen(){this.createHtml('perlen');}
	createHtml(route){
			// <p>${this.title}!</p>
			let elem = createElementFromHTML(`
		<div>
			<form action="/${route}" enctype="multipart/form-data" method="post">
				<input type="file" name="${route}" accept='image/*' multiple>
				<input type="submit" value="Upload">
			</form>  
		</div>
		`);
		mAppend(this.dParent,elem);
	}

}

function updatePreviewImages(dParent, files) {
	for (const f of files) {
		let sz = 200;
		let d = mDiv(dParent, { display: 'inline', w: sz, h: sz });
		updatePreviewImage(d, f, sz);
	}
}
function updatePreviewImage(dParent, file, sz = 768) {
	const url = URL.createObjectURL(file);
	dParent.innerHTML = `<img src="${url}" height=${sz}/>`;
}
