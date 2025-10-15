require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json()); // parse application/json
app.use('/uploads', express.static('uploads')); // serve files in dev

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/loans', require('./routes/loan'));
app.use('/api/admin', require('./routes/admin'));

const PORT = 5004;
app.listen(PORT, ()=> console.log(`Server listening on http://localhost:${PORT}`));
