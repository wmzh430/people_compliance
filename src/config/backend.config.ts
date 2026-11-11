interface BackendConfig {
  baseUrl: string;
  pdfBaseUrl: string;
}

const backendConfig: BackendConfig = {  baseUrl: '/api',
  pdfBaseUrl: 'https://example-bucket.s3.us-west-2.amazonaws.com/'
};

export { backendConfig };
