import mongoose,  { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const schema = Schema();

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: `https://placehold.co/200?text=User&font=raleway`,
                localPath: ""
            }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        default: "Superhero",
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    //set up tokens
    refreshToken: {
        type: String
    },
    forgotPassword: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: String
    }
})

//set up a pre-hook to HASH your passwords:
userSchema.pre("save", async function() { //removed next parameter for async functions
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10); //hashing rounds
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password); //True or False
}; //check if the password entered by the user is correct!

//let us now generate the jwt access tokens!
userSchema.methods.generateAccessToken = function() {
   return jwt.sign( //sign({payload}, secret, {expiry})
        {
            _id: this.id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//now generate the refresh token using JWT!
userSchema.methods.generateRefreshToken = function() {
   return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateTemporaryToken = function() {
    const unHashedToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000) //20 mins
    return {unHashedToken, hashedToken, tokenExpiry}
}


export const User = mongoose.model("Users", userSchema);