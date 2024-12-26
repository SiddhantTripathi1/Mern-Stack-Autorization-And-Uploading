const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./model/UserModel');
const Video = require('./model/VideoModel');
const ffmpeg = require('fluent-ffmpeg');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect("mongodb+srv://siddhantripathi4:ROOT@bigboytoyz.82pv4.mongodb.net/?retryWrites=true&w=majority&appName=BigBoyToyz", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "siddhantripathi4@gmail.com",
    pass: "skvbpajrtjdnulxc"
  },
});

// POST route to create account
app.post('/api/create-account', async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;

  const password = `${firstName.slice(0, 2)}${lastName.slice(0, 2)}${phoneNumber.slice(-4)}`;
  const newUser = new User({
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  });

  try {
    await newUser.save();

    const mailOptions = {
      from:"siddhantripathi4@gmail.com",
      to: email,
      subject: 'Account Created!',
      text: `Welcome ${firstName} ${lastName},\n\nYour account has been successfully created. Your username is ${email} and your temporary password is ${password}.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Account created and email sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating account', error: err });
  }
});

// POST route for login
app.post('/api/login', async (req, res) => {
  const { firstName, password } = req.body;

  try {
    const user = await User.findOne({ firstName });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      userData: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        bio: user.bio,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err });
  }
});

// Middleware for image upload
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '/uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 500 * 1024 }, // Max 500 KB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb('Error: Only JPG or JPEG images are allowed');
  },
});

// Backend route for image upload
app.post('/api/upload-image', imageUpload.single('profileImage'), async (req, res) => {
    const { userId } = req.body; // Now use userId
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
    try {
      const user = await User.findById(userId); // Use findById for a unique user lookup
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      user.profileImage = `uploads/${req.file.filename}`;
      await user.save();
      res.status(200).json({ message: 'Image uploaded successfully!', imagePath: user.profileImage });
    } catch (err) {
      res.status(500).json({ message: 'Error uploading image', error: err });
    }
  });
  
// Middleware for video upload
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const videoPath = path.join(__dirname, '/uploads/videos/');
    ensureDirectoryExists(videoPath);
    cb(null, videoPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /mp4|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb('Error: Only MP4 or MKV videos are allowed');
  },
});

app.post('/api/upload-video', videoUpload.array('videoFile', 10), async (req, res) => {
  const { videoTitle, videoDescription, firstName } = req.body;

  if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No video files uploaded' });

  try {
    const user = await User.findOne({ firstName });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const videoPromises = req.files.map((file) => {
      const videoPath = file.path;
      const thumbnailPath = `uploads/thumbnails/${Date.now()}_${file.filename}.jpg`;

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            count: 1,
            folder: 'uploads/thumbnails/',
            filename: path.basename(thumbnailPath),
          })
          .on('end', async () => {
            const newVideo = new Video({
              title: videoTitle,
              description: videoDescription,
              videoPath,
              thumbnailPath,
              user: user._id,
            });

            await newVideo.save();
            resolve(newVideo);
          })
          .on('error', reject);
      });
    });

    const videos = await Promise.all(videoPromises);
    res.status(200).json({ message: 'Videos uploaded successfully', videos });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading videos', error: err });
  }
});

// Utility function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
app.get('/api/view-all', async (req, res) => {
    try {
      // Get all users
      const users = await User.find();
  
      // Fetch their videos as well
      const usersWithVideos = await Promise.all(
        users.map(async (user) => {
          const videos = await Video.find({ user: user._id }).limit(5); // Get only the latest 5 videos
          return {
            ...user.toObject(),
            videos: videos.map(video => ({
              title: video.title,
              thumbnailPath: video.thumbnailPath,
            })),
          };
        })
      );
  
      res.status(200).json({ users: usersWithVideos });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  });
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
