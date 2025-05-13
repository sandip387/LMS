import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';


const app = express();

await connectDB();

//Middlewares
app.use(cors());
// General middleware
app.use(express.json());



//Routes
app.get('/', (req, res) => {
    res.send("API Working");
})

// We add express.json() only AFTER the /clerk route
app.post(
    '/clerk',
    express.json(),  // <-- This gives raw body
    clerkWebhooks
);

//Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})