import app from './server.js'
import dotenv from 'dotenv'
import mongodb from 'mongodb'
import RestaurantsDAO from './dao/restaurantsDAO.js'
import ReviewsDAO from "./dao/reviewDAO.js"

dotenv.config()

const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 8000

// connect the mongodb database

MongoClient.connect(process.env.MONGO_URL, {
    poolSize: 50,
    wtimeout: 2500,
    useNewUrlParser: true
})
    .catch(err => {
        console.error(err.stack);
        process.exit(1)
    })
    .then(async client => {
        await RestaurantsDAO.injectDB(client)
        await ReviewsDAO.injectDB(client)
        app.listen(port, () => {
            console.log(`listening on port ${port}`)
        })
    })
