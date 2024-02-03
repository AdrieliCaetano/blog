from flask import  Flask, request, jsonify
from flask_pymongo import PyMongo, ObjectId
from datetime import datetime

app = Flask(__name__)

app.config['MONGO_URI'] = 'mongodb://localhost:27017/blog'
mongo = PyMongo(app)

db = mongo.db
db.usuario.create_index([('email', 1)], unique=True)

def formatar_comentarios(comentarios):
    return [
        {
            '_id': str(comentario.get('_id')),
            'texto': comentario['texto'],
            'data': comentario['data'],
            'autor_REF': str(comentario['autor_REF'])
        } for comentario in comentarios
    ]

@app.route('/')
def index():
    return "teste"

@app.route('/usuarios', methods= ['GET'])
def get_usuarios():
    usuarios = list(db.usuario.find())
    usuarios_json = [
        {
        "_id": str(usuario['_id']),
        "nome": usuario.get("nome"),
        "sobrenome":usuario.get("sobrenome"),
        "email": usuario.get("email")
        } for usuario in usuarios]
    return jsonify(usuarios_json)

@app.route('/usuarios/<string:usuario_id>', methods=['GET'])
def get_usuario(usuario_id):
    id_objeto = ObjectId(usuario_id)
    usuario = db.usuario.find_one({"_id": id_objeto})
    if usuario:
        usuario['_id'] = str(usuario['_id'])
        return jsonify(usuario)
    else:
        return jsonify({'error': 'Usuário não encontrado'}), 404

@app.route('/usuarios', methods = ['POST'])
def create_usuario():
    dados_usuarios = request.json
    if not request.json  or 'nome' not in request.json or 'sobrenome' not in request.json or 'email' not in request.json:
        return jsonify({'error': 'Dados inválidos'}), 400
    if db.usuario.find_one({"email": dados_usuarios['email']}):
        return jsonify({'error': 'E-mail já registrado'}), 400
    result = db.usuario.insert_one(dados_usuarios)
    usuario_id = str(result.inserted_id)
    return jsonify({'message': "Usuário inserido com sucesso",'_id': usuario_id,}), 201

@app.route('/usuarios/<string:usuario_id>', methods=['PUT'])
def update_usuario(usuario_id):
    id_objeto = ObjectId(usuario_id)
    usuario = db.usuario.find_one({"_id": id_objeto})
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404
    dados_atualizados = request.json
    email_atualizado = dados_atualizados.get("email", usuario.get("email"))

    if db.usuario.find_one({"email": email_atualizado, "_id": {"$ne": id_objeto}}):
        return jsonify({'error': 'E-mail já registrado'}), 400
    
    usuario_atualizado = {
        "_id": id_objeto,
        "nome": dados_atualizados.get("nome", usuario.get("nome")),
        "sobrenome": dados_atualizados.get("sobrenome", usuario.get("sobrenome")),
        "email": email_atualizado,
    }

    db.usuario.replace_one({"_id": id_objeto}, usuario_atualizado)
    return jsonify({'message': 'Usuário atualizado com sucesso'}), 200

@app.route('/usuarios/<string:usuario_id>', methods=['DELETE'])
def delete_usuario(usuario_id):
    id_objeto = ObjectId(usuario_id)
    usuario = db.usuario.find_one({"_id": id_objeto})
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404
    db.usuario.delete_one({"_id" : id_objeto})
    return jsonify({'message': 'Usuário excluído com sucesso'}), 200


@app.route('/posts', methods=['GET'])
def get_posts():
    posts = list(db.post.find())
    posts_json =[
        {
        '_id' : str(post['_id']),
        'titulo': post['titulo'],
        'conteudo': post['conteudo'],
        'data': post['data'],
        'link_imagem' : post.get('link_imagem', ''),
        'tags': post.get('tags'),
        'autor_REF': str(post['autor_REF']),
        'comentarios': formatar_comentarios(post.get('comentarios', []))
        } for post in posts
    ]
    return jsonify(posts_json)


@app.route('/posts/<string:post_id>', methods=['GET'])
def get_post(post_id):
    id_objeto = ObjectId(post_id)
    post = db.post.find_one({"_id": id_objeto})
    if post:
        post['_id'] = str(post['_id'])
        post['comentarios'] = formatar_comentarios(post.get('comentarios', []))
        return jsonify(post)
    else:
        return jsonify({'error': 'Post não encontrado'}), 404

