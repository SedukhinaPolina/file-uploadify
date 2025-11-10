export enum UploadStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    COMPLETED = 'completed',
    ERROR = 'error',
}

export enum UploadMethod {
    SINGLE = 'single',
    CHUNKED = 'chunked',
}

export interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: UploadStatus;
    error?: string;
    uploadMethod: UploadMethod;
}

export interface UploadFileOptions {
    method: UploadMethod;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

export interface UploadFileResult {
    status: UploadStatus;
    url?: string;
    error?: string;
}
