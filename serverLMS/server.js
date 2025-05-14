import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';


const app = express();

await connectDB();
await connectCloudinary();

//Middlewares
app.use(cors());
app.use(clerkMiddleware())
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

app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter);

//Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})