from flask import  Flask, request, jsonify, render_template, redirect, url_for
from flask_pymongo import PyMongo, ObjectId


app = Flask(__name__)

app.config['MONGO_URI'] = 'mongodb://localhost:27017/blog'
mongo = PyMongo(app)

db = mongo.db
db.usuario.create_index([('email', 1)], unique=True)

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

@app.route('/post', methods=['POST'])
def create_post():
    pass

if __name__ == '__main__':
    app.run(debug=True)
