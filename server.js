const fs = require("fs")
const http = require("http")
const path = require("path")
const socketIO = require("socket.io")

const server = http.createServer()
const io = socketIO(server)
const port = 3000

// Mapa para rastrear o número de réplicas de cada arquivo
const replicasMap = new Map()

// Rota para o modo depósito
io.on("connection", (socket) => {
	console.log("Novo cliente conectado.")

	// Evento para depósito de arquivo
	socket.on("depositFile", (fileData) => {
		try {
			const { file, tolerance } = fileData

			if (!file || !tolerance || tolerance <= 0) {
				throw new Error(
					"Requisição inválida. Certifique-se de enviar um arquivo e um valor válido para a tolerância."
				)
			}

			const encodedFilename = encodeURIComponent(file)

			// Verificar se o número de réplicas foi alterado
			if (replicasMap.has(file)) {
				const previousTolerance = replicasMap.get(file)

				if (tolerance > previousTolerance) {
					// Aumentar a quantidade de réplicas
					const diff = tolerance - previousTolerance
					const directories = getAvailableDirectories()

					for (let i = 0; i < diff; i++) {
						const directory = directories[i % directories.length]
						const destinationPath = path.join(directory, encodedFilename)

						mkdirSyncRecursive(directory) // Criar diretório, se não existir

						fs.copyFile(file, destinationPath, (err) => {
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
						const filePath = path.join(directory, encodedFilename)
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
					const destinationPath = path.join(directory, encodedFilename)

					mkdirSyncRecursive(directory) // Criar diretório, se não existir

					fs.copyFile(file, destinationPath, (err) => {
						if (err) {
							console.error(err)
						} else {
							console.log(`Arquivo copiado para ${destinationPath}`)
						}
					})
				}
			}

			// Atualizar o número de réplicas no mapa
			replicasMap.set(file, tolerance)

			// Enviar resposta para o cliente
			socket.emit("depositFileResponse", "Arquivo armazenado com sucesso!")
		} catch (err) {
			console.error(err)
			// Enviar resposta de erro para o cliente
			socket.emit("depositFileResponse", "Erro ao armazenar o arquivo.")
		}
	})

	// Evento para recuperação de arquivo
	socket.on("retrieveFile", (filename) => {
		try {
			if (!filename) {
				throw new Error("Nome do arquivo não fornecido na solicitação.")
			}

			// Lógica para encontrar o arquivo em algum dos locais replicados
			const directories = getAvailableDirectories()

			let found = false
			let fileLocation = null

			directories.forEach((directory) => {
				const filePath = path.resolve(directory, filename)
				if (fs.existsSync(filePath)) {
					fileLocation = filePath
					found = true
				}
			})

			if (found) {
				// Enviar resposta com o caminho do arquivo para o cliente
				socket.emit("retrieveFileResponse", fileLocation)
			} else {
				// Enviar resposta de arquivo não encontrado para o cliente
				socket.emit("retrieveFileResponse", null)
			}
		} catch (err) {
			console.error(err)
			// Enviar resposta de erro para o cliente
			socket.emit("retrieveFileResponse", null)
		}
	})

	// Evento para atualização de réplicas
	socket.on("updateReplicas", (data) => {
		try {
			const { filename, tolerance } = data

			if (!filename || !tolerance || tolerance <= 0) {
				throw new Error(
					"Requisição inválida. Certifique-se de fornecer um nome de arquivo e um valor válido para a tolerância."
				)
			}

			if (replicasMap.has(filename)) {
				const previousTolerance = replicasMap.get(filename)

				if (tolerance !== previousTolerance) {
					// Atualizar o número de réplicas para o arquivo
					replicasMap.set(filename, tolerance)
					socket.emit("updateReplicasResponse", "Número de réplicas atualizado com sucesso!")
				} else {
					socket.emit("updateReplicasResponse", "O número de réplicas já é o mesmo solicitado.")
				}
			} else {
				socket.emit("updateReplicasResponse", "Arquivo não encontrado.")
			}
		} catch (err) {
			console.error(err)
			socket.emit("updateReplicasResponse", "Erro ao atualizar o número de réplicas.")
		}
	})

	// Desconectar cliente
	socket.on("disconnect", () => {
		console.log("Cliente desconectado.")
	})
})

// Função auxiliar para obter os diretórios disponíveis
function getAvailableDirectories() {
	return ["directory1/", "directory2/", "directory3/"] // quantidade de diretórios diferentes fornecidos
}

// Criar diretórios caso não existam
function mkdirSyncRecursive(directory) {
	const pathParts = directory.replace(/\/$/, "").split("/")

	pathParts.reduce((parentDir, childDir) => {
		const curDir = parentDir + childDir + "/"

		if (!fs.existsSync(curDir)) {
			fs.mkdirSync(curDir)
		}

		return curDir
	}, "")
}

// Iniciar o servidor
server.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`)
})
