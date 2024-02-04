# Blog

Este projeto consiste na criação um site do tipo blog voltado para a criação e publicação de posts, sendo desenvolvido com propósitos acadêmicos, visando a aplicação dos conhecimentos sobre banco de dados NoSQL.

 ## How to run

  - Instale o servidor MongoDB e o Python (caso não tenha instalado)
  - Instale as dependências 
```bash
  pip install -r requirements.txt
  ```
  - Altere informações sobre o banco de dados no arquivo [`app.py`]() (linha 11)
  ```bash
  app.config['MONGO_URI'] = 'mongodb://localhost:27017/blog'
  # substitua 'mongodb://localhost:27017/' pela sua URI do mongo
  ```
  - No diretório () rode a aplicação aplicando o comando:
  ```bash
  python app.py
  ```
  - Abra um navegador e vá para http://127.0.0.1:5000/ para acessar o site.
