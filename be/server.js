const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const router = require('./src/route/index');
app.use('/api', router);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
