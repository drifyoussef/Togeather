const mongoose = require('mongoose');

// Création du schéma Message
const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reports: [
    {
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      reportedAt: Date,
      selectedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Ajout de l'utilisateur sélectionné
    },
  ],
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;