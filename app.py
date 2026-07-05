from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/event_board')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ========== Models ==========
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    events = db.relationship('Event', backref='creator', lazy=True, foreign_keys='Event.creator_id')
    participations = db.relationship('EventParticipant', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class Event(db.Model):
    __tablename__ = 'event'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    event_date = db.Column(db.DateTime, nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    max_participants = db.Column(db.Integer, default=None)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    participants = db.relationship('EventParticipant', backref='event', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'event_date': self.event_date.isoformat(),
            'creator': self.creator.to_dict(),
            'max_participants': self.max_participants,
            'participant_count': len(self.participants),
            'participants': [p.user.to_dict() for p in self.participants],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class EventParticipant(db.Model):
    __tablename__ = 'event_participant'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('event_id', 'user_id', name='unique_event_participant'),)


# ========== Authentication ==========
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        session['username'] = user.username
        
        return jsonify({'message': 'Registration successful'}), 201
    
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        session['user_id'] = user.id
        session['username'] = user.username
        
        return jsonify({'message': 'Login successful'}), 200
    
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


# ========== Routes ==========
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/create-event')
@login_required
def create_event_page():
    return render_template('create_event.html')


# ========== API Routes ==========
@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        events = Event.query.all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        return jsonify(event.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/events', methods=['POST'])
@login_required
def create_event():
    try:
        data = request.get_json()
        
        if not all([data.get('title'), data.get('description'), data.get('location'), data.get('event_date')]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        event = Event(
            title=data['title'],
            description=data['description'],
            location=data['location'],
            event_date=datetime.fromisoformat(data['event_date']),
            creator_id=session['user_id'],
            max_participants=data.get('max_participants')
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify(event.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/events/<int:event_id>/join', methods=['POST'])
@login_required
def join_event(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        
        # Check if already participating
        existing = EventParticipant.query.filter_by(
            event_id=event_id,
            user_id=session['user_id']
        ).first()
        
        if existing:
            return jsonify({'error': 'Already participating in this event'}), 400
        
        # Check max participants
        if event.max_participants and len(event.participants) >= event.max_participants:
            return jsonify({'error': 'Event is full'}), 400
        
        participant = EventParticipant(
            event_id=event_id,
            user_id=session['user_id']
        )
        
        db.session.add(participant)
        db.session.commit()
        
        return jsonify(event.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/events/<int:event_id>/leave', methods=['POST'])
@login_required
def leave_event(event_id):
    try:
        participant = EventParticipant.query.filter_by(
            event_id=event_id,
            user_id=session['user_id']
        ).first_or_404()
        
        db.session.delete(participant)
        db.session.commit()
        
        event = Event.query.get(event_id)
        return jsonify(event.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/status', methods=['GET'])
def user_status():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({
            'logged_in': True,
            'user': user.to_dict()
        }), 200
    return jsonify({'logged_in': False}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
