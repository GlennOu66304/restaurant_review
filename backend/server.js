import express from 'express'
import cors from 'cors'
// import the routes file
import restaurants from './api/restaurants.route.js'


const app = express()

app.use(express.json());
app.use(cors());

app.use('/api/v1/restaurants', restaurants) //total routes
app.use("*", (req, res) => res.status(404).json({ error: "not found" }))

export default app