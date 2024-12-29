const Path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Mongoose = require('mongoose');
const multer = require('multer');

const FeedRoutes = require('./routes/feed')

const app = express();

const MONGODB_URI = 'mongodb+srv://yashrevandkar:SVuj0ptzQP3aLTHO@cluster0.giyv5.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

// Use body-parser middleware to parse JSON data
app.use(bodyParser.json());

app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

// Use express stattic middleware to handle requests to imgaes.
app.use('/images', express.static(Path.join(__dirname, '/images')));

// Use body-parser middleware to parse URL-encoded data which is submiited though form
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-headers', 'Content-Type, Authorization');

    next()
})

app.use((error, req, res, next) => {
    const { statusCode, message = '' } = error
    console.error(error);

    res.status(statusCode || 500).json({ message });
})
app.use('/feed', FeedRoutes)

app.get('/', (req, res, next) => {
    console.log('request received')
    res.send('Hello world');
})

Mongoose.connect(MONGODB_URI, {
    tls: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
  })
  .then((res) => {
    console.log('Connected to MongoDB',res);
  })
  .catch(err => console.log(err));

app.listen(8080);