const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./push-notifications.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Notification endpoint
app.post('/send-notification', async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'FCM token is required' });
  }

  try {
    const message = {
      token: token,
      notification: {
        title: title || 'Default Title',
        body: body || 'Default Message',
      },
      data: data || {}, // Optional additional data
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    
    res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});