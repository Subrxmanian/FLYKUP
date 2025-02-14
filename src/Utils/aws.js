import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { toByteArray } from 'base64-js';
import Config from '../../Config';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import { S3Client, CreateMultipartUploadCommand, 
  UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: Config.AWS_REGION,
  credentials: {
    accessKeyId: Config.AWS_ACCESSKEYID,
    secretAccessKey: Config.AWS_SECRETACCESSKEY,
  },
});

const uploadLargeFileToS3 = async (file, s3Path, contentType) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const filename = typeof file === 'string' 
      ? file.split('/').pop() 
      : `${uuidv4()}.${contentType.split('/')[1]}`;

    const key = `${s3Path}/${uuidv4()}_${filename}`;

    // Step 1: Initiate multipart upload
    const createMultipartUploadResponse = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: Config.AWS_BUCKET,
        Key: key,
        ContentType: contentType,
      })
    );

    const uploadId = createMultipartUploadResponse.UploadId;
    const partSize = 5 * 1024 * 1024; // 5 MB per part
    let parts = [];

    // Step 2: Upload parts
    let fileData;
    if (typeof file === 'string') {
      const { base64Data } = await getFileData(file);
      fileData = toByteArray(base64Data); // Convert base64 to binary
    } else {
      fileData = file;
    }

    for (let i = 0; i < fileData.length; i += partSize) {
      const part = fileData.slice(i, i + partSize);
      const uploadPartResponse = await s3Client.send(
        new UploadPartCommand({
          Bucket: Config.AWS_BUCKET,
          Key: key,
          PartNumber: parts.length + 1,
          UploadId: uploadId,
          Body: part,
        })
      );

      parts.push({
        PartNumber: parts.length + 1,
        ETag: uploadPartResponse.ETag,
      });
    }

    // Step 3: Complete multipart upload
    const completeMultipartUploadResponse = await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: Config.AWS_BUCKET,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      })
    );

    console.log('Multipart upload successful:', key);
    return key;
  } catch (error) {
    console.error('Multipart upload error:', error);
    throw new Error('Failed to upload large file to S3');
  }
};
/**
 * Creates canonical headers string
 * @param {Object} headers Headers object
 * @returns {string} Canonical headers string
 */
const createCanonicalHeaders = (headers) => {
  return Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
    .join('\n') + '\n';
};

/**
 * Creates signed headers string
 * @param {Object} headers Headers object
 * @returns {string} Signed headers string
 */
const createSignedHeaders = (headers) => {
  return Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
};

/**
 * Converts CryptoJS word array to hex string
 * @param {WordArray} wordArray CryptoJS word array
 * @returns {string} Hex string
 */
const toHex = (wordArray) => {
  return wordArray.toString(CryptoJS.enc.Hex);
};

/**
 * Creates hash of payload
 * @param {string} payload Request payload
 * @returns {string} Hashed payload
 */
const hash = (payload) => {
  return CryptoJS.SHA256(payload || '').toString(CryptoJS.enc.Hex);
};

/**
 * Generates AWS Signature v4
 * @param {Object} options Signature options
 * @returns {Object} Headers with signature
 */
const signRequest = (options) => {
  const { method, path, query = '', headers, payload = '' } = options;
  
  const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = datetime.slice(0, 8);
  
  // Add required headers
  const requiredHeaders = {
    ...headers,
    'host': `${Config.AWS_BUCKET}.s3.${Config.AWS_REGION}.amazonaws.com`,
    'x-amz-date': datetime,
    'x-amz-content-sha256': hash(payload)
  };

  // Create canonical request
  const canonicalRequest = [
    method,
    path,
    query,
    createCanonicalHeaders(requiredHeaders),
    createSignedHeaders(requiredHeaders),
    hash(payload)
  ].join('\n');

  // Create string to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    `${date}/${Config.AWS_REGION}/s3/aws4_request`,
    hash(canonicalRequest)
  ].join('\n');

  // Calculate signature
  let dateKey = CryptoJS.HmacSHA256(date, "AWS4" + Config.AWS_SECRETACCESSKEY);
  let dateRegionKey = CryptoJS.HmacSHA256(Config.AWS_REGION, dateKey);
  let dateRegionServiceKey = CryptoJS.HmacSHA256('s3', dateRegionKey);
  let signingKey = CryptoJS.HmacSHA256('aws4_request', dateRegionServiceKey);
  let signature = toHex(CryptoJS.HmacSHA256(stringToSign, signingKey));

  // Create authorization header
  const credential = `${Config.AWS_ACCESSKEYID}/${date}/${Config.AWS_REGION}/s3/aws4_request`;
  const signedHeaders = createSignedHeaders(requiredHeaders);
  
  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${credential}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(', ');

  return {
    ...requiredHeaders,
    'Authorization': authorization
  };
};

