import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    endpoint: process.env.HETZNER_ENDPOINT!,
    region: process.env.HETZNER_REGION!,
    credentials: {
        accessKeyId: process.env.HETZNER_ACCESS_KEY!,
        secretAccessKey: process.env.HETZNER_SECRET_KEY!,
    }
});

export { s3 };
