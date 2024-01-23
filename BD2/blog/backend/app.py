from flask import  Flask, request, jsonify, render_template
from flask_pymongo import PyMongo

app = Flask(__name__)


app.config['MONGO_URI'] = 'mongodb://localhost:27017/blog'
mongo = PyMongo(app)

@app.route('/')
def index():
    posts = mongo.db.posts.find()
    return "BLOG"

if __name__ == '__main__':
    app.run(debug=True)