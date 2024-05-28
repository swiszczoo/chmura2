import { PutBucketPolicyCommand, S3Client } from "@aws-sdk/client-s3";

console.log(`Key id: ${process.env.AWS_ACCESS_KEY_ID}`);

const s3 = new S3Client({
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN || '',
    },
});

const policyCommand = new PutBucketPolicyCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${process.env.S3_BUCKET_NAME}/*`],
        },
      ],
    }),
});

s3.send(policyCommand).then(() => console.log('Bucket policy is set'));

export default s3;
