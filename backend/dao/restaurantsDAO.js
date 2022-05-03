// mongodb package use
import mongodb from "mongodb"
// mongodb Object
const ObjectId = mongodb.ObjectID

let restaurants

export default class RestaurantsDAO {
    // insert the data(POST)
    static async injectDB(conn) {
        if (restaurants) {
            return
        }
        try {
            //conn is the paramater
            restaurants = await conn.db(process.env.RESTREVIEWS_NS).collection("restaurants")//database then collection
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in restaurantsDAO: ${e}`,
            )
        }
    }
    // get the all data(GET)
    static async getRestaurants(
        // preconditions made

        {
            filters = null,
            page = 0,
            restaurantsPerPage = 20,
        } = {}

    ) {
        let query // query search

        if (filters) {
            if ("name" in filters) {
                query = { $text: { $search: filters["name"] } }//name search
            } else if ("cuisine" in filters) {
                query = { "cuisine": { $eq: filters["cuisine"] } }//cusine search
            } else if ("zipcode" in filters) {
                query = { "address.zipcode": { $eq: filters["zipcode"] } }//zip code search
            }
        }

        let cursor //cursor search

        try {
            cursor = await restaurants
                .find(query)
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { restaurantsList: [], totalNumRestaurants: 0 }
        }

        const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page)
// display the restaurantList and totalNumRestaurants
        try {
            const restaurantsList = await displayCursor.toArray()
            const totalNumRestaurants = await restaurants.countDocuments(query)

            return { restaurantsList, totalNumRestaurants }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { restaurantsList: [], totalNumRestaurants: 0 }
        }
    }
    // get the Data By Id(GET)
    static async getRestaurantByID(id) {
        try {
            const pipeline = [
                // id check
                {
                    $match: {
                        _id: new ObjectId(id),
                    },
                },
                // start lookup
                {
                    $lookup: {
                        from: "reviews",
                        let: {
                            id: "$_id",
                        },
                        // review look
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$restaurant_id", "$$id"],
                                    },
                                },
                            },
                            {
                                $sort: {
                                    date: -1,
                                },
                            },
                        ],
                        as: "reviews",
                    },
                },
                {
                    $addFields: {
                        reviews: "$reviews",
                    },
                },
            ]
            // revviews get 
            return await restaurants.aggregate(pipeline).next() 
        } catch (e) {
            console.error(`Something went wrong in getRestaurantByID: ${e}`)
            throw e
        }
    }
    // GET Cusine
    static async getCuisines() {
        let cuisines = []
        try {
            cuisines = await restaurants.distinct("cuisine")
            return cuisines
        } catch (e) {
            console.error(`Unable to get cuisines, ${e}`)
            return cuisines
        }
    }
}
