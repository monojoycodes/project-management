import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationTemplate, sendEmail } from "../utils/mail.js";

// take the user reference:
const registerUser = asyncHandler( async (req, res) => {
    //1. grab details from API request 
    const {email, password, username} = req.body;

    //2. check in DB if user already exists
    const existingUser = await User.findOne(
       { $or: [{email}, {username}]}
    )
    if (existingUser) throw new ApiError(400, "User already exists!")

    //3. create the user:
    const user = await User.create({
        email,
        username,
        password,
        isEmailVerified: false
    })

    //4. Generate the tokens:
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

        user.emailVerificationToken = hashedToken
        user.emailVerificationExpiry = tokenExpiry

        //5. Save the user.
        await user.save({validateBeforeSave: false})

    //5. Email verification
    

    


})