import apiClient from '@/api/client';

const DEFAULT_S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME || 'example-bucket';

// Request a pre-signed URL intended for uploads (if your backend exposes it)
// POST /core/s3/pre-sign/create/
export const requestS3PreSignedUpload = async (payload: {
  file_name: string;
  content_type: string;
  folder?: string;
  acl?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.post(`/core/s3/pre-sign/create/`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to request S3 pre-signed upload URL:', error);
    throw error;
  }
};

// Matches cURL: POST /core/s3/pre-sign/ with { object_name, bucket_name }
export const requestS3PreSign = async (objectName: string, bucketName?: string): Promise<any> => {
  try {
    const payload: any = {
      object_name: objectName,
      bucket_name: bucketName || DEFAULT_S3_BUCKET
    };
    const response = await apiClient.post(`/core/s3/pre-sign/`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to request S3 pre-sign URL:', error);
    throw error;
  }
};
