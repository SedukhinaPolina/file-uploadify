export const API_URLS = {
    UPLOAD_SINGLE: '/api/upload-single',
    UPLOAD_CHUNKED: '/api/upload-chunk',
    LIST_FILES: '/api/files',
};

export const CHUNK_UPLOAD_CONFIG = {
    CHUNK_SIZE: 1024 * 1024,
    CONCURRENT_UPLOADS: 3,
    CHUNKED_UPLOAD_THRESHOLD: 5 * 1024 * 1024,
};

export const DEFAULT_MAX_FILES = 5;
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export const DEFAULT_UPLOAD_STRATEGY = 'api';
