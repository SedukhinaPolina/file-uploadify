export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    COMPLETED = 'completed',
    ERROR = 'error',
}

export enum UploadStrategy {
    SINGLE = 'single',
    CHUNKED = 'chunked',
}

export interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: UploadStatus;
    error?: string;
    uploadStrategy: UploadStrategy;
}

export interface UploadFileOptions {
    strategy: UploadStrategy;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

export interface UploadFileResult {
    status: UploadStatus;
    url?: string;
    error?: string;
}
