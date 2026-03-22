import { User } from "../models/user.models.js"; 
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationTemplate, sendEmail } from "../utils/mail.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch(error) {
        throw new ApiError(
            500, 
            "something went wrong while generating access token")
    }

}

const registerUser = asyncHandler(
    async (req, res) => {
        const {email, username, password, role } = req.body // from the frontend through api

        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })

        if (existedUser) {// statuscode, message, []
            throw new ApiError(409, "User with email or username already exists", [])
        }


        const user = await User.create({
            email,
            password,
            username,
            isEmailVerified: false
        })
        //now generate access token!
        const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

        user.emailVerificationToken = hashedToken
        user.emailVerificationExpiry = tokenExpiry

        await user.save({validateBeforeSave: false})

        console.log("🔹 About to send verification email to:", user.email);
        try {
            await sendEmail(
                user.email,
                "Please verify your email",
                emailVerificationTemplate(
                    user.username,
                    `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}/`
                )
            )
        } catch (emailError) {
            console.error("📧 Email sending failed (but registration succeeded):", emailError.message);
            // Continue registration even if email fails
        }

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        ) //leave these fields

        if(!createdUser) {
            throw new ApiError(500, "something went wrong while creating the user.")
        }

        return res.status(201).json(
            new ApiResponse(201, {user: createdUser},
                "user registered successfully and verification email sent to registered email."
            )
        )

    }
)

const loginUser = asyncHandler(async (req, res) => {
    // accept data from user.
    const {email, username, password} = req.body

    if (!email) {
        throw new ApiError(400, "An email is required!")
    }
    //check if user exists:
    const user = await User.findOne({email})
    if (!email) {
        throw new ApiError(400, "User with email does not exist!")
    }

    //verify credentials
    const isPasswordValid = user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is incorrect!")
    }

    //generate the tokens
    const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

    //grab the User
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
      );
    
    //send cookies
    const options = {
        httpOnly: true,
        secure: true //can only be accessed by browser
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser,
              accessToken,
              refreshToken,
            },
            "User logged-in successfully",
          ),
        );




} )

export { registerUser, loginUser }



/*
How to login a User?-
1. Take data from user.
2. Check if the user exists.
3. verify credentials (verify password).
4. Generate Access and Refresh Tokens.
5. send tokens in COOKIES.

*/