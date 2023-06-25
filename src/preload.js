const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const Unrar = require('unrar')

const files = fs.readdirSync(path.join(__dirname, 'files'))

contextBridge.exposeInMainWorld('api', {
	readAllName: () => {
		const fileDom = document.querySelector('.archive-items')
		fileDom.innerHTML = ''
		if (files.length) {
			files.forEach(name => {
				fileDom.innerHTML += `<li class='sidebar-item'>${name}</li>`
			})
		} else {
			fileDom.innerHTML += `<li class='sidebar-item'>Not files</li>`
		}
	},
	getJsonFormat: () => {
		const fileDom = document.querySelector('.json-items')
		fileDom.innerHTML = ''
		//fileDom.innerHTML = `<li class="sidebar-item anim-item">Loading..</li>`
		files.forEach((elemName, ind) => {
			const archivePath = path.join(__dirname, 'files', elemName)
			const archive = new Unrar(archivePath)
			archive.list(function (err, entries) {
				const stream = archive.stream(entries[0].name)
				const fileName = 'video' + (ind + 1) + '.json'
				const outputPath = path.join(__dirname, 'video', fileName)
				stream.pipe(require('fs').createWriteStream(outputPath))
				stream.on('error', console.error)
				fileDom.innerHTML += `<li class='sidebar-item sidebar-item-video'>${fileName}</li>`
				//if (ind === files.length - 1) {
				//fileDom.innerHTML = ''
				//const files = fs.readdirSync(path.join(__dirname, 'video'))
				//files.forEach(name => {
				//})
				//}
			})
		})
	},
})
