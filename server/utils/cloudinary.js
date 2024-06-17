const cloudinary  = require('cloudinary').v2;
const dotenv = require('dotenv').config();
const fs = require('fs');
          
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        if(response){
            console.log('response:', response)
            fs.unlinkSync(localFilePath)
            return response;
        }
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath)
    }
}

module.exports = uploadOnCloudinary;