/**
 * Reads file content and gets file stats
 * @param {string} filePath File path
 * @returns {Promise<Object>} File data and stats
 */
const getFileData = async (filePath) => {
  try {
    const stats = await RNFS.stat(filePath);
    const base64Data = await RNFS.readFile(filePath, 'base64');
    return { stats, base64Data };
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error('Failed to read file');
  }
};


/**
 * Uploads an image to S3
 * @param {string} imagePath Local image path
 * @param {string} path S3 destination path
 * @returns {Promise<string>} S3 key
 */
export const uploadImageToS3 = async (imagePath, path) => {
  try {
    return await uploadLargeFileToS3(imagePath, path, 'image/jpeg');
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

/**
 * Uploads a video to S3
 * @param {string} videoPath Local video path
 * @param {string} path S3 destination path
 * @returns {Promise<string>} S3 key
 */
export const uploadVideoToS3 = async (videoPath, path) => {
  try {
    return await uploadLargeFileToS3(videoPath, path, 'video/mp4');
  } catch (error) {
    console.error('Video upload error:', error);
    throw new Error('Failed to upload video to S3');
  }
};

/**
 * Generates a pre-signed URL for S3 object
 * @param {string} key S3 object key
 * @param {number} expiresIn Expiration time in seconds
 * @returns {string} Signed URL
 */
export const generateSignedUrl = (key, expiresIn = 3600) => {
  const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = datetime.slice(0, 8);
  const encodedKey = encodeURIComponent(key);

  // Create canonical query string parameters
  const params = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${Config.AWS_ACCESSKEYID}/${date}/${Config.AWS_REGION}/s3/aws4_request`,
    'X-Amz-Date': datetime,
    'X-Amz-Expires': expiresIn.toString(),
    'X-Amz-SignedHeaders': 'host'
  };

  // Sort query parameters
  const canonicalQueryString = Object.keys(params)
    .sort()
    .map(paramKey => `${paramKey}=${encodeURIComponent(params[paramKey])}`)
    .join('&');

  // Create canonical request
  const canonicalRequest = [
    'GET',
    '/' + key,
    canonicalQueryString,
    'host:' + `${Config.AWS_BUCKET}.s3.${Config.AWS_REGION}.amazonaws.com\n`,
    'host',
    'UNSIGNED-PAYLOAD'
  ].join('\n');

  // Create string to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    `${date}/${Config.AWS_REGION}/s3/aws4_request`,
    CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex)
  ].join('\n');

  // Calculate signature
  let dateKey = CryptoJS.HmacSHA256(date, "AWS4" + Config.AWS_SECRETACCESSKEY);
  let dateRegionKey = CryptoJS.HmacSHA256(Config.AWS_REGION, dateKey);
  let dateRegionServiceKey = CryptoJS.HmacSHA256('s3', dateRegionKey);
  let signingKey = CryptoJS.HmacSHA256('aws4_request', dateRegionServiceKey);
  let signature = CryptoJS.HmacSHA256(stringToSign, signingKey).toString(CryptoJS.enc.Hex);

  // Construct the signed URL
  return `https://${Config.AWS_BUCKET}.s3.${Config.AWS_REGION}.amazonaws.com/${encodedKey}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
};

