import 'react-native-get-random-values';  // This must be the first import
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import 'react-native-url-polyfill/auto';
import { URL } from 'react-native-url-polyfill';
import { v4 as uuidv4 } from 'uuid';
import Config from '../../Config';
import { Buffer } from 'react-native-buffer';
global.Buffer = Buffer;
// Initialize S3 client
const s3Client = new S3Client({
  region: Config.AWS_REGION,
  credentials: {
    accessKeyId: Config.AWS_ACCESSKEYID,
    secretAccessKey: Config.AWS_SECRETACCESSKEY,
  },
});

/**
 * Generates a signed URL for accessing S3 objects
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string>} Signed URL
 */
export const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: Config.AWS_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Signed URL Error:', error);
    throw error;
  }
};

/**
 * Uploads an image to S3
 * @param {File|Blob} image - The image file to upload
 * @param {string} path - The S3 path/prefix for the upload
 * @returns {Promise<string>} The S3 key of the uploaded image
 */
export const uploadImageToS3 = async (image, path) => {
  try {
    // Validate that the image is a Blob or File
    if (!(image instanceof Blob || image instanceof File)) {
      throw new Error("Invalid image format. Expected a File or Blob.");
    }

    // Generate a unique key for the file
    const key = `${path}/${uuidv4()}_${image.name}`;

    // Create a command for S3 upload using the Blob/File directly
    const command = new PutObjectCommand({
      Bucket: Config.AWS_BUCKET,
      Key: key,
      Body: image,
      ContentType: image.type,
      ACL: "private",
    });

    // Send the command using the S3 client
    await s3Client.send(command);

    console.log("Image uploaded successfully:", key);
    return key;
  } catch (error) {
    console.error("Error uploading to S3:", error.message || error);
    throw new Error("Failed to upload image to S3. Please try again.");
  }
};

/**
 * Uploads a video to S3
 * @param {File|Blob} video - The video file to upload
 * @param {string} path - The S3 path/prefix for the upload
 * @returns {Promise<string>} The S3 key of the uploaded video
 */
export const uploadVideoToS3 = async (video, path) => {
  try {
    // Validate that the video is a File or Blob
    if (!(video instanceof Blob || video instanceof File)) {
      throw new Error("Invalid video format. Expected a File or Blob.");
    }

    // Generate a unique key for the file
    const key = `${path}/${uuidv4()}_${video.name}`;

    // Create a PutObjectCommand using the Blob/File directly
    const command = new PutObjectCommand({
      Bucket: Config.AWS_BUCKET,
      Key: key,
      Body: video,
      ContentType: video.type || "video/mp4",
      ACL: "private",
    });

    // Send the upload request
    await s3Client.send(command);

    console.log("Video uploaded successfully:", key);
    return key;
  } catch (error) {
    console.error("Error uploading to S3:", error.message || error);
    throw new Error("Error uploading video to S3. Please try again.");
  }
};