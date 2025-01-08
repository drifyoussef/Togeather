const express = require('express'); // Import express
const mongoose = require('mongoose'); // Import mongoose
const cors = require('cors'); // Import cors
const expressSession = require('express-session'); // Import express-session
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const { paypalConfig } = require('./src/config/paypalConfig'); // Import paypalConfig
const newUserController = require('./src/controllers/newUser'); // Import newUserController
const paypal = require('./src/services/paypal-api.js'); // Import paypal-api
const bodyParser = require('body-parser'); // Import body-parser
const storeUserController = require('./src/controllers/storeUser'); // Import storeUserController
const loginController = require('./src/controllers/login'); // Import loginController
const loginUserController = require('./src/controllers/loginUser'); // Import loginUserController
const authMiddleware = require('./src/middlewares/authMiddleware'); // Import authMiddleware
const redirectIfAuthenticatedMiddleware = require('./src/middlewares/redirectIfAuthenticatedMiddleware'); // Import redirectIfAuthenticatedMiddleware
const logoutController = require('./src/controllers/logout'); // Import logoutController
const getUserController = require('./src/controllers/getUser'); // Import getUserController
const getUsersController = require('./src/controllers/getUsers'); // Import getUsersController
const getUserByIdController = require('./src/controllers/getUserById'); // Import getUserByIdController
const likeUserController = require('./src/controllers/likeUser'); // Import likeUserController
const updateUserController = require('./src/controllers/updateUser'); // Import updateUserController
const messagesRouter = require('./src/routes/messages'); // Import messagesRouter
const User = require('./src/models/User'); // Import User Model
const { createOrder, successPayments } = require('./src/services/paypal-api.js'); // Import createOrder and successPayments de paypal-api
const Message = require('./src/models/Message');
const http = require('http'); // Import http
const socketIo = require('socket.io'); // Import socket.io pour les websockets (messages en temps réel)
const fs = require("fs");
const appRoot = require('app-root-path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Import crypto pour le chiffrement
const sharp = require('sharp'); // Import sharp pour le redimensionnement d'images

// import de fetch dynamique pour Node.js
let fetch;

(async () => {
    fetch = (await import('node-fetch')).default;

    paypalConfig();
    // Configuration de express, du serveur et de socket.io
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
        cors: {
          origin: "*", // Allow all origins
          methods: ["GET", "POST"]
        }
    });

    // Configuration de socket.io
    io.on('connection', (socket) => {
        console.log('New client connected');
      
        socket.on('sendMessage', (message) => {
          io.emit('receiveMessage', message);
        });
      
        socket.on('disconnect', () => {
          console.log('Client disconnected');
        });
    });

       // Configuration de body-parser pour récupérer les données du body
       app.use(bodyParser.json({ limit: '50mb' }));
       app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    // Configuration de express pour utiliser les middlewares
    app.use(express.json());
    app.use(cors());
    app.use(expressSession({
        secret: 'fe148abed5bbff4b5ac65ca7fa298bd12f0ef6a82d0546b5cd4f05427aa2037d',
        resave: false,
        saveUninitialized: false,
    }));

    // Configuration du middleware pour pouvoir utiliser les routes
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
    // Route avec middleware pour les messages en temps réel
    app.use('/messages', authMiddleware, messagesRouter);

    // Recupération des routes
    //Route pour s'enregistrer si la personne est enregistrée la redirection se fait vers la page de connexion 
    // et la personne est enregistrée dans la base de données
    app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
    // Route pour se déconnecter
    app.get('/auth/logout', logoutController);
    // Route pour se connecter
    app.get('/auth/user', authMiddleware, getUserController);
    // Route pour récupérer les utilisateurs
    app.get('/auth/users', authMiddleware, getUsersController);
    // Route pour récupérer un utilisateur par son id
    app.get('/auth/users/:id', authMiddleware, getUserByIdController);
    // Route pour récuperer les messages
    app.get('/messages', authMiddleware, async (req, res) => {
        try {
            const messages = await Message.find().populate('sender receiver');
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Route pour récupérer les messages d'un utilisateur via l'id du destinataire ou de l'expéditeur
    app.get('/messages/:id', authMiddleware, async (req, res) => {
        try {
            const { id } = req.params;
            const messages = await Message.find({ $or: [{ sender: id }, { receiver: id }] }).populate('sender receiver');
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Route par défaut (Hello World)
    app.get('/', function (req, res) {
        res.json({ message: "Hello-world" });
    });


    // Route pour avoir les informations d'un restaurant
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


    // Route pour récupérer les restaurants
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

    // Route pour récupérer les photos d'un restaurant
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


    // Route pour récupérer les restaurants asiatiques
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

    // Route pour récupérer les restaurants italiens
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

    // Stocker les images dans le dossier uploads
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
      
    // Initialisation de l'upload avec mutler (limiter la taille des fichiers à 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const upload = multer({ storage: storage });
      
      // Serve static files from the uploads folder
      //app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

    // Route pour uploader une image
    app.post('/upload', upload.single('file'), async (req, res) => {
      console.log(req.file, "Recieved file");
      // Si pas de fichier, on renvoie une erreur 400
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
    
      // Si la taille du fichier dépasse la limite de 5MB, on renvoie une erreur 400
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).send('File size exceeds the maximum limit of 5MB.');
      }

      // Redimensionner l'image pour pas qu'elle soit trop grande
      const resizedFilePath = path.join(path.dirname(req.file.path), `resized-${req.file.filename}`);
    
      try {
        // Sharp pour redimensionner l'image
        await sharp(req.file.path)
          .resize(400) // Redimensionner l'image à 400 pixels de large
          .toFile(resizedFilePath); // Sauvegarder l'image redimensionnée avec un nouveau nom de fichier (resized- en plus)
    
        // Réponse avec le chemin de l'image redimensionnée
        res.json({ imageUrl: `uploads/resized-${req.file.filename}` });
      } catch (error) {
        console.error('Error resizing image:', error);
        res.status(500).send('Error processing image.');
      }
    });

    // Route pour récupérer une image avec son nom de fichier
    app.get('/uploads/:filename', (req, res) => {
      console.log(path.join(__dirname, `src/uploads/${req.params.filename}`), "PATH JOIN");
      res.sendFile(path.join(__dirname, `src/uploads/${req.params.filename}`));
    });


    //${process.env.REACT_APP_API_URL}/uploads/file-1733443004501.jpg


    // Route pour s'enregistrer
    app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);
    // Route pour se connecter
    app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);
    // Route pour liker un utilisateur
    app.post('/auth/users/:id/like', authMiddleware, likeUserController);
    // Route pour envoyer un message
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

    // Route pour mettre à jour un utilisateur
    app.post('/users/update', authMiddleware, updateUserController);

    // Route pour créer une commande PayPal
    app.post('/create-paypal-order', createOrder);

    // Route pour valider un paiement PayPal
    app.post('/successPayments', successPayments);

    // Route pour renvoyer un email de confirmation
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

    // Route pour confirmer l'email
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
    // token est envoyé dans l'url
    const token = req.params.token;
    console.log("Received token:", token);
    try {
        const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
        console.log("Decoded token:", decodedToken); // Add this line to log the decoded token

         // Séparer l'IV et le contenu
         const [iv, content] = decodedToken.split(':');
         const hash = {
             iv,
             content
         };
         console.log("Parsed hash:", hash); // Log the parsed hash

        // Déchiffrer l'email
        const decryptedEmail = decrypt(hash);
        console.log("Decrypted email:", decryptedEmail); // Log the decrypted email

        // Rechercher l'utilisateur avec l'email déchiffré
        const user = await User.findOne({ emailConfirmationId: `${hash.iv}:${hash.content}` });
        // Si l'utilisateur n'existe pas, renvoyer une erreur 400
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid confirmation ID' });
        }

        console.log('User found:', user);

        // Si l'utilisateur existe, confirmer l'email
        user.isEmailConfirmed = true;
        user.emailConfirmationId = null;
        await user.save();
        res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        // En cas d'erreur, renvoyer une erreur 500
        console.error('Error confirming email:', error);
        res.status(500).json({ message: 'Error confirming email' });
    }
});
    // Route pour annuler un paiement PayPal
    app.get('/cancelPayments', (req, res) => {
        res.send('Payment canceled');
    });

    // Route pour supprimer un utilisateur
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

    // Connexion au serveur MongoDB
    async function main() {
        try {
            await mongoose.connect('mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster');
            console.log('Connected to MongoDB togeatherDb');
        } catch (error) {
            console.error('Connection error to MongoDB togeatherDb', error);
        }
    }

    // Lancer le serveur
    main()
        .then(() => console.log('Database connection established'))
        .catch(console.error);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
