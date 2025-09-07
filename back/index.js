require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Import express
const mongoose = require("mongoose"); // Import mongoose
const cors = require("cors"); // Import cors
const expressSession = require("express-session"); // Import express-session
const multer = require("multer"); // Import multer
const path = require("path"); // Import path
const { paypalConfig } = require("./src/config/paypalConfig"); // Import paypalConfig
const newUserController = require("./src/controllers/newUser"); // Import newUserController
const paypal = require("./src/services/paypal-api.js"); // Import paypal-api
const bodyParser = require("body-parser"); // Import body-parser
const storeUserController = require("./src/controllers/storeUser"); // Import storeUserController
const loginController = require("./src/controllers/login"); // Import loginController
const loginUserController = require("./src/controllers/loginUser"); // Import loginUserController
const loginAdminController = require("./src/controllers/loginAdmin"); // Import loginAdminController
const authMiddleware = require("./src/middlewares/authMiddleware"); // Import authMiddleware
const redirectIfAuthenticatedMiddleware = require("./src/middlewares/redirectIfAuthenticatedMiddleware"); // Import redirectIfAuthenticatedMiddleware
const adminMiddleware = require("./src/middlewares/adminMiddleware"); // Import adminMiddleware
const logoutController = require("./src/controllers/logout"); // Import logoutController
const getUserController = require("./src/controllers/getUser"); // Import getUserController
const getUsersController = require("./src/controllers/getUsers"); // Import getUsersController
const getUserByIdController = require("./src/controllers/getUserById"); // Import getUserByIdController
const likeUserController = require("./src/controllers/likeUser"); // Import likeUserController
const updateUserController = require("./src/controllers/updateUser"); // Import updateUserController
const messagesRouter = require("./src/routes/messages"); // Import messagesRouter
const User = require("./src/models/User"); // Import User Model
const cron = require("node-cron"); // Import node-cron for scheduling tasks
const {
  createOrder,
  successPayments,
} = require("./src/services/paypal-api.js"); // Import createOrder and successPayments de paypal-api
const Message = require("./src/models/Message");
const http = require("http"); // Import http
const socketIo = require("socket.io"); // Import socket.io pour les websockets (messages en temps réel)
const fs = require("fs");
const appRoot = require("app-root-path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Import crypto pour le chiffrement
const sharp = require("sharp"); // Import sharp pour le redimensionnement d'images
const swaggerJsdoc = require("swagger-jsdoc"); // Import swagger-jsdoc
const swaggerUi = require("swagger-ui-express"); // Import swagger-ui-express

// import de fetch dynamique pour Node.js
let fetch;

(async () => {
  fetch = (await import("node-fetch")).default;

  paypalConfig();
  // Configuration de express, du serveur et de socket.io
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    },
  });

  // Configuration de socket.io
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("sendMessage", (message) => {
      io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Configuration de body-parser pour récupérer les données du body
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  // Log raw body pour le débogage
  app.use((req, res, next) => {
    console.log("BODY RAW:", req.body);
    next();
  });

  // Swagger setup
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Togeather API",
        version: "1.0.0",
        description: "Documentation API pour le site web Togeather",
      },
      servers: [
        {
          url: `${process.env.REACT_APP_API_URL}`,
        },
      ],
    },
    apis: ["./index.js"], // Path to the API docs
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  //Définition des CORS Middleware
  const allowedOrigins = [process.env.ORIGIN, process.env.BACKOFFICE];
  // Configuration de express pour utiliser les middlewares
  app.use(express.json());
  app.use(
    cors({
      origin: function (origin, callback) {
        console.log("CORS Origin:", origin);
        console.log("Allowed Origins:", allowedOrigins);
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
  app.use(
    expressSession({
      secret:
        "fe148abed5bbff4b5ac65ca7fa298bd12f0ef6a82d0546b5cd4f05427aa2037d",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Configuration du middleware pour pouvoir utiliser les routes
  global.loggedIn = null;
  app.use("*", (req, res, next) => {
    loggedIn = req.session.userId;
    next();
  });

  // Route avec middleware pour les messages en temps réel
  app.use("/api/messages", authMiddleware, messagesRouter);

  // Recupération des routes
  //Route pour s'enregistrer si la personne est enregistrée la redirection se fait vers la page de connexion
  // et la personne est enregistrée dans la base de données
  /**
   * @swagger
   * /auth/register:
   *   get:
   *     summary: Enregistre un nouvel utilisateur
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Registration page
   *       302:
   *         description: Redirect if already authenticated
   *       500:
   *         description: Internal server error
   */
  app.get(
    "/api/auth/register",
    redirectIfAuthenticatedMiddleware,
    newUserController
  );
  // Route pour se déconnecter
  /**
   * @swagger
   * /auth/logout:
   *   get:
   *     summary: Déconnecte l'utilisateur
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Successful logout
   *       500:
   *         description: Internal server error
   */
  app.get("/api/auth/logout", logoutController);
  // Route pour se connecter
  /**
   * @swagger
   * /auth/user:
   *   get:
   *     summary: Récupère l'utilisateur connecté
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Authenticated user retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  app.get(
    "/api/auth/user",
    authMiddleware,
    getUserController,
    async (req, res) => {
      try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        if (user.isBanned) {
          // Récupérer le dernier message signalé de l'utilisateur
          const lastReportedMessage = await Message.findOne({
            sender: user._id,
            reports: { $exists: true, $not: { $size: 0 } },
          })
            .sort({ "reports.reportedAt": -1 })
            .lean();

          return res.status(403).json({
            message: "Vous êtes banni",
            banReason: user.banReason,
            banEnd: user.banEnd,
            bannedMessage: lastReportedMessage
              ? lastReportedMessage.content
              : undefined,
          });
        }
        res.status(200).json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user" });
      }
    }
  );

  app.get("/api/me", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ message: "Access denied. No token provided." });
      }

      const decryptedEmail = decryptToken(token); // Reuse the decryption logic
      const user = await User.findOne({ email: decryptedEmail });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Route pour récupérer les utilisateurs
  /**
   * @swagger
   * /auth/users:
   *   get:
   *     summary: Récupère tous les utilisateurs
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  app.get("/api/auth/users", authMiddleware, getUsersController);
  // Route pour récupérer un utilisateur par son id
  /**
   * @swagger
   * /auth/users/{id}:
   *   get:
   *     summary: Récupère un utilisateur par son id
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  app.get("/api/auth/users/:id", authMiddleware, getUserByIdController);
  // Route pour récuperer les messages
  /**
   * @swagger
   * /messages:
   *   get:
   *     summary: Récupère tous les messages
   *     tags: [Messages]
   *     responses:
   *       200:
   *         description: Messages retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  app.get("/api/messages", authMiddleware, async (req, res) => {
    try {
      const messages = await Message.find().populate("sender receiver");
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/reports", authMiddleware, async (req, res) => {
    try {
      const reportedMessages = await Message.find({
        reports: { $exists: true, $not: { $size: 0 } },
      })
        .populate({
          path: "sender",
          select: "firstname name email",
          options: { strictPopulate: false },
        })
        .populate({
          path: "reports.reportedBy",
          select: "firstname name email",
          options: { strictPopulate: false },
        });

      console.log(JSON.stringify(reportedMessages, null, 2));

      res.status(200).json(reportedMessages);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des reports." });
    }
  });

  // Route pour récupérer les messages d'un utilisateur via l'id du destinataire ou de l'expéditeur
  /**
   * @swagger
   * /messages/{id}:
   *   get:
   *     summary: Récupère les messages d'un utilisateur via son id ou l'id du destinataire
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: Messages retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  app.get("/api/messages/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await Message.find({
        $or: [{ sender: id }, { receiver: id }],
      }).populate("sender receiver");
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Route pour signaler un message
  /**
   * @swagger
   * /messages/{id}/report:
   *   post:
   *     summary: Signaler un message
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID du message à signaler
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Raison du signalement
   *     responses:
   *       200:
   *         description: Message reported successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Message not found
   *       500:
   *         description: Internal server error
   */
  app.post("/api/messages/:id/report", authMiddleware, async (req, res) => {
    const { reason } = req.body;
    const { id } = req.params;
    if (!id || !reason) {
      return res
        .status(400)
        .json({ message: "Message ID and reason are required." });
    }
    try {
      // On peuple le sender pour avoir l'auteur du message signalé
      const message = await Message.findById(id)
        .populate("sender", "firstname name email")
        .exec();
      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      // Récupérer le reporteur
      const reporter = await User.findById(req.user._id).select(
        "firstname name"
      );

      // Stocker le report dans le message
      if (!message.reports) message.reports = [];
      message.reports.push({
        reportedBy: req.user._id,
        reason,
        reportedAt: new Date(),
      });
      await message.save();

      // Log complet avec le bon reporté
      console.log(
        `Report: "${reporter?.firstname} ${reporter?.name}" a signalé le message de "${message.sender?.firstname} ${message.sender?.name}" pour la raison : "${reason}"`
      );

      console.log(
        `${message.sender} "données de l'utilisateur signalé", ${message.sender.name} "NOM DE L'UTILISATEUR SIGNALÉ"`
      );

      res.status(200).json({ message: "Message reported successfully." });
    } catch (error) {
      console.error("Error reporting message:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

  // Suppression de la conversation et du match entre deux utilisateurs
  app.delete("/api/conversations/:userId", authMiddleware, async (req, res) => {
    console.log(req.user_id, "USER ID BEFORE MONGOOSE TYPES");
    const userId = new mongoose.Types.ObjectId(req.user._id); // utilisateur connecté
    console.log(userId, "USER ID AFTER MONGOOSE TYPES");
    const otherUserId = new mongoose.Types.ObjectId(req.params.userId);

    console.log("TYPE DES UTILISATEURS", typeof userId, typeof otherUserId); // doit être 'object' (ObjectId)

    console.log("userId", userId);
    console.log("otherUserId", otherUserId);

    try {
      // Supprimer tous les messages entre les deux utilisateurs
      await Message.deleteMany({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
      });

      const user = await User.findById(userId);
      const otherUser = await User.findById(otherUserId);
      console.log("Avant suppression:", user.likedBy, otherUser.likedBy);

      // Supprimer le match dans les deux sens
      await User.updateOne(
        { _id: userId },
        { $pull: { mutualMatches: otherUserId, likedBy: otherUserId } }
      );
      await User.updateOne(
        { _id: otherUserId },
        { $pull: { mutualMatches: userId, likedBy: userId } }
      );

      console.log("DELETE match", { userId });
      console.log("DELETE match", { otherUserId });

      res.status(200).json({ message: "Conversation et match supprimés." });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      res.status(500).json({ message: "Erreur lors de la suppression." });
    }
  });

  // Route par défaut (Hello World)
  /**
   * @swagger
   * /:
   *   get:
   *     summary: Default route
   *     tags: [Default]
   *     responses:
   *       200:
   *         description: Hello-world message
   */
  app.get("/", function (req, res) {
    res.json({ message: "Hello-world" });
  });

  // Route pour avoir les informations d'un restaurant
  app.get("/api/restaurant/:place_id", async (req, res) => {
    try {
      const { place_id } = req.params;
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.GOOGLE_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch restaurant details: ${response.statusText}`
        );
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /api/restaurants:
   *   get:
   *     summary: Réccupère les restaurants
   *     tags: [Restaurants]
   *     parameters:
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *         required: true
   *         description: Location coordinates
   *       - in: query
   *         name: radius
   *         schema:
   *           type: integer
   *         required: true
   *         description: Search radius
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *         required: false
   *         description: Search keyword
   *     responses:
   *       200:
   *         description: Successful retrieval of restaurants
   *       500:
   *         description: Internal server error
   */
  // Route pour récupérer les restaurants
  app.get("/api/restaurants", async (req, res) => {
    try {
      const { location, radius, keyword } = req.query;
      console.log(`Restaurants API called with: location=${location}, radius=${radius}, keyword=${keyword}`);
      
      // Vérifier si la clé Google API est configurée
      if (!process.env.GOOGLE_API_KEY) {
        console.error("Google API Key not configured");
        return res.status(500).json({ 
          error: "Google API Key not configured. Please set GOOGLE_API_KEY environment variable." 
        });
      }

      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant`;
      if (keyword) {
        url += `&keyword=${keyword}`;
      }
      url += `&key=${process.env.GOOGLE_API_KEY}`;
      
      console.log(`Google Places API URL: ${url}`);

      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Google Places API response status: ${data.status}`);
      if (data.error_message) {
        console.error(`Google Places API error message: ${data.error_message}`);
      }

      // Vérifier si l'API Google a retourné une erreur
      if (data.status !== "OK") {
        console.error(`Google Places API error: ${data.status}, details: ${data.error_message || "Unknown error"}`);
        return res.status(400).json({ 
          error: `Google Places API error: ${data.status}`,
          details: data.error_message || "Unknown error"
        });
      }

      // Limiter les résultats à 4 restaurants
      const limitedResults = data.results.slice(0, 4);
      console.log(`Returning ${limitedResults.length} restaurants`);

      res.json({ results: limitedResults });
    } catch (error) {
      console.error(`Restaurants API error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour récupérer les photos d'un restaurant
  app.get("/api/restaurant/photo/:photo_reference", async (req, res) => {
    try {
      const { photo_reference } = req.params;
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${process.env.GOOGLE_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch photo: ${response.statusText}`);
      }

      const buffer = await response.buffer(); // Get the image as a buffer
      const base64Image = buffer.toString("base64"); // Convert to base64 string

      // Send back the base64 string
      res.json({ base64Image });
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour récupérer les restaurants asiatiques
  app.get("/api/restaurants/asian", async (req, res) => {
    try {
      const { location, radius } = req.query;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=chinese&key=${process.env.GOOGLE_API_KEY}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour récupérer les restaurants italiens
  app.get("/api/restaurants/italian", async (req, res) => {
    try {
      const { location, radius } = req.query;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=italian&key=${process.env.GOOGLE_API_KEY}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Stocker les images dans le dossier uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsPath = "/usr/src/uploads"; // ✅ HORS du répertoire app
      console.log(uploadsPath, "UPLOADS PATH");
      cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
      console.log(file, "FILE");
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  // Initialisation de l'upload avec mutler (limiter la taille des fichiers à 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: MAX_FILE_SIZE, // Limite de taille dans Multer
      fieldSize: MAX_FILE_SIZE // Limite pour les champs
    },
    fileFilter: (req, file, cb) => {
      // Vérifier le type de fichier
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Seuls les fichiers image sont autorisés!'), false);
      }
    }
  });

  // Serve static files from the uploads folder
  app.use('/api/uploads', express.static('/usr/src/uploads'));
  //app.use('/api/uploads', (req, res, next) => {
  //  return res.json({ message: "Uploads endpoint" });
  //});

  // Route pour uploader une image
  /**
   * @swagger
   * /upload:
   *   post:
   *     summary: Upload une image
   *     tags: [Upload]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: The image file to upload
   *     responses:
   *       200:
   *         description: Image uploaded and resized successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 imageUrl:
   *                   type: string
   *                   description: URL of the resized image
   *       400:
   *         description: No file uploaded or file size exceeds the limit
   *       500:
   *         description: Error processing image
   */
  app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, async (err) => {
      // Gestion des erreurs Multer
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "Le fichier est trop volumineux (max 10MB)" });
        }
        return res.status(400).json({ error: `Erreur upload: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      console.log(req.file, "Recieved file");
      // Si pas de fichier, on renvoie une erreur 400
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier uploadé" });
      }

      try {
        // Obtenir les métadonnées de l'image pour vérifier ses dimensions
        const metadata = await sharp(req.file.path).metadata();
        console.log(`Image originale: ${metadata.width}x${metadata.height}px, taille: ${req.file.size} bytes`);

        // Créer le nom du fichier redimensionné (garder l'extension originale)
        const fileExtension = path.extname(req.file.filename);
        const fileName = path.basename(req.file.filename, fileExtension);
        const resizedFileName = `resized-${fileName}${fileExtension}`;
        const resizedFilePath = path.join(path.dirname(req.file.path), resizedFileName);

        // Sharp pour redimensionner l'image avec une meilleure qualité
        await sharp(req.file.path)
          .resize({
            width: 400,
            height: 400,
            fit: 'cover', // Recadre l'image pour maintenir les proportions
            position: 'center'
          })
          .jpeg({ quality: 85 }) // Convertir tout en JPEG pour standardiser
          .toFile(resizedFilePath);

        // Supprimer le fichier original pour économiser l'espace
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting original file:", err);
          else console.log("Original file deleted successfully");
        });

        console.log(`Image redimensionnée et sauvegardée: ${resizedFilePath}`);

        // Réponse avec le chemin de l'image redimensionnée
        res.json({ imageUrl: `uploads/${resizedFileName}` });
      } catch (error) {
        console.error("Error resizing image:", error);
        res.status(500).json({ error: "Erreur lors du traitement de l'image" });
      }
    });
  });

  // Route pour récupérer une image avec son nom de fichier
  /**
   * @swagger
   * /uploads/{filename}:
   *   get:
   *     summary: Récupère une image par son nom de fichier
   *     tags: [Upload]
   *     parameters:
   *       - in: path
   *         name: filename
   *         schema:
   *           type: string
   *         required: true
   *         description: The name of the file to retrieve
   *     responses:
   *       200:
   *         description: File retrieved successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Internal server error
   */
  app.get("/api/uploads/:filename", (req, res) => {
  console.log(
    path.join("/usr/src/uploads", req.params.filename),
    "PATH JOIN"
  );
  res.sendFile(path.join("/usr/src/uploads", req.params.filename));
});

  //${process.env.REACT_APP_API_URL}/uploads/file-1733443004501.jpg

  // Route pour s'enregistrer
  /**
   * @swagger
   * /users/register:
   *   post:
   *     summary: Enregistre un nouvel utilisateur
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               firstname:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               age:
   *                 type: integer
   *               job:
   *                 type: string
   *               passions:
   *                 type: array
   *                 items:
   *                   type: string
   *               userGender:
   *                 type: string
   *               preferredGender:
   *                 type: string
   *               favoriteCategory:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  app.post(
    "/api/users/register",
    redirectIfAuthenticatedMiddleware,
    storeUserController
  );
  // Route pour se connecter
  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Connecte un utilisateur
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   *                 userId:
   *                   type: string
   *                 firstname:
   *                   type: string
   *       401:
   *         description: Invalid email or password
   *       500:
   *         description: Internal server error
   */
  app.post(
    "/api/users/login",
    redirectIfAuthenticatedMiddleware,
    loginUserController
  );
  // Route pour liker un utilisateur
  /**
   * @swagger
   * /auth/users/{id}/like:
   *   post:
   *     summary: Like un utilisateur
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User liked successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  app.post(
    "/api/auth/admin/login",
    redirectIfAuthenticatedMiddleware,
    loginAdminController
  );

  app.post("/api/auth/users/:id/like", authMiddleware, likeUserController);
  // Route pour envoyer un message
  /**
   * @swagger
   * /messages:
   *   post:
   *     summary: Envoyer un message
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               senderId:
   *                 type: string
   *                 description: ID of the sender
   *               receiverId:
   *                 type: string
   *                 description: ID of the receiver
   *               content:
   *                 type: string
   *                 description: Content of the message
   *     responses:
   *       200:
   *         description: Message sent successfully
   *       500:
   *         description: Internal server error
   */
  app.post("/api/messages", authMiddleware, async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body;
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
      });
      const addMessage = await message.save();
      const messageBDD = await Message.findById(addMessage._id).populate(
        "sender receiver"
      );
      io.emit("receiveMessage", messageBDD);
      console.log(messageBDD, "MESSAGE BDD");
      res.json(messageBDD);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Route pour mettre à jour un utilisateur
  /**
   * @swagger
   * /users/update:
   *   put:
   *     summary: Met à jour les informations d'un utilisateur
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               firstname:
   *                 type: string
   *               email:
   *                 type: string
   *               age:
   *                 type: integer
   *               job:
   *                 type: string
   *               passions:
   *                 type: array
   *                 items:
   *                   type: string
   *               userGender:
   *                 type: string
   *               preferredGender:
   *                 type: string
   *               favoriteCategory:
   *                 type: string
   *     responses:
   *       200:
   *         description: User information updated successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  app.post("/api/users/update", authMiddleware, updateUserController);

  // Route pour créer une commande PayPal
  /**
   * @swagger
   * /create-paypal-order:
   *   post:
   *     summary: Créer une commande PayPal
   *     tags: [PayPal]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 description: The amount for the order
   *     responses:
   *       201:
   *         description: PayPal order created successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  app.post("/api/create-paypal-order", createOrder);

  /**
   * @swagger
   * /successPayments:
   *   post:
   *     summary: Valider un paiement PayPal
   *     tags: [PayPal]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               orderId:
   *                 type: string
   *                 description: The ID of the PayPal order
   *     responses:
   *       200:
   *         description: PayPal payment validated successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  // Route pour valider un paiement PayPal
  app.post("/api/successPayments", authMiddleware, successPayments);

  // Route pour renvoyer un email de confirmation
  app.post("/api/resend-confirmation", async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.isEmailConfirmed) {
        return res.status(400).json({ message: "Email is already confirmed" });
      }
      console.log(`Resending confirmation email to ${email}`);
      await user.resendConfirmationEmail();
      res.status(200).json({ message: "Confirmation email resent" });
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      res.status(500).json({ message: "Error resending confirmation email" });
    }
  });

  // Route pour confirmer l'email
  /**
   * @swagger
   * /confirm-email:
   *   post:
   *     summary: Confirmer l'email d'un utilisateur
   *     tags: [Email]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               confirmationCode:
   *                 type: string
   *     responses:
   *       200:
   *         description: Email confirmed successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  app.post("/api/confirm-email", async (req, res) => {
    const { id } = req.body;
    console.log("Recieved ID", id);
    try {
      const user = await User.findOne({ emailConfirmationId: id });
      if (!user) {
        Console.log("Invalid confirmation ID");
        return res.status(400).json({ message: "Invalid confirmation ID" });
      }
      user.isEmailConfirmed = true;
      user.emailConfirmationId = null; // Clear the confirmation ID
      await user.save();

      console.log(`Email confirmed for user ${user.email}`);

      res.status(200).json({ message: "Email confirmed successfully", token });
    } catch (error) {
      console.error("Error confirming email:", error);
      res.status(500).json({ message: "Error confirming email" });
    }
  });

  // Configuration de l'algorithme de chiffrement et de la clé secrète
  const algorithm = "aes-256-cbc";
  const secretKey = Buffer.from(process.env.SECRET_KEY, "hex");

  // Fonction pour dechiffrer le html dans le mail de confirmation
  const decrypt = (hash, ignoreHmac = true) => {
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(hash.iv + hash.content)
      .digest("hex"); // Créer un HMAC avec les données chiffrées

    console.log("Decrypting hash:", hash);
    console.log("Generated HMAC:", hmac);
    //dechiffrer les données
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, "hex")
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, "hex")),
      decipher.final(),
    ]);
    console.log("Decrypted buffer:", decrypted);
    return decrypted.toString();
  };

  //route pour vérifier le token de confirmation d'email
  /**
   * @swagger
   * /account/verify/{token}:
   *   get:
   *     summary: Vérifie le token de confirmation d'email
   *     tags: [Email]
   *     parameters:
   *       - in: path
   *         name: token
   *         schema:
   *           type: string
   *         required: true
   *         description: Verification token
   *     responses:
   *       200:
   *         description: Email verified successfully
   *       400:
   *         description: Invalid token
   *       500:
   *         description: Internal server error
   */
  app.get("/api/account/verify/:token", async (req, res) => {
    // token est envoyé dans l'url
    const token = req.params.token;
    console.log("Received token:", token);
    try {
      const decodedToken = Buffer.from(token, "base64").toString("utf-8");
      console.log("Decoded token:", decodedToken); // Add this line to log the decoded token

      // Séparer l'IV et le contenu
      const [iv, content] = decodedToken.split(":");
      const hash = {
        iv,
        content,
      };
      console.log("Parsed hash:", hash); // Log the parsed hash

      // Déchiffrer l'email
      const decryptedEmail = decrypt(hash);
      console.log("Decrypted email:", decryptedEmail); // Log the decrypted email

      // Rechercher l'utilisateur avec l'email déchiffré
      const user = await User.findOne({
        emailConfirmationId: `${hash.iv}:${hash.content}`,
      });
      // Si l'utilisateur n'existe pas, renvoyer une erreur 400
      if (!user) {
        console.log("User not found");
        return res.status(400).json({ message: "Invalid confirmation ID" });
      }

      console.log("User found:", user);

      // Si l'utilisateur existe, confirmer l'email
      user.isEmailConfirmed = true;
      user.emailConfirmationId = null;
      await user.save();
      res.status(200).json({ message: "Email confirmed successfully" });
    } catch (error) {
      // En cas d'erreur, renvoyer une erreur 500
      console.error("Error confirming email:", error);
      res.status(500).json({ message: "Error confirming email" });
    }
  });
  // Route pour annuler un paiement PayPal
  /**
   * @swagger
   * /cancelPayments:
   *   get:
   *     summary: Annule un paiement PayPal
   *     tags: [PayPal]
   *     responses:
   *       200:
   *         description: Payment canceled
   *       500:
   *         description: Internal server error
   */
  app.get("/api/cancelPayments", (req, res) => {
    res.send("Payment canceled");
  });

  // Route pour supprimer un utilisateur
  /**
   * @swagger
   * /auth/unsubscribe:
   *   post:
   *     summary: Désinscription d'un utilisateur
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User unsubscribed successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */

  app.post("/api/auth/unsubscribe", authMiddleware, async (req, res) => {
    try {
      const userId = req.user._id; // Récupérer l'ID de l'utilisateur connecté
      const user = await User.findByIdAndUpdate(
        userId,
        { isPremium: false },
        { new: true } // Retourner l'utilisateur mis à jour
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User unsubscribed successfully" });
    } catch (error) {
      console.error("Error unsubscribing user:", error);
      res.status(500).json({ message: "Error unsubscribing user" });
    }
  });

  // Route pour supprimer un utilisateur
  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Supprime un utilisateur grâce à son id
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  app.delete("/api/users/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Supprimer tous les messages où il est sender ou receiver
      await Message.deleteMany({
        $or: [{ sender: id }, { receiver: id }],
      });

      // 2. Retirer son ID des likes et mutualMatches des autres utilisateurs
      await User.updateMany(
        {},
        {
          $pull: {
            likedBy: id,
            mutualMatches: id,
          },
        }
      );

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  app.post("/api/auth/users/ban", authMiddleware, async (req, res) => {
    try {
      const { id, isBanned, banReason, banEnd } = req.body;
      console.log(
        "Data received from frontend:",
        id,
        isBanned,
        banReason,
        banEnd
      );
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.isBanned = isBanned;
      user.banReason = isBanned ? banReason || null : null; // Assurez-vous que banReason est null si non défini
      user.banEnd = isBanned ? (banEnd ? new Date(banEnd) : null) : null; // Convertir banEnd en Date ou null
      console.log(`User ${id} isBanned status updated to:`, isBanned);
      await user.save();
      res.status(200).json({
        message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
      });
      console.log("User after save:", user);
    } catch (error) {
      console.error("Error checking if user is banned:", error);
      res.status(500).json({ message: "Error checking if user is banned" });
    }
  });

  // Connexion au serveur MongoDB
  async function main() {
    try {
      await mongoose.connect(
        "mongodb+srv://youssefdrif1:dDrZdxQ519mc4zMM@togeathercluster.h2rtsua.mongodb.net/?retryWrites=true&w=majority&appName=TogeatherCluster"
      );
      console.log("Connected to MongoDB togeatherDb");
    } catch (error) {
      console.error("Connection error to MongoDB togeatherDb", error);
    }
  }

  console.log("CRON: about to be scheduled");
  console.log("CRON: running at", new Date());

  // Toutes les minutes, vérifie les bans expirés
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const usersBanned = await User.find({
        isBanned: true,
        banEnd: { $lte: now, $ne: null },
      });
      //console.log("CRON: Nombre d'utilisateurs bannis:", usersBanned.length);

      for (const user of usersBanned) {
        user.isBanned = false;
        user.banReason = null;
        user.banEnd = null;
        await user.save();
        console.log(`User ${user.email} automatically unbanned by cron.`);
      }
    } catch (err) {
      console.error("Error in cron unban:", err);
    }
  });

  // Lancer le serveur
  main()
    .then(() => console.log("Database connection established"))
    .catch(console.error);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
