const io = require("socket.io-client")
const fs = require("fs")

// URL do servidor Socket.IO
const serverURL = "http://localhost:3000"

// Conectar ao servidor
const socket = io(serverURL)

// Evento de conexão estabelecida
socket.on("connect", () => {
	console.log("Conectado ao servidor.")

	// Enviar um arquivo para o servidor
	const file = "file.txt" // Arquivo que deseja enviar
	const tolerance = 3 // Valor de tolerância para o arquivo

	const fileData = {
		file: file,
		tolerance: tolerance,
	}

	socket.emit("depositFile", fileData)
})

// Evento para receber a resposta do servidor
socket.on("depositFileResponse", (response) => {
	console.log("Resposta do servidor:", response)
})

// Evento de desconexão
socket.on("disconnect", () => {
	console.log("Desconectado do servidor.")
})
