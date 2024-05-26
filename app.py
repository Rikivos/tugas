from flask import Flask, render_template, jsonify, request, session, redirect, url_for

app = Flask(__name__)

from pymongo import MongoClient

MONGODB_CONNECTION_STRING = "mongodb+srv://test:sparta@cluster0.oxreacg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGODB_CONNECTION_STRING)
db = client.dbsparta_plus_week4


SECRET_KEY = "SPARTA"
import jwt
import datetime
import hashlib
@app.route("/")
def home():
    token_receive = request.cookies.get("mytoken")
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        user_info = db.user.find_one({"id": payload["id"]})
        return render_template("index.html", nickname=user_info["nick"])
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your login token has expired"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="There was an issue logging you in"))
@app.route("/login")
def login():
    msg = request.args.get("msg")
    return render_template("login.html", msg=msg)
@app.route("/register")
def register():
    return render_template("register.html")  
@app.route("/api/register", methods=["POST"])
def api_register():
    id_receive = request.form["id_give"]
    pw_receive = request.form["pw_give"]
    nickname_receive = request.form["nickname_give"]

    # Check if the user ID already exists
    if db.user.find_one({"id": id_receive}):
        return jsonify({"result": "fail", "msg": "user ini telah ada"})

    # Hash the password
    pw_hash = hashlib.sha256(pw_receive.encode("utf-8")).hexdigest()

    # Insert the new user into the database
    db.user.insert_one({"id": id_receive, "pw": pw_hash, "nick": nickname_receive})

    return jsonify({"result": "success"})
@app.route("/api/login", methods=["POST"])
def api_login():
    id_receive = request.form["id_give"]
    pw_receive = request.form["pw_give"]
    pw_hash = hashlib.sha256(pw_receive.encode("utf-8")).hexdigest()
    result = db.user.find_one({"id": id_receive, "pw": pw_hash})
    if result is not None:
        payload = {
            "id": id_receive,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=5),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return jsonify({"result": "success", "token": token})
    else:
        return jsonify({"result": "fail", "msg": "Either your email or your password is incorrect"})
@app.route("/api/nick", methods=["GET"])
def api_valid():
    token_receive = request.cookies.get("mytoken")

    # apakah anda sudah melihat pernyataan try/catch sebelumnya?
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        print(payload)

        # payload terdekripsinya seharusnya berisi id user
                # kita bisa menggunakan id ini untuk mencari data user
                # dari database dan mengembalikannya ke user
        userinfo = db.user.find_one({"id": payload["id"]}, {"_id": 0})
        return jsonify({"result": "success", "nickname": userinfo["nick"]})
    except jwt.ExpiredSignatureError:
        # jika anda mencoba untuk mendekripsi token yang sudah expired
                # anda akan mendapatkan error khusus, kita menangani error nya disini
        return jsonify({"result": "fail", "msg": "Your token has expired"})
    except jwt.exceptions.DecodeError:
        # jika ada permasalahan lain ketika proses decoding,
        # kita akan tangani di sini
        return jsonify({"result": "fail", "msg": "There was an error while logging you in"})


if __name__ == "__main__":
    app.run("0.0.0.0", port=5001, debug=True)