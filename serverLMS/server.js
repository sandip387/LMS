import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import bodyParser from 'body-parser';


const app = express();

await connectDB();

//Middlewares
app.use(cors());



// We add express.json() only AFTER the /clerk route
app.post(
    '/clerk',
    bodyParser.raw({ type: 'application/json' }),  // <-- This gives raw body
    clerkWebhooks
);

// General middleware
app.use(express.json());

//Routes
app.get('/', (req, res) => {
    res.send("API Working");
})

//Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})