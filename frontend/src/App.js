import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeId, setYoutubeId] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // ---------------- LOGIN ----------------
  const login = () => {
    fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.access_token) {
          setError("Invalid login credentials ❌");
          return;
        }
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setError("");
      })
      .catch(() => setError("Server not reachable ❌"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ---------------- FETCH VIDEOS ----------------
  const fetchVideos = () => {
    if (!token) return;

    setLoading(true);
    fetch("http://127.0.0.1:5000/videos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setVideos(data);
        setError("");
      })
      .catch(() => setError("Failed to load videos ❌"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, [token]);

  // ---------------- ADD VIDEO ----------------
  // ---------------- ADD VIDEO ----------------
const addVideo = () => {
  if (!title || !description || !youtubeId) {
    setError("Please fill all fields!");
    return;
  }

  fetch("http://127.0.0.1:5000/videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: title,
      description: description,
      youtube_id: youtubeId,
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      setTitle("");
      setDescription("");
      setYoutubeId("");
      setSuccess("Video added successfully ✅");
      setTimeout(() => setSuccess(""), 2000);
      fetchVideos();
    })
    .catch(() => setError("Failed to add video ❌"));
};


  // ---------------- DELETE VIDEO ----------------
  const deleteVideo = (id) => {
    if (!window.confirm("Delete this video?")) return;

    fetch(`http://127.0.0.1:5000/videos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setSuccess("Video deleted 🗑️");
      setTimeout(() => setSuccess(""), 2000);
      fetchVideos();
    });
  };

  // ---------------- LOGIN UI ----------------
  if (!token) {
    return (
      <div className="container">
        <h1>🔐 Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="add-btn" onClick={login}>
          Login
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="container">
      <h1>🎬 Video App</h1>

      <button className="logout-btn" onClick={logout}>
        🚪 Logout
      </button>

      <input
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        placeholder="YouTube Video ID (example: dQw4w9WgXcQ)"
        value={youtubeId}
        onChange={(e) => setYoutubeId(e.target.value)}
      />

      <button className="add-btn" onClick={addVideo}>
        ➕ Add Video
      </button>

      <button
        className="sort-btn"
        onClick={() =>
          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        }
      >
        🔃 Sort {sortOrder === "asc" ? "A → Z" : "Z → A"}
      </button>

      {loading && <p className="info">Loading videos...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <input
        placeholder="🔍 Search video by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      {/* ---------------- PLAYER OR DASHBOARD ---------------- */}
      {selectedVideo ? (
        <div className="player-card">
          <h2>🎥 Now Playing</h2>
          <h3>{selectedVideo.title}</h3>
          <p>{selectedVideo.description}</p>

          <video width="100%" controls>
            <source
              src={`http://127.0.0.1:5000/video/${selectedVideo._id}/stream`}
              type="video/mp4"
            />
          </video>

          <button
            className="logout-btn"
            onClick={() => setSelectedVideo(null)}
          >
            🔙 Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          {videos
            .filter((video) =>
              video.title.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) =>
              sortOrder === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title)
            )
            .slice(0, 2)
            .map((video) => (
              <div
                className="video-card"
                key={video._id}
                onClick={() => setSelectedVideo(video)}
                style={{ cursor: "pointer" }}
              >
                <div className="video-info">
                  <img
                    src={
                      video.thumbnail_url ||
                      "https://via.placeholder.com/150"
                    }
                    alt="thumbnail"
                    className="thumbnail"
                  />

                  <div>
                    <strong>{video.title}</strong>
                    <p>{video.description}</p>
                  </div>
                </div>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteVideo(video._id);
                  }}
                >
                  ❌ Delete
                </button>
              </div>
            ))}
        </>
      )}
    </div>
  );
}

export default App;
