###### Redes de computadores
# Projeto Cliente_Servidor 
<p> Este é um projeto que simula o modelo cliente-servidor e
teve a proposta de funcionar em dois modos: i) modo depósito e ii) modo recuperação. No
modo depósito, o cliente informa ao servidor o arquivo a ser armazenado e o nível
de tolerância a falhas requerido, que expressa, em última instância a quantidade
de réplicas que serão armazenadas. O servidor então guarda as “N” cópias do
arquivo em locais (dispositivos) diferentes.</p>

## Como rodar o código
###### Garanta que todos os pacotes sejam baixados e execute na pasta do projeto: <br>
``npm install``
###### Logo em seguida, você pode rodar o sistema para que os testes sejam feitos: <br>
``npm start``
## Exemplos de solicitações:
<p> Este exemplo foi baseado nos testes feitos pelo Postman, mas você pode adaptar para a plataforma de sua preferência.</p>

1. **Modo Depósito**:
   - Método: POST
   - URL: `http://localhost:3000/deposit`
   - Corpo (multipart/form-data):
     - Chave: file, Tipo: Arquivo, Valor: Selecione um arquivo para upload
     - Chave: tolerance, Tipo: Texto, Valor: Número de réplicas desejadas (ex: 3)

2. **Modo Recuperação**:
   - Método: GET
   - URL: `http://localhost:3000/retrieve?filename=nome-do-arquivo`
     (substitua "nome-do-arquivo" pelo nome do arquivo que você deseja recuperar)
<br>
<strong> <h3> Obs: Garanta que a pasta 'uploads' esteja criada na raiz do sistema, porque sem ela os arquivos não poderão ser salvos. </h5> </strong>

## Como o sistema funciona

<p>No modo depósito, você pode enviar um arquivo com o número de réplicas desejado. Se o arquivo já existir com réplicas anteriores, o sistema aumentará ou diminuirá a quantidade de réplicas de acordo com a última solicitação.

No modo recuperação, você pode especificar o nome do arquivo que deseja recuperar. O servidor encontrará o arquivo em um dos locais replicados e o retornará como resposta.</p>
