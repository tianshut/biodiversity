from functools import wraps

from flask import Flask, render_template, jsonify, request, Response,redirect, url_for,send_from_directory
from flask_restful import Api, Resource
from werkzeug.security import generate_password_hash, check_password_hash
import csv
import json
import os
from werkzeug.utils import secure_filename

alldata = []

app = Flask(__name__)
app.secret_key = "Thanks for the semester!"
api = Api(app, prefix="/api")

UPLOAD_FOLDER = './static/data/uploads/'#上传到这里
ALLOWED_EXTENSIONS = set(['csv'])#允许的格式,保证安全性
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024#限制大小64mb
##auth_user = [{
  ##  "name": "admin",
    ##"password": generate_password_hash("111")
##}]


## Auth Decorator and Helpers


##def check_auth(username, password):
##    return username == auth_user[0]["name"] and check_password_hash(auth_user[0]["password"], password)


def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})



@app.route("/newdata", methods=['GET'])
def landing2():
    return render_template("newdata.html",var2="./static/data/"+request.args.get("sourcename")+".csv")



@app.route("/", methods=['GET'])
def landing():
         return render_template("base.html",var1="data_combined_sorted")


@app.route('/alldata', methods=['POST'])
def test():
    print(request.values.get("sourcename"))
    arg = "./static/data/"+request.values.get("sourcename")+".csv"
    return arg

##@app.route('/', methods=['POST'])
##def start():
 ##   print(request.values.get("sourcename1"))
   ## return render_template("base.html", var1=request.values.get("sourcename1"))

def allowed_file(filename):
    return '.' in filename and \
    filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
@app.route('/uploadata', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        print(file)
        if file and allowed_file(file.filename):
            filename =str(file.filename)#防止恶意传送非正常字符导致服务器异常
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
              os.makedirs(app.config['UPLOAD_FOLDER'])
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
            print(filename)
            return render_template("newdata.html",var2="./static/data/uploads/"+filename)
    return render_template("base.html",var1="data_combined_sorted")


if __name__ == "__main__":
    app.run(
      host='0.0.0.0',
      port=5000)
