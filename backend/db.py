from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"
client = MongoClient(MONGO_URL)

db = client["project_assignment"]
users_collection = db["users"]
videos_collection = db["videos"]



print("MongoDB connected successfully")
