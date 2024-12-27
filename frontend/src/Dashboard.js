import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [showBioModal, setShowBioModal] = useState(false);
  const [loading, setLoading] = useState(false); // For controlling the loader during upload
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]); // For storing uploaded videos

  useEffect(() => {
    // Fetch user data from localStorage
    const userDataFromLocalStorage = JSON.parse(localStorage.getItem('userData'));

    if (!userDataFromLocalStorage) {
      navigate('/login');  // Redirect to login if no user data is found
    } else {
      setUserData(userDataFromLocalStorage);
      setBio(userDataFromLocalStorage.bio || ''); // Set the initial bio if exists
    }
  }, [navigate]);

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 500 * 1024) { // 500KB max size
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      alert('Please select a file less than 500KB.');
    }
  };

  // Handle Image Upload
 // Frontend - handleImageUpload
const handleImageUpload = async () => {
    if (!image) {
      alert('Please select an image first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('profileImage', image);
    formData.append('userId', userData._id); // Send userId
  
    setLoading(true);
  
    try {
      const response = await fetch('https://mern-stack-autorization-and-uploading.onrender.comhttps://mern-stack-autorization-and-uploading.onrender.com/api/upload-image', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      setLoading(false);
  
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      setLoading(false);
      alert('Error uploading image: ' + error.message);
    }
  };
  

  // Handle Bio Change
  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  // Save Bio
  const handleSaveBio = async () => {
    try {
      const response = await fetch('https://mern-stack-autorization-and-uploading.onrender.com/api/update-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName: userData.firstName, bio }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update bio in userData state
        setUserData((prevData) => ({
          ...prevData,
          bio: bio, // Update bio in userData state
        }));
        setShowBioModal(false);  // Close the modal after saving
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error saving bio: ' + error.message);
    }
  };

  // Handle Video Change
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 6 * 1024 * 1024 && file.type === 'video/mp4') { // 6MB max size and only MP4 files
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));  // Show video preview
    } else {
      alert('Please select an MP4 file less than 6MB.');
    }
  };

  // Handle Video Upload
 // Handle Video Upload
const handleVideoUpload = async () => {
    if (videoTitle.length > 30 || videoDescription.length > 200) {
      alert('Title or description exceeds the limit');
      return;
    }

    if (!video) {
      alert('Please select a video first.');
      return;
    }

    const formData = new FormData();
    formData.append('videoFile', video);
    formData.append('videoTitle', videoTitle);
    formData.append('videoDescription', videoDescription);
    formData.append('firstName', userData.firstName);

    setLoading(true);

    try {
      const response = await fetch('https://mern-stack-autorization-and-uploading.onrender.com/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert(data.message);
        setVideos((prevVideos) => [...prevVideos, ...data.videos]);  // Update videos state
        setShowVideoModal(false); // Close the modal after successful upload
      } else {
        alert(data.message);
      }
    } catch (error) {
      setLoading(false);
      alert('Error uploading video: ' + error.message);
    }
};

  return (
    <div className="dashboard">
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-links">
          <button onClick={() => navigate('/view-all')}>View All</button>
        </div>
      </div>

      <h1>Dashboard</h1>
      {userData && (
        <div>
          {/* Profile Section */}
          <h2>Profile</h2>
          {imagePreview ? (
            <img src={imagePreview} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#ccc' }}>No Image</div>
          )}
          <input type="file" accept="image/jpeg, image/jpg" onChange={handleImageChange} />
          <button onClick={handleImageUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Image'}</button>

          {/* Personal Information Section */}
          <h2>Personal Information</h2>
          <p>First Name: {userData.firstName}</p>
          <p>Last Name: {userData.lastName}</p>
          <p>Email: {userData.email}</p>
          <p>Phone Number: {userData.phoneNumber}</p>

          {/* Add Bio Section */}
          <h2>Bio</h2>
          {userData.bio ? (
            <p>{userData.bio}</p>  // Display bio if available
          ) : (
            <div>
              <button onClick={() => setShowBioModal(true)} disabled={userData.bio}>
                +
              </button>
            </div>
          )}

          {/* Bio Modal */}
          {showBioModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Add Bio</h3>
                <textarea 
                  value={bio} 
                  onChange={handleBioChange} 
                  maxLength="500" 
                  placeholder="Write your bio here (up to 500 words)" 
                />
                <button onClick={handleSaveBio} disabled={loading}>{loading ? 'Saving...' : 'Save Bio'}</button>
                <button onClick={() => setShowBioModal(false)}>Close</button>
              </div>
            </div>
          )}

          {/* Video Upload Section */}
          <h2>Upload Video</h2>
          <button onClick={() => setShowVideoModal(true)}>+</button>

          {/* Video Modal */}
          {showVideoModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Upload Video</h3>
                <input type="file" accept="video/mp4" onChange={handleVideoChange} />
                {videoPreview && <video src={videoPreview} width="200" controls />}
                <input 
                  type="text"
                  placeholder="Video Title (max 30 characters)"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  maxLength="30"
                />
                <textarea
                  placeholder="Video Description (max 200 characters)"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  maxLength="200"
                />
                <button onClick={handleVideoUpload} disabled={loading}>{loading ? 'Uploading...' : 'Save Video'}</button>
                <button onClick={() => setShowVideoModal(false)}>Close</button>
              </div>
            </div>
          )}
          {/* Display Uploaded Videos */}

<div className="videos-list">
  {videos.length > 0 ? (
    videos.map((video, index) => (
      <div key={index} className="video-item">
        <img
          src={video.thumbnailPath} // Assuming you have the correct path to the thumbnail
          alt={video.title}
          style={{ width: '200px', height: 'auto' }}
        />
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <video width="320" height="240" controls>
          <source src={video.videoPath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    ))
  ) : (
    <p>No videos uploaded yet.</p>
  )}
</div>

        </div>
      )}
    </div>
  );
}

export default Dashboard;