@app.route('/posts/<string:post_id>', methods=['PUT'])
def update_post(post_id):
    id_objeto_post = ObjectId(post_id)
    post_existente = db.post.find_one({"_id": id_objeto_post})
    if not post_existente:
        return jsonify({"error": "Post não encontrado"}), 404
    dados_atualizados = request.json
    campos_atualizaveis = ['titulo', 'conteudo', 'link_imagem', 'tags']
    for campo in campos_atualizaveis:
        if campo in dados_atualizados:
            post_existente[campo] = dados_atualizados[campo]
    result = db.post.replace_one({"_id": id_objeto_post}, post_existente)
    if result.modified_count > 0:
        return jsonify({'message': 'Post atualizado com sucesso'}), 200
    else:
        return jsonify({'error': 'Falha ao atualizar o post'}), 500

@app.route('/posts', methods=['POST'])
def create_post():
    dados_post = request.json
    if not request.json or 'titulo' not in request.json or 'conteudo' not in request.json or 'autor_REF' not in request.json:
        return jsonify({'error': 'Dados inválidos para o post'}), 400
    dados_post['data'] = datetime.now()
    result = db.post.insert_one(dados_post)
    if result.inserted_id:
        return jsonify({'message': 'Post criado com sucesso', 'id': str(result.inserted_id)}), 201
    else:
        return jsonify({'error': 'Erro ao criar o post'}), 500
    
@app.route('/posts/<string:post_id>', methods=['DELETE'])
def delete_post(post_id):
    id_objeto = ObjectId(post_id)
    post = db.post.find_one({"_id": id_objeto})
    if not post:
        return jsonify({"error": "Post não encontrado"}), 404
    db.post.delete_one({"_id" : id_objeto})
    return jsonify({'message': 'Post excluído com sucesso'}), 200

@app.route('/posts/<string:post_id>/comentarios', methods=['POST'])
def create_comentario(post_id):
    dados_comentario = request.json
    if not dados_comentario or 'texto' not in dados_comentario or 'autor_REF' not in dados_comentario:
        return jsonify({'error': 'Dados inválidos para o comentário'}), 400
    dados_comentario['data'] = datetime.now()
    dados_comentario['_id'] = ObjectId()
    id_objeto_post = ObjectId(post_id)
    result = db.post.update_one(
        {"_id": id_objeto_post},
        {"$push": {"comentarios": dados_comentario}}
    )
    if result.matched_count > 0 and result.modified_count > 0:
        return jsonify({'message': 'Comentário criado com sucesso', '_id' : str(dados_comentario['_id'])}), 201
    else:
        return jsonify({'error': 'Post não encontrado'}), 404

@app.route('/posts/<string:post_id>/comentarios/<string:comentario_id>', methods=['PUT'])
def update_comentario(post_id, comentario_id):
    dados_atualizados = request.json
    if not dados_atualizados or 'texto' not in dados_atualizados:
        return jsonify({'error': 'Dados inválidos para a atualização do comentário'}), 400
    id_objeto_post = ObjectId(post_id)
    id_objeto_comentario = ObjectId(comentario_id)
    result = db.post.update_one(
        {"_id": id_objeto_post, "comentarios._id": id_objeto_comentario},
        {"$set": {"comentarios.$.texto": dados_atualizados['texto']}}
    )
    if result.matched_count > 0 and result.modified_count > 0:
        return jsonify({'message': 'Comentário atualizado com sucesso'}), 200
    else:
        return jsonify({'error': 'Não foi possível atualizar'}), 404

@app.route('/posts/<string:post_id>/comentarios/<string:comentario_id>', methods=['DELETE'])
def delete_comentario(post_id, comentario_id):
    id_objeto_post = ObjectId(post_id)
    id_objeto_comentario = ObjectId(comentario_id)
    result = db.post.update_one(
        {"_id": id_objeto_post},
        {"$pull": {"comentarios": {"_id": id_objeto_comentario}}}
    )

    if result.matched_count > 0 and result.modified_count > 0:
        return jsonify({'message': 'Comentário excluído com sucesso'}), 200
    else:
        return jsonify({'error': 'Não foi possível excluir'}), 404

@app.route('/posts/tags', methods=['GET'])
def buscar_posts_por_tags():
    tags = request.args.getlist('tag')
    if not tags:
        return jsonify({'error': 'Nenhuma tag fornecida'}), 400
    posts_com_tags = list(db.post.find({"tags": {"$all": tags}}))
    posts_json = [
        {
            '_id': str(post['_id']),
            'titulo': post['titulo'],
            'conteudo': post['conteudo'],
            'data': post['data'],
            'link_imagem': post.get('link_imagem', ''),
            'tags': post.get('tags', []),
            'autor_REF': str(post['autor_REF']),
            'comentarios': formatar_comentarios(post.get('comentarios', []))
        } for post in posts_com_tags
    ]

    if posts_com_tags == []:
        return jsonify({'message': 'Nenhum post encontrado'})
    else:
        return jsonify(posts_json)

if __name__ == '__main__':
    app.run(debug=True)
