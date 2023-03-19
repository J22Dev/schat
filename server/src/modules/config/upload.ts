import multer from "multer";
import multers3 from "multer-s3";
import {
  DeleteObjectCommand,
  ListObjectsCommand,
  S3,
} from "@aws-sdk/client-s3";
import {
  BUCKET_ACCESS_KEY,
  BUCKET_ENDPOINT,
  BUCKET_NAME,
  BUCKET_REGION,
  BUCKET_SECRET_KEY,
} from "./config";
import crypto from "crypto";

export type FileData = {
  destination: string;
  filename: string;
  path: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  bucket: string;
  key: string;
  acl: S3ObjectACL;
  contentType: string;
  metadata: Record<string, string>;
  location: string;
  etag: string;
  buffer: Buffer;
  stream: any;
  contentDisposition: null | string;
  contentEncoding: null | string;
  storageClass: string;
  serverSideEncryption: null | string;
};
export enum S3ObjectACL {
  PRIVATE = "private",
  PUBLIC_READ = "public-read",
  PUBLIC_READ_WRITE = "public-read-write",
  AUTHENTICATED_READ = "authenticated-read",
}

export const S3_CONFIG: S3ConfigOptions = {
  endpoint: BUCKET_ENDPOINT,
  region: BUCKET_REGION,
  accessKeyId: BUCKET_ACCESS_KEY,
  secretAccessKey: BUCKET_SECRET_KEY,
};
type S3ConfigOptions = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};
export const configureS3 = ({
  endpoint,
  region,
  accessKeyId,
  secretAccessKey,
}: S3ConfigOptions) => {
  return new S3({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const configureStorage = ({
  bucket,
  acl,
  metadata = {},
  key,
}: Omit<UploadOptions, "acceptedTypes">) => {
  return multers3({
    bucket,
    s3: configureS3(S3_CONFIG),
    acl: (req, file, cb) => {
      cb(null, acl);
    },
    metadata: (req, file, cb) => {
      cb(null, metadata);
    },
    key: (req, file, cb) => {
      if (key) {
        cb(null, key);
      } else {
        cb(null, crypto.randomUUID());
      }
    },
  });
};

type UploadOptions = {
  bucket: string;
  acl: string;
  metadata?: Record<string, string>;
  key?: string;
  acceptedTypes: string[];
};

export const configureUpload = ({ acceptedTypes, ...rest }: UploadOptions) => {
  return multer({
    storage: configureStorage(rest),
    fileFilter: (req, file, cb) => {
      if (!acceptedTypes.includes(file.mimetype))
        return cb("File Not Accepted" as any, false);
      cb(null, true);
    },
  });
};

export const cleanUploads = async () => {
  const s3Client = configureS3(S3_CONFIG);
  const objects = await s3Client.send(
    new ListObjectsCommand({ Bucket: BUCKET_NAME })
  );
  objects.Contents?.forEach(async (item) => {
    console.log(`Deleting: ${item.Key}`);
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: item.Key })
    );
  });
};

const defaultUpload = configureUpload({
  acceptedTypes: ["image/png"],
  bucket: BUCKET_NAME,
  acl: S3ObjectACL.PUBLIC_READ,
});

export default defaultUpload;
