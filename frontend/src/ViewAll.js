import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewAll.css';

function ViewAll() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/view-all');
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert('Error fetching users: ' + error.message);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="view-all">
      <h1>Users List</h1>
      <div className="user-grid">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div key={index} className="user-card">
              <div className="user-info">
                <img
                  src={`http://localhost:3000/${user.profileImage}`}
                  alt="Profile"
                  className="user-image"
                />
                <h3>{user.firstName}</h3>
              </div>

              {/* Video Thumbnails */}
              <div className="video-thumbnails">
                {user.videos.slice(0, 5).map((video, idx) => (
                  <div key={idx} className="video-thumbnail">
                    <img
                      src={`http://localhost:3000/${video.thumbnailPath}`}
                      alt={`Video Thumbnail ${idx + 1}`}
                      className="thumbnail-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
}

export default ViewAll;
