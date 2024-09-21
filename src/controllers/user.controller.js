import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res) => {
    // Get user details from frontend
    // validation - ,not empty,correct format
    // check if user already exists:  username, email
    // check for images, avatar : like size, 
    // upload them to cloudinary
    // create user Object(having all the details uploaded) - create entry in DB for user
    // remove password and refresh token field from response(at time of Showing data to user)
    // check for user creation
    // return response if created successfully or not

    const {fullName, email,username,password} = req.body
    console.log("email: ",email);

    // validation
    if( [fullName,email,username,password].some((field) => field?.trim() === "") ){
        throw new ApiError(400,"All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existingUser){
        throw new ApiError(409, "User with email or username already exist")
    }

    // check for images,files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is Required")
    }

    // upload Image files to cloudinary or AWS to store
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){ // again check the files
        throw new ApiError(400, "Avatar file is required");
    }

    // create user Object(having all the details uploaded) - create entry in DB for user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response(at time of Showing data to user)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering User")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
    )
})

export {registerUser}