# Blog

Este projeto consiste na criação um site do tipo blog voltado para a criação e publicação de posts, sendo desenvolvido com propósitos acadêmicos, visando a aplicação dos conhecimentos sobre banco de dados NoSQL.

 ## How to run
1. **Instalar o servidor MongoDB e o Python:**
   - Certifique-se de ter o servidor MongoDB instalado em sua máquina. Você pode baixá-lo no [site oficial do MongoDB](https://www.mongodb.com/try/download/community).
   - Instale o Python se ainda não estiver instalado. Você pode baixá-lo em [python.org](https://www.python.org/downloads/).

2. **Instalar as dependências:**
   - Abra o terminal ou prompt de comando.
   - Navegue até o diretório do projeto onde está localizado o arquivo `requirements.txt`.
   - Execute o seguinte comando para instalar as dependências:

     ```bash
     pip install -r requirements.txt
     ```

3. **Alterar informações sobre o banco de dados em app.py:**
   - Abra o arquivo `app.py` no seu editor de texto ou IDE.
   - Vá para a linha 11 e substitua `'mongodb://localhost:27017/'` pela sua URI do MongoDB, se necessário. Mantenha o nome do BD ('blog') após a URI. Por exemplo:
     
     ```bash
     app.config['MONGO_URI'] = 'mongodb://localhost:27017/blog'
     ```

4. **Executar a aplicação:**
   - No diretório do projeto onde está localizado o arquivo `app.py`, execute o seguinte comando no terminal ou prompt de comando:

     ```bash
     python app.py
     ```

   Isso iniciará o servidor Flask.

5. **Acessar o site:**
   - Abra um navegador web.
   - Vá para [http://127.0.0.1:5000/](http://127.0.0.1:5000/) para acessar o site.

