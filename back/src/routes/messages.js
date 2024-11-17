const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /messages
router.post('/', authMiddleware, async (req, res) => {
  const { content, receiverId } = req.body;
  const senderId = req.user._id;

  if (!content || !receiverId) {
    return res.status(400).json({ error: 'Content and receiverId are required' });
  }

  try {
    const newMessage = new Message({
      content,
      sender: senderId,
      receiver: receiverId,
      createdAt: new Date(),
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
  
    try {
      const messages = await Message.find({
        $or: [
          { sender: req.user._id, receiver: id },
          { sender: id, receiver: req.user._id }
        ]
      })
      .populate('sender', 'firstname lastname _id') // Populate sender
      .populate('receiver', 'firstname lastname _id') // Populate receiver
      .sort({ createdAt: 1 });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;