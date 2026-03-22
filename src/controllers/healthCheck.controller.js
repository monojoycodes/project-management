import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js";

//also possible to use the higher order function as a better, optimized approach.
// const healthCheck = (req, res, next) => { //what is next?
//     try {
//         res.status(200).json(
//             new APiResponse(200, {
//                 message: "Server is running"
//             })
//         )
//     } catch (error) {
//        next(error);
//     }
// }

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse (200, {
        message: "Server is running!"
    }))
})
export {healthCheck};