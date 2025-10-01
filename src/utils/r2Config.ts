/**
 * Cloudflare R2 Configuration
 */

export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

export const r2Config: R2Config = {
  endpoint: process.env.REACT_APP_R2_ENDPOINT || 'https://pub-13ef0829669840098595156063e9a01e.r2.dev',
  accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY || 'ecf4cf29962b6d3cf31db48a24fe1339',
  secretAccessKey: process.env.REACT_APP_R2_SECRET_KEY || 'b69b1b10cedc8a55dcdb08ca11af68415c6dd51ebc8835526675ec01b5bf2576',
  bucketName: process.env.REACT_APP_R2_BUCKET_NAME || 'collab-files',
  region: process.env.REACT_APP_R2_REGION || 'auto',
};

export const getR2Config = (): R2Config => {
  return r2Config;
};