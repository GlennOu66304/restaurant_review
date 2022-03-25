
//1.import the aixo package
import axios from "axios";

// 2.export the axios instance, axios.create() is a funtion
export default axios.create({// include a object
    baseURL: "http://localhost:5000/api/v1/",
    headers: {
        "Content-type": "application/json"
    }
});