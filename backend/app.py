from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from pymongo import MongoClient
from passlib.hash import pbkdf2_sha256
from dotenv import load_dotenv
from bson import ObjectId
import os

# ---------------- LOAD ENV ----------------
load_dotenv()

# ---------------- APP SETUP ----------------
app = Flask(__name__)
CORS(app)

# ---------------- JWT CONFIG ----------------
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
jwt = JWTManager(app)

# ---------------- MONGODB CONFIG ----------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["video_app"]

users_collection = db["users"]
videos_collection = db["videos"]

print("MongoDB connected successfully")

# ======================================================
# ================= AUTH ROUTES ========================
# ======================================================

# -------- Signup --------
@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    # Check existing user
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    # Hash password
    hashed_password = pbkdf2_sha256.hash(password)

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully"}), 201


# -------- Login --------
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not pbkdf2_sha256.verify(password, user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=email)
    return jsonify({"access_token": token}), 200


# -------- Profile --------
@app.route("/auth/me", methods=["GET"])
@jwt_required()
def profile():
    email = get_jwt_identity()
    user = users_collection.find_one(
        {"email": email},
        {"_id": 0, "password": 0}
    )
    return jsonify(user), 200


# ======================================================
# ================= VIDEO ROUTES =======================
# ======================================================

# -------- Create Video --------
@app.route("/videos", methods=["POST"])
@jwt_required()
def create_video():
    data = request.get_json()

    required_fields = ["title", "description", "youtube_id"]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    youtube_id = data["youtube_id"]

    # Auto-generate thumbnail from YouTube
    thumbnail_url = f"https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg"

    video = {
        "title": data["title"],
        "description": data["description"],
        "youtube_id": youtube_id,
        "thumbnail_url": thumbnail_url,
        "is_active": True
    }

    videos_collection.insert_one(video)
    return jsonify({"message": "Video created successfully"}), 201




# -------- Get All Videos --------
@app.route("/videos", methods=["GET"])
@jwt_required()
def get_videos():
    videos = list(videos_collection.find())

    for video in videos:
        video["_id"] = str(video["_id"])

    return jsonify(videos), 200

from pytube import YouTube
from flask import Response
import requests


# ---------------- STREAM VIDEO ----------------
@app.route("/video/<video_id>/stream", methods=["GET"])
@jwt_required()
def stream_video(video_id):
    video = videos_collection.find_one({"_id": ObjectId(video_id)})
    
    if not video:
        return jsonify({"error": "Video not found"}), 404

    youtube_id = video.get("youtube_id")
    youtube_url = f"https://www.youtube.com/watch?v={youtube_id}"

    try:
        yt = YouTube(youtube_url)
        stream = yt.streams.filter(progressive=True, file_extension="mp4").first()
        video_url = stream.url

        def generate():
            r = requests.get(video_url, stream=True)
            for chunk in r.iter_content(chunk_size=1024):
                if chunk:
                    yield chunk

        return Response(generate(), content_type="video/mp4")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------- Update Video --------
@app.route("/videos/<video_id>", methods=["PUT"])
@jwt_required()
def update_video(video_id):
    data = request.get_json()

    videos_collection.update_one(
        {"_id": ObjectId(video_id)},
        {"$set": data}
    )

    return jsonify({"message": "Video updated successfully"}), 200


# -------- Delete Video --------
@app.route("/videos/<video_id>", methods=["DELETE"])
@jwt_required()
def delete_video(video_id):
    videos_collection.delete_one({"_id": ObjectId(video_id)})
    return jsonify({"message": "Video deleted successfully"}), 200


# ======================================================
# ================= RUN SERVER =========================
# ======================================================

if __name__ == "__main__":
    app.run(debug=True)
