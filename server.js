const fs = require("fs")
const multer = require("multer")
const express = require("express")
const http = require("http")
const path = require("path")
const socketIO = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const port = 3000

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/")
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname)
	},
})

const upload = multer({ storage: storage })

// Mapa para rastrear o número de réplicas de cada arquivo
const replicasMap = new Map()

// Criar diretórios caso não existam
const mkdirSyncRecursive = (directory) => {
	const pathParts = directory.replace(/\/$/, "").split("/")

	pathParts.reduce((parentDir, childDir) => {
		const curDir = parentDir + childDir + "/"

		if (!fs.existsSync(curDir)) {
			fs.mkdirSync(curDir)
		}

		return curDir
	}, "")
}

// Rota para o modo depósito
app.post("/deposit", upload.single("file"), (req, res, next) => {
	try {
		const file = req.file
		const tolerance = parseInt(req.body.tolerance)

		if (!file || !tolerance || tolerance <= 0) {
			throw new Error(
				"Requisição inválida. Certifique-se de enviar um arquivo e um valor válido para a tolerância."
			)
		}

		const encodedFilename = encodeURIComponent(file.originalname)

		// Verificar se o número de réplicas foi alterado
		if (replicasMap.has(file.originalname)) {
			const previousTolerance = replicasMap.get(file.originalname)

			if (tolerance > previousTolerance) {
				// Aumentar a quantidade de réplicas
				const diff = tolerance - previousTolerance
				const directories = getAvailableDirectories()

				for (let i = 0; i < diff; i++) {
					const directory = directories[i % directories.length]
					const destinationPath = directory + encodedFilename

					mkdirSyncRecursive(directory) // Criar diretório, se não existir

					fs.copyFile(file.path, destinationPath, (err) => {
						if (err) {
							console.error(err)
						} else {
							console.log(`Arquivo copiado para ${destinationPath}`)
						}
					})
				}
			} else if (tolerance < previousTolerance) {
				// Diminuir a quantidade de réplicas
				const diff = previousTolerance - tolerance
				const directories = getAvailableDirectories()
				const filesToRemove = []

				directories.forEach((directory) => {
					const filePath = directory + file.originalname
					if (fs.existsSync(filePath)) {
						filesToRemove.push(filePath)
					}
				})

				for (let i = 0; i < diff && i < filesToRemove.length; i++) {
					const fileToRemove = filesToRemove[i]
					fs.unlink(fileToRemove, (err) => {
						if (err) {
							console.error(err)
						} else {
							console.log(`Arquivo removido: ${fileToRemove}`)
						}
					})
				}
			}
		} else {
			// Criar réplicas iniciais
			const directories = getAvailableDirectories()

			for (let i = 0; i < tolerance; i++) {
				const directory = directories[i % directories.length]
				const destinationPath = directory + encodedFilename

				mkdirSyncRecursive(directory) // Criar diretório, se não existir

				fs.copyFile(file.path, destinationPath, (err) => {
					if (err) {
						console.error(err)
					} else {
						console.log(`Arquivo copiado para ${destinationPath}`)
					}
				})
			}
		}

		// Atualizar o número de réplicas no mapa
		replicasMap.set(file.originalname, tolerance)

		res.send("Arquivo armazenado com sucesso!")
	} catch (err) {
		next(err)
	}
})

// Rota para o modo recuperação
app.get("/retrieve", (req, res, next) => {
	try {
		const filename = req.query.filename

		if (!filename) {
			throw new Error("Nome do arquivo não fornecido na solicitação.")
		}

		// Lógica para encontrar o arquivo em algum dos locais replicados
		const directories = getAvailableDirectories()

		let found = false

		directories.forEach((directory) => {
			const filePath = path.resolve(directory, filename)
			if (fs.existsSync(filePath)) {
				res.sendFile(filePath)
				found = true
			}
		})

		if (!found) {
			res.status(404).send("Arquivo não encontrado")
		}
	} catch (err) {
		next(err)
	}
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).send("Ocorreu um erro durante o processamento da solicitação.")
})

// Função auxiliar para obter os diretórios disponíveis
function getAvailableDirectories() {
	return ["directory1/", "directory2/", "directory3/"] // quantidade de diretórios diferentes fornecidos
}

// Iniciar o servidor e o socket.io
server.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`)
})

io.on("connection", (socket) => {
	console.log("Novo cliente conectado.")

	// Escutar eventos personalizados
	socket.on("customEvent", (data) => {
		console.log("Evento personalizado recebido:", data)
	})

	// Emitir eventos personalizados
	socket.emit("customEvent", "Dados do evento personalizado")

	// Desconectar cliente
	socket.on("disconnect", () => {
		console.log("Cliente desconectado.")
	})
})
