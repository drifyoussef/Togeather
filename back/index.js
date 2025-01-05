const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const expressSession = require('express-session');
const multer = require('multer');
const path = require('path');
const { paypalConfig } = require('./src/config/paypalConfig');
const newUserController = require('./src/controllers/newUser');
const paypal = require('./src/services/paypal-api.js');
const bodyParser = require('body-parser'); // Import body-parser
const storeUserController = require('./src/controllers/storeUser');
const loginController = require('./src/controllers/login');
const loginUserController = require('./src/controllers/loginUser');
const authMiddleware = require('./src/middlewares/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./src/middlewares/redirectIfAuthenticatedMiddleware');
const logoutController = require('./src/controllers/logout');
const getUserController = require('./src/controllers/getUser');
const getUsersController = require('./src/controllers/getUsers');
const getUserByIdController = require('./src/controllers/getUserById');
const likeUserController = require('./src/controllers/likeUser');
const updateUserController = require('./src/controllers/updateUser');
const messagesRouter = require('./src/routes/messages');
const User = require('./src/models/User');
const { createOrder, successPayments } = require('./src/services/paypal-api.js');
const Message = require('./src/models/Message');
const http = require('http');
const socketIo = require('socket.io');
const fs = require("fs");
const appRoot = require('app-root-path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sharp = require('sharp');

let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;

    paypalConfig();
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
          origin: "*", // Allow all origins
          methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');
      
        socket.on('sendMessage', (message) => {
          io.emit('receiveMessage', message);
        });
      
        socket.on('disconnect', () => {
          console.log('Client disconnected');
        });
    });

       // Increase the limit for the request body size
       app.use(bodyParser.json({ limit: '50mb' }));
       app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.use(express.json());
    app.use(cors());
    app.use(expressSession({
        secret: 'fe148abed5bbff4b5ac65ca7fa298bd12f0ef6a82d0546b5cd4f05427aa2037d',
        resave: false,
        saveUninitialized: false,
    }));

    global.loggedIn = null;
    app.use('*', (req, res, next) => {
        loggedIn = req.session.userId;
        next();
    });
    //Définition des CORS Middleware 
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin");
        res.setHeader("Access-Control-Allow-Origin", process.env.ORIGIN);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    });
    app.use('/messages', authMiddleware, messagesRouter);

    app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
    app.get('/auth/logout', logoutController);
    app.get('/auth/user', authMiddleware, getUserController);
    app.get('/auth/users', authMiddleware, getUsersController);
    app.get('/auth/users/:id', authMiddleware, getUserByIdController);
    app.get('/messages', authMiddleware, async (req, res) => {
        try {
            const messages = await Message.find().populate('sender receiver');
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get('/messages/:id', authMiddleware, async (req, res) => {
        try {
            const { id } = req.params;
            const messages = await Message.find({ $or: [{ sender: id }, { receiver: id }] }).populate('sender receiver');
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get('/', function (req, res) {
        res.json({ message: "Hello-world" });
    });

    app.get('/api/restaurant/:place_id', async (req, res) => {
        try {
            const { place_id } = req.params;
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.GOOGLE_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
            }

            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    });


    app.get('/api/restaurants', async (req, res) => {
        try {
            const { location, radius, keyword } = req.query;
            let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant`;
            if (keyword) {
                url += `&keyword=${keyword}`;
            }
            url += `&key=${process.env.GOOGLE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/restaurant/photo/:photo_reference', async (req, res) => {
        try {
            const { photo_reference } = req.params;
            const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${process.env.GOOGLE_API_KEY}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch photo: ${response.statusText}`);
            }

            const buffer = await response.buffer(); // Get the image as a buffer
            const base64Image = buffer.toString('base64'); // Convert to base64 string

            // Send back the base64 string
            res.json({ base64Image });
        } catch (error) {
            console.error('Error fetching photo:', error);
            res.status(500).json({ error: error.message });
        }
    });


    app.get('/api/restaurants/asian', async (req, res) => {
        try {
            const { location, radius } = req.query;
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=chinese&key=${process.env.GOOGLE_API_KEY}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/restaurants/italian', async (req, res) => {
        try {
            const { location, radius } = req.query;
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=italian&key=${process.env.GOOGLE_API_KEY}`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(path.join(__dirname, 'src/uploads'), "PATH JOIN");
            cb(null, (path.join(__dirname, 'src/uploads')));
        },
        filename: (req, file, cb) => {
            console.log(file, "FILE");
          cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });
      
      // Initialize upload
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const upload = multer({ storage: storage });
      
      // Serve static files from the uploads folder
      //app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

      // Upload endpoint
    app.post('/upload', upload.single('file'), async (req, res) => {
      console.log(req.file, "Recieved file");
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
    
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).send('File size exceeds the maximum limit of 5MB.');
      }

      const resizedFilePath = path.join(path.dirname(req.file.path), `resized-${req.file.filename}`);
    
      try {
        await sharp(req.file.path)
          .resize(400) // Resize to 400px width, maintaining aspect ratio
          .toFile(resizedFilePath); // Save with the same filename in the same directory
    
        res.json({ imageUrl: `uploads/resized-${req.file.filename}` });
      } catch (error) {
        console.error('Error resizing image:', error);
        res.status(500).send('Error processing image.');
      }
    });

    app.get('/uploads/:filename', (req, res) => {
      console.log(path.join(__dirname, `src/uploads/${req.params.filename}`), "PATH JOIN");
      res.sendFile(path.join(__dirname, `src/uploads/${req.params.filename}`));
    });


    //http://localhost:4000/uploads/file-1733443004501.jpg


    app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
    app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);
    app.post('/auth/users/:id/like', authMiddleware, likeUserController);
    app.post('/messages', authMiddleware, async (req, res) => {
        try {
            const { senderId, receiverId, content } = req.body;
            const message = new Message({ sender: senderId, receiver: receiverId, content });
            const addMessage = await message.save();
            const messageBDD = await Message.findById(addMessage._id).populate('sender receiver');
            io.emit('receiveMessage', messageBDD);
            console.log(messageBDD, "MESSAGE BDD");
            res.json(messageBDD);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post('/users/update', authMiddleware, updateUserController);

    app.post('/create-paypal-order', createOrder);


    app.post('/successPayments', successPayments);

    app.post('/resend-confirmation', async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.isEmailConfirmed) {
                return res.status(400).json({ message: 'Email is already confirmed' });
            }
            console.log(`Resending confirmation email to ${email}`);
            await user.resendConfirmationEmail();
            res.status(200).json({ message: 'Confirmation email resent' });
        } catch (error) {
            console.error('Error resending confirmation email:', error);
            res.status(500).json({ message: 'Error resending confirmation email' });
        }
    });
    
    app.post('/confirm-email', async (req, res) => {
        const { id } = req.body;
        console.log("Recieved ID", id);
        try {
          const user = await User.findOne({ emailConfirmationId: id });
          if (!user) {
            Console.log('Invalid confirmation ID');
            return res.status(400).json({ message: 'Invalid confirmation ID' });
          }
          user.isEmailConfirmed = true;
          user.emailConfirmationId = null; // Clear the confirmation ID
          await user.save();

          console.log(`Email confirmed for user ${user.email}`);

          res.status(200).json({ message: 'Email confirmed successfully', token });
        } catch (error) {
          console.error('Error confirming email:', error);
          res.status(500).json({ message: 'Error confirming email' });
        }
    });

// Configuration de l'algorithme de chiffrement et de la clé secrète
const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');


// Fonction pour dechiffrer le html dans le mail de confirmation
const decrypt = (hash, ignoreHmac = true) => {
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(hash.iv + hash.content)
    .digest('hex'); // Créer un HMAC avec les données chiffrées

    console.log("Decrypting hash:", hash);
    console.log("Generated HMAC:", hmac);
  //dechiffrer les données
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  console.log("Decrypted buffer:", decrypted);
  return decrypted.toString();
};

//route pour vérifier le token de confirmation d'email
app.get('/account/verify/:token', async (req, res) => {
    const token = req.params.token;
    console.log("Received token:", token);
    try {
        const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
        console.log("Decoded token:", decodedToken); // Add this line to log the decoded token

         // Assuming the decoded token is a hexadecimal string
         const [iv, content] = decodedToken.split(':');
         const hash = {
             iv,
             content
         };
         console.log("Parsed hash:", hash); // Log the parsed hash

        const decryptedEmail = decrypt(hash);
        console.log("Decrypted email:", decryptedEmail); // Log the decrypted email

        const user = await User.findOne({ emailConfirmationId: `${hash.iv}:${hash.content}` });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid confirmation ID' });
        }

        console.log('User found:', user);

        user.isEmailConfirmed = true;
        user.emailConfirmationId = null;
        await user.save();
        res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        console.error('Error confirming email:', error);
        res.status(500).json({ message: 'Error confirming email' });
    }
});
    
    app.get('/cancelPayments', (req, res) => {
        res.send('Payment canceled');
    });

    app.delete('/users/:id', authMiddleware, async (req, res) => {
        try {
          const { id } = req.params;
          const user = await User.findByIdAndDelete(id);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
          console.error('Error deleting user:', error);
          res.status(500).json({ message: 'Error deleting user' });
        }
      });

    async function main() {
        try {
            await mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster');
            console.log('Connected to MongoDB togeatherDb');
        } catch (error) {
            console.error('Connection error to MongoDB togeatherDb', error);
        }
    }

    main()
        .then(() => console.log('Database connection established'))
        .catch(console.error);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
