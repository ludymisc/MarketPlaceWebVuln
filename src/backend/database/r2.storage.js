import {
	S3Client,
	ListObjectsV2Command
} from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config({ path: "../../../.env" });

const ACCOUNT_ID = process.env.JURISDICTION

export const s3 = new S3Client({
    region: "auto",
    endpoint: ACCOUNT_ID,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
});

const list = await s3.send(
	new ListObjectsV2Command({
		Bucket: "market-place-vuln",
        Prefix: "user-avatar/",
	}),
);

const files = (list.Contents || [])
  .map((obj) => obj.Key)
  .filter((key) => key !== "avatar/");

console.log("Avatar Files:", files);