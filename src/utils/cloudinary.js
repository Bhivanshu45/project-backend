import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
// fs user for do operations on file

    // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:  process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
}); 

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath){
            return null;
        }
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("file has uploaded on cloudinary",response.url)
        return response

    }catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as upload operation got failed
        return null 
    }
}

cloudinary.v2.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg"),
{public_id: "olympic_flag"},
function(arror,result){console.log(result);}

export {uploadOnCloudinary}