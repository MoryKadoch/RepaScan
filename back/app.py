from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)
client = MongoClient(os.getenv('MONGO_URI'))
db = client.RepaScan

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=365)
jwt = JWTManager(app)


@app.route('/')
def index():
    return "Hello World!"

@app.route('/privacy')
def privacy():
    html = """
    <!DOCTYPE html>
<html>
<body>
<h2>Politique de Confidentialité de RepaScan</h2>
<p>Date de prise d'effet: 21 Juillet 2023</p>

<p>Kadoch Dev ("nous", "notre", "nos") opère l'application mobile RepaScan (ci-après, l'"Application").</p>

<p>Cette page vous informe de nos politiques en matière de collecte, d'utilisation et de divulgation de données personnelles lorsque vous utilisez notre Application et des choix dont vous disposez associés à ces données.</p>

<h2>Collecte et utilisation des données</h2>
<p>Nous collectons plusieurs types de données à différentes fins pour fournir et améliorer notre Application.</p>

<h3>Données personnelles</h3>
<p>Lorsque vous utilisez notre Application, nous pouvons vous demander de nous fournir certaines informations personnellement identifiables qui peuvent être utilisées pour vous contacter ou vous identifier ("Données Personnelles"). Les informations personnellement identifiables peuvent inclure, mais ne sont pas limitées à:</p>

<ul>
<li>Prénom et Nom</li>
<li>Email</li>
<li>Mot de passe</li>
<li>Genre</li>
</ul>

<h2>Utilisation des données</h2>
<p>Kadoch Dev utilise les données collectées à des fins diverses:</p>    
<ul>
<li>Pour fournir et maintenir notre Application</li>
<li>Pour vous informer des modifications de notre Application</li>
<li>Pour vous permettre de participer aux fonctions interactives de notre Application lorsque vous choisissez de le faire</li>
<li>Pour fournir un support client</li>
<li>Pour recueillir des analyses ou des informations précieuses afin que nous puissions améliorer notre Application</li>
<li>Pour surveiller l'utilisation de notre Application</li>
<li>Pour détecter, prévenir et résoudre les problèmes techniques</li>
</ul>

<h2>Transfert de données</h2>
<p>Vos informations, y compris les données personnelles, peuvent être transférées vers - et conservées sur - des ordinateurs situés en dehors de votre état, province, pays ou autre juridiction gouvernementale où les lois sur la protection des données peuvent différer de celles de votre juridiction.</p>

<p>Si vous êtes situé en dehors de [votre pays] et choisissez de fournir des informations à nous, veuillez noter que nous transférons les données, y compris les données personnelles, à [votre pays] et les traitons là-bas.</p>

<p>Votre consentement à cette politique de confidentialité, suivi de votre soumission de ces informations, représente votre accord à ce transfert.</p>

<h2>Divulgation de données</h2>
<p>Nous pouvons divulguer vos données personnelles dans la conviction de bonne foi que cela est nécessaire pour:</p>
<ul>
<li>Se conformer à une obligation légale</li>
<li>Protéger et défendre les droits ou la propriété de Kadoch Dev</li>
<li>Prévenir ou enquêter sur d'éventuelles fautes liées à l'Application</li>
<li>Protéger la sécurité personnelle des utilisateurs de l'Application ou du public</li>
<li>Protéger contre la responsabilité juridique</li>
</ul>

<h2>Sécurité des données</h2>
<p>La sécurité de vos données est importante pour nous, mais rappelez-vous qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est 100% sûre. Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos données personnelles, nous ne pouvons garantir sa sécurité absolue.</p>

<h2>Modifications de cette politique de confidentialité</h2>
<p>Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page.</p>

<p>Il vous est conseillé de consulter cette politique de confidentialité périodiquement pour tout changement. Les changements à cette politique de confidentialité sont effectifs lorsqu'ils sont publiés sur cette page.</p>

<h2>Contactez nous</h2>
<p>Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter:</p>
<ul>
<li>Par email: contact@kadoch.dev</li>
</ul>
</body>
</html>
    """
    return html


@app.route('/signup', methods=['POST'])
def signup():
    users = db.users
    firstname = request.json.get('firstName')
    lastname = request.json.get('lastName')
    email = request.json.get('email')
    password = bcrypt.generate_password_hash(request.json.get('password')).decode('utf-8')
    gender = request.json.get('gender')

    calories = 2400 if gender == 'homme' else 1800

    goals = {
        'weightGoal': None,
        'weightRecords': [],
        'calories': calories,
    }

    user_id = users.insert_one({
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password,
        'gender': gender,
        'goals': goals
    }).inserted_id

    access_token = create_access_token(identity=str(user_id))

    return jsonify({
        'id': str(user_id),
        'email': email,
        'access_token': access_token
    })



@app.route('/login', methods=['POST'])
def login():
    users = db.users
    email = request.json.get('email')
    password = request.json.get('password')
    user = users.find_one({'email': email})
    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({
            'id': str(user['_id']),
            'email': user['email'],
            'access_token': access_token
        })
    else:
        return "Wrong credentials"


@app.route('/history', methods=['POST'])
@jwt_required()
def history():
    current_user = get_jwt_identity()

    histories = db.histories
    user_id = request.json.get('user_id')
    product_code = request.json.get('product_code')

    if current_user != user_id:
        return jsonify({"msg": "Unauthorized access"}), 401

    existing_history = histories.find_one(
        {'user_id': user_id, 'product_code': product_code})

    if existing_history:
        histories.update_one(
            {'_id': existing_history['_id']},
            {'$set': {'date': datetime.utcnow()}}
        )
        return jsonify(str(existing_history['_id']))
    else:
        history_id = histories.insert_one({
            'user_id': user_id,
            'product_code': product_code,
            'date': datetime.utcnow()
        }).inserted_id
        return jsonify(str(history_id))


@app.route('/history/<user_id>', methods=['GET'])
@jwt_required()
def get_history(user_id):
    current_user = get_jwt_identity()
    if current_user != user_id:
        return jsonify({"msg": "Unauthorized access"}), 401
    histories = db.histories
    user_history = histories.find({'user_id': user_id}).sort('date', -1)
    return jsonify([str(history['product_code']) for history in user_history])


@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    users = db.users
    user = users.find_one({'_id': ObjectId(user_id)})
    print(user)
    if user:
        return jsonify({
            'id': str(user['_id']),
            'email': user['email'],
            'firstname': user['firstname'],
            'lastname': user['lastname'],
            'goals': user['goals'] if 'goals' in user else None,
        })
    else:
        return "User not found", 404


@app.route('/history/<user_id>/<product_code>', methods=['DELETE'])
def delete_history(user_id, product_code):
    histories = db.histories
    result = histories.delete_one(
        {'user_id': user_id, 'product_code': product_code})

    if result.deleted_count > 0:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': "Product not found in user's history"}), 404


@app.route('/user/update/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = get_jwt_identity()
    if current_user != user_id:
        return jsonify({"msg": "Unauthorized access"}), 401
    update_fields = {}
    users = db.users
    firstname = request.json.get('firstName')
    lastname = request.json.get('lastName')
    email = request.json.get('email')
    goals_calories = request.json.get('goals.calories')
    goals_weight_goal = request.json.get('goals.weightGoal')
    new_weight_record = request.json.get('goals.weightRecords')

    if goals_calories:
        update_fields['goals.calories'] = goals_calories
    if goals_weight_goal:
        update_fields['goals.weightGoal'] = goals_weight_goal

    if firstname :
        update_fields['firstname'] = firstname

    if lastname :
        update_fields['lastname'] = lastname
    
    if email :
        update_fields['email'] = email

    if request.json.get('password'):
        password = bcrypt.generate_password_hash(
            request.json.get('password')).decode('utf-8')
        update_fields['password'] = password

    user = users.find_one_and_update({'_id': ObjectId(user_id)}, {'$set': update_fields}, return_document=True)
    
    if new_weight_record:
        user = users.find_one_and_update({'_id': ObjectId(user_id)}, {'$push': {'goals.weightRecords': new_weight_record}}, return_document=True)

    if user:
        return jsonify({
            'id': str(user['_id']),
            'email': user['email']
        })
    else:
        print("User not found")
        return "User not found", 404



@app.route('/user/delete/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = get_jwt_identity()
    if current_user != user_id:
        return jsonify({"msg": "Unauthorized access"}), 401
    users = db.users

    result = users.delete_one({'_id': ObjectId(user_id)})
    if result.deleted_count > 0:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': "User not found"}), 404


if __name__ == '__main__':
    app.run(debug=True)