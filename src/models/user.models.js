import mongoose,  { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

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
        type: Sntrig,
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
        default: False
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
userSchema.pre("save", async function(next){ //we are writing "function" to be able to use `next`*
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10); //hashing rounds
    next();
})

userSchema.methods.isPasswordCorrect(async function(password) {
    return await bcrypt.compare(password, this.password); //True or False
}); //check if the password entered by the user is correct!

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
userSchema.models.generateRefreshToken = function() {
   return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}


export const user = mongoose.model("Users", userSchema);