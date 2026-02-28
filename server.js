// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const ElasticEmail = require('@elasticemail/elasticemail-client');
const cors = require('cors');
require('dotenv').config();

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nisrinemazouzi:hazime1234@gp1.m3jjc.mongodb.net/?retryWrites=true&w=majority&appName=GP1";
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 3001;
const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY || '430EE8D05881867890323608A6C35A0AD518414217C85DF192E907F1F6A2A45505559B740C45FEF499BDF9F2ACAE709A';
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || 'm20222022509@gmail.com';

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
mongoose.set('debug', true);

// Define user schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, email, password, c_pass } = req.body;

    if (password !== c_pass) {
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, error: 'Server error occurred while registering the user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        req.session.user = { username: user.username };
        res.status(200).json({ success: true, username: user.username });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, error: 'Server error occurred during login' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Failed to log out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Initialize Elastic Email API client
        const client = new ElasticEmail.ApiClient();
        client.authentications['apikey'].apiKey = ELASTIC_EMAIL_API_KEY;

        const emailApi = new ElasticEmail.EmailsApi(client);

        // Email payload
        const emailData = {
            Recipients: [{ Email: RECEIVER_EMAIL }],
            Content: {
                From: email,
                Subject: `Contact Form Message from ${name}`,
                Body: [
                    {
                        ContentType: 'PlainText',
                        Content: `Message from ${name} (${email}):\n\n${message}`
                    }
                ]
            }
        };

        // Send email using async/await
        const response = await emailApi.emailsPost(emailData);
        console.log('Email sent successfully:', response);
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
