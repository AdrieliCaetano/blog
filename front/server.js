const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Substitua 'yourConnectionString' pela sua string de conexão do MongoDB
const uri = "yourConnectionString";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

// Conecta ao banco de dados antes de iniciar o servidor
client.connect(err => {
  if (err) throw err;
  db = client.db("yourDatabaseName"); // Substitua 'yourDatabaseName' pelo nome do seu banco de dados
  // Inicia o servidor após a conexão com o banco de dados
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});

app.use(bodyParser.json());

// Endpoint para criar um novo post
app.post('/posts', async (req, res) => {
  try {
    const postData = req.body;
    const response = await db.collection('posts').insertOne(postData);
    res.status(201).json(response.ops[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para atualizar um post com um novo comentário
app.put('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const commentData = req.body;
    const response = await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) }, // O ObjectId é necessário para converter a string em um ObjectId do MongoDB
      { $push: { comments: commentData } }
    );
    if (response.modifiedCount === 0) {
      throw new Error('Post not found or no changes made');
    }
    res.status(200).json({ updated: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware para tratar erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
