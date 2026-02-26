const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

let storage;

if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });

    storage = multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    });
    console.log("☁️  Configured S3 for file storage");
} else {
    storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
    });
    console.log("📁 Configured local disk for file storage (S3 vars missing)");
}

const upload = multer({ storage });
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'agentCode', maxCount: 1 }]);

module.exports = { upload, cpUpload };
