const io = require("socket.io-client")
const fs = require("fs")

// URL do servidor Socket.IO
const serverURL = "http://localhost:3000"

// Conectar ao servidor
const socket = io(serverURL)

// Evento de conexão estabelecida
socket.on("connect", () => {
	console.log("Conexão estabelecida com o servidor.")

	// Modo depósito
	const fileToDeposit = "arquivo.txt"
	const tolerance = 3

	socket.emit("depositFile", { file: fileToDeposit, tolerance })

	socket.on("depositFileResponse", (response) => {
		console.log("Resposta do modo depósito:", response)
	})

	// Modo recuperação
	const fileToRetrieve = "arquivo.txt"

	socket.emit("retrieveFile", fileToRetrieve)

	socket.on("retrieveFileResponse", (fileStream) => {
		if (fileStream) {
			const destinationPath = `./${fileToRetrieve}`

			fileStream.pipe(fs.createWriteStream(destinationPath))
			console.log(`Arquivo ${fileToRetrieve} recuperado com sucesso.`)
		} else {
			console.log(`Arquivo ${fileToRetrieve} não encontrado.`)
		}
	})

	// Atualizar número de réplicas
	const fileToUpdate = "arquivo.txt"
	const newTolerance = 5

	socket.emit("updateReplicas", { filename: fileToUpdate, tolerance: newTolerance })

	socket.on("updateReplicasResponse", (response) => {
		console.log("Resposta da atualização de réplicas:", response)
	})
})

// Evento de desconexão
socket.on("disconnect", () => {
	console.log("Desconectado do servidor.")
})
