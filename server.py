from flask import Flask
from flask import render_template, make_response
from flask import request, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:///guesses.db', echo=True)
Base = declarative_base()

app = Flask(__name__)
app.debug = True
db = SQLAlchemy(app)

Session = sessionmaker(bind=engine)

class User(Base):
    __tablename__ = "user_table"

    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), index=True, unique=True)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return '<User %r>' % self.name

class Guess(Base):
    __tablename__ = "guess"

    isCorrect = Column(db.Boolean)
    wrongTimes = Column(Integer, default=0)

    owner_id = Column(Integer, ForeignKey('user_table.id'), primary_key=True)
    toUser_id = Column(Integer, ForeignKey('user_table.id'), primary_key=True)

    owner  = relationship('User', primaryjoin = ('Guess.owner_id  == User.id'))
    toUser = relationship('User', primaryjoin = ('Guess.toUser_id == User.id'))

def get_or_create_user_by_name(session, sName):
    out = session.query(User).filter(User.name==sName).first()
    if not out:
       out = User(sName)
       session.add(out)
       session.commit()
    return out

def get_user_by_id(session, iUser):
  return session.query(User).filter(User.id==iUser).first()

def get_all_guesses(session, iUser):
  return session.query(Guess).filter(Guess.owner_id==iUser).all()

def add_new_guess(session, iFrom, iTo, bGuess):
    guess = session.query(Guess).filter(Guess.owner_id==iFrom, Guess.toUser_id==iTo).first()

    if not guess:
      guess = Guess()
      guess.owner_id = iFrom
      guess.toUser_id = iTo
      guess.wrongTimes = 0;
      session.add(guess)

    guess.isCorrect = bGuess
    if not bGuess:
      guess.wrongTimes += 1

    session.commit()

@app.route("/")
def index():
    iUser = request.cookies.get("iUser")
    if not iUser or get_user_by_id(Session(), iUser) == None:
       iUser = "null"
    return render_template("index.html", iUser=iUser)

@app.route("/about_page.html")
def about_page():
    return render_template("about_page.html")

@app.route("/get_data")
def get_data():
    iUser = request.cookies.get("iUser")
    session = Session()

    return jsonify({"guesses": [{"to": g.toUser.name, "correct": g.isCorrect, "wrongTimes": g.wrongTimes}
                                for g in get_all_guesses(session, iUser)]})

@app.route("/guess", methods=["POST"])
def guess():
    iUser = request.cookies.get("iUser")
    sTo = request.form["toName"]
    bCorrect = (request.form["isCorrect"] == "true")

    s = Session()

    add_new_guess(s, iUser, get_or_create_user_by_name(s, sTo).id, bCorrect)
    return jsonify(result=True)

@app.route("/logout", methods=["POST"])
def logout():
    resp = make_response(jsonify(id=None))
    resp.set_cookie("iUser", None)
    return resp

@app.route("/login", methods=["POST"])
def login():
    sUser = request.form["sUser"]

    session = Session()
    oUser = get_or_create_user_by_name(session, sUser)

    resp = make_response(jsonify(id=oUser.id))
    resp.set_cookie("iUser", oUser.id)

    return resp

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    app.run()
