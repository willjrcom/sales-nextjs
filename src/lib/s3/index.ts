import s3Client from './client';
import {
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
const BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;

export interface UploadParams {
    key: string;
    body: any;
    contentType?: string;
}

/**
 * Uploads data to S3 and returns its public URL.
 */
export async function uploadObject({ key, body, contentType }: UploadParams): Promise<string> {
    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL: 'public-read',
        }),
    );
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Builds the public URL of an S3 object.
 */
export function getObjectUrl(key: string): string {
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Retrieves the raw object data from S3.
 */
export async function getObject(key: string): Promise<any> {
    const response = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    );
    return response.Body;
}

/**
 * Lists all object keys under a given prefix (folder).
 */
export async function listObjects(prefix: string = ''): Promise<string[]> {
    const response = await s3Client.send(
        new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }),
    );
    return response.Contents?.map((item: any) => item.Key!) ?? [];
}

/**
 * Lists public URLs of objects under a given prefix (folder).
 */
export async function listObjectUrls(prefix: string = ''): Promise<string[]> {
    const keys = await listObjects(prefix);
    return keys.map(getObjectUrl);
}