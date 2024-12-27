import React, { useState, useEffect } from 'react';

import './ViewAll.css';

function ViewAll() {
  const [users, setUsers] = useState([]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://mern-stack-autorization-and-uploading.onrender.comhttps://mern-stack-autorization-and-uploading.onrender.com/api/view-all');
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
                  src={`https://mern-stack-autorization-and-uploading.onrender.com/${user.profileImage}`}
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
                      src={`https://mern-stack-autorization-and-uploading.onrender.comhttps://mern-stack-autorization-and-uploading.onrender.com/${video.thumbnailPath}`}
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
