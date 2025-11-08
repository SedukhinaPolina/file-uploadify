export const API_URLS = {
    UPLOAD_SINGLE: '/api/upload-single',
    UPLOAD_CHUNKED: '/api/upload-chunk',
    LIST_FILES: '/api/files',
};

export const UPLOAD_CONFIG = {
    CHUNK_SIZE: 1024 * 1024,
    CONCURRENT_UPLOADS: 3,
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    CHUNKED_UPLOAD_THRESHOLD: 5 * 1024 * 1024,
};
