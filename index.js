const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3040;
const corsoptions =[
    'http://127.0.0.1:5500/'
]
const serviceAccount = require('./auth.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
app.use(cors(corsoptions));
const db = admin.firestore();

app.use(bodyParser.json());
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/register', async (req, res) => {
  try {
    console.log("Reh");
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const userRef = await db.collection('users').add({
      email: email,
      password: password
    });

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const querySnapshot = await db.collection('users').where('email', '==', email).get();

    if (querySnapshot.empty) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.password !== password) {
      res.status(401).json({ message: 'Wrong password' });
      return;
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
