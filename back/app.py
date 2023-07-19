from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from pymongo import MongoClient

app = Flask(__name__)
bcrypt = Bcrypt(app)
client = MongoClient(
    "mongodb+srv://admin:admin@cluster0.cdnqr.mongodb.net/?retryWrites=true&w=majority")
db = client.RepaScan


@app.route('/')
def index():
    return "Hello World!"


@app.route('/signup', methods=['POST'])
def signup():
    users = db.users
    firstname = request.json.get('firstname')
    lastname = request.json.get('lastname')
    email = request.json.get('email')
    password = bcrypt.generate_password_hash(
        request.json.get('password')).decode('utf-8')
    user_id = users.insert_one({
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password
    }).inserted_id
    return jsonify(str(user_id))


@app.route('/login', methods=['POST'])
def login():
    users = db.users
    email = request.json.get('email')
    password = request.json.get('password')
    user = users.find_one({'email': email})
    if user and bcrypt.check_password_hash(user['password'], password):
        return jsonify({
            'id': str(user['_id']),
        })
    else:
        return "Wrong credentials"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
