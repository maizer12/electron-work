const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const Unrar = require('unrar')

const files = fs.readdirSync(path.join(__dirname, 'files'))
const videos = fs.readdirSync(path.join(__dirname, 'video'))

const rrwebPlayer = require('rrweb-player')

const goPlay = name => {
	const data = require(path.join(__dirname, 'video', name))
	const playerDom = document.querySelector('.player')
	playerDom.innerHTML = ''
	try {
		const player = new rrwebPlayer({
			target: playerDom,
			props: {
				events: data,
			},
		})
		player.play()
	} catch {
		console.log('Файл поврежден')
	}
}
contextBridge.exposeInMainWorld('api', {
	readAllName: () => {
		const fileDom = document.querySelector('.archive-items')
		const jsonDom = document.querySelector('.json-items')
		const numArchive = document.querySelector('.info-archives')
		const numVideos = document.querySelector('.info-json')
		fileDom.innerHTML = ''
		jsonDom.innerHTML = ''
		if (files.length) {
			files.forEach(name => {
				fileDom.innerHTML += `<li class='sidebar-item'>${name}</li>`
			})
		} else {
			fileDom.innerHTML += `<li class='sidebar-item'>Not files</li>`
		}
		if (videos.length) {
			videos.forEach(name => {
				jsonDom.innerHTML += `<li class='sidebar-item sidebar-item-video'>${name}</li>`
			})
		} else {
			jsonDom.innerHTML += `<li class='sidebar-item'>empty</li>`
		}
		numArchive.textContent = files.length
		numVideos.textContent = videos.length
	},
	getJsonFormat: () => {
		const fileDom = document.querySelector('.json-items')
		const numVideos = document.querySelector('.info-json')
		fileDom.innerHTML = ''
		files.forEach((elemName, ind) => {
			const archivePath = path.join(__dirname, 'files', elemName)
			const archive = new Unrar(archivePath)
			archive.list(function (err, entries) {
				entries.forEach((e, i) => {
					const stream = archive.stream(e.name)
					const fileName = 'video' + (i + 1) + '(' + elemName + ')' + '.json'
					const outputPath = path.join(__dirname, 'video', fileName)
					stream.pipe(require('fs').createWriteStream(outputPath))
					stream.on('error', console.error)
					fileDom.innerHTML += `<li class='sidebar-item sidebar-item-video'>${fileName}</li>`
				})
			})
			const videos = fs.readdirSync(path.join(__dirname, 'video'))
			numVideos.textContent = videos.length
		})
	},
	openVideo: e => {
		const elem = e
		const active = document.querySelector('.active-sidebar-item')
		if (elem.classList.contains('sidebar-item-video')) {
			active?.classList.remove('active-sidebar-item')
			elem.classList.add('active-sidebar-item')
			goPlay(elem.textContent)
		}
	},
	clearVideo: () => {
		const folderPath = path.join(__dirname, 'video')
		const jsonDom = document.querySelector('.json-items')
		const numVideos = document.querySelector('.info-json')
		const playerDom = document.querySelector('.player')
		fs.readdir(folderPath, (err, files) => {
			if (err) {
				console.error('Ошибка при чтении содержимого папки:', err)
				return
			}
			files.forEach(file => {
				const filePath = path.join(folderPath, file)
				fs.unlink(filePath, err => {
					if (err) {
						console.error(`Ошибка при удалении файла ${filePath}:`, err)
					} else {
						//console.log(`Файл ${filePath} успешно удален`)
						playerDom.innerHTML = ''
						jsonDom.innerHTML = `<li class='sidebar-item'>empty</li>`
						numVideos.textContent = 0
					}
				})
			})
		})
	},
})
//if (ind === files.length - 1) {
//fileDom.innerHTML = ''
//const files = fs.readdirSync(path.join(__dirname, 'video'))
//files.forEach(name => {
//})
//}
//fileDom.innerHTML = `<li class="sidebar-item anim-item">Loading..</li>`
