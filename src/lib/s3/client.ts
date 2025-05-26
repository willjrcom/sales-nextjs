import { S3Client } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION!;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

export default s3Client;