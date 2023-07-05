###### Redes de computadores
# Projeto Cliente_Servidor 
<p> Este é um projeto que simula o modelo cliente-servidor e
teve a proposta de funcionar em dois modos: i) modo depósito e ii) modo recuperação. No
modo depósito, o cliente informa ao servidor o arquivo a ser armazenado e o nível
de tolerância a falhas requerido, que expressa, em última instância a quantidade
de réplicas que serão armazenadas. O servidor então guarda as “N” cópias do
arquivo em locais (dispositivos) diferentes.</p>

## Como rodar o código
<strong> <h3> Obs: 
- Garanta que as pastas 'directory1', 'directory2' e 'directory3' esteja criada na raiz do sistema, porque sem ela os arquivos não poderão ser salvos;
- Verifique se o 'arquivo.txt' já está armazanado na pasta raiz do sistema, porque é el que será usado como exemplo para ser replicado;
- Garanta que você tenha o [node](https://nodejs.org/en/download) instalado na sua máquina. </h5> </strong>
###### Execute o seguinte comando na pasta do projeto para que os pacotes sejam baixados: <br>
``npm install``
###### Logo em seguida, você precisar rodar primeiro o servidor com o comando: <br>
``npm start`` ou ``node server.js``
###### Agora execute o cliente com o comando: <br>
``node client.js`` ou ``node server.js``

## Como o sistema funciona

<p>O código implementa um sistema de armazenamento e recuperação de arquivos distribuídos usando sockets e o protocolo Socket.IO. Ele consiste em um servidor e um cliente que se comunicam entre si.

Resumo do funcionamento do código:

. O servidor cria um servidor Socket.IO e aguarda conexões de clientes.
. Quando um cliente se conecta, o servidor lida com os eventos de depósito de arquivo, recuperação de arquivo e atualização de réplicas.
. No evento de depósito de arquivo, o servidor recebe um arquivo do cliente e o armazena em uma das várias réplicas disponíveis. Ele mantém um mapa para rastrear o número de réplicas para cada arquivo.
. No evento de recuperação de arquivo, o servidor procura o arquivo nas réplicas disponíveis e retorna o caminho do arquivo para o cliente.
. No evento de atualização de réplicas, o servidor atualiza o número de réplicas para um determinado arquivo, se necessário.
. O cliente se conecta ao servidor e interage com ele em três modos: depósito de arquivo, recuperação de arquivo e atualização de réplicas.
. No modo de depósito de arquivo, o cliente envia um arquivo para o servidor junto com o número de réplicas desejado.
. No modo de recuperação de arquivo, o cliente solicita a recuperação de um arquivo específico ao servidor.
. No modo de atualização de réplicas, o cliente solicita a alteração do número de réplicas de um arquivo específico ao servidor.
. O cliente recebe as respostas do servidor para cada uma das operações e realiza as ações apropriadas, como ler o arquivo recuperado ou exibir mensagens de sucesso ou erro.

Em resumo, o código implementa um sistema de armazenamento e recuperação de arquivos distribuídos, permitindo que os arquivos sejam replicados em vários locais para maior disponibilidade e tolerância a falhas.</p>
