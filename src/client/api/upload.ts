import axios from 'axios';

import { API_URLS, CHUNK_UPLOAD_CONFIG } from '../constants.ts';
import { UploadStrategy, UploadStatus, type UploadFileOptions, type UploadFileResult } from '../types/upload.types';

export const uploadFile = async (file: File, options: UploadFileOptions): Promise<UploadFileResult> => {
    try {
        const uploader = {
            [UploadStrategy.SINGLE]: uploadSingle,
            [UploadStrategy.CHUNKED]: uploadChunked,
        };
        return await uploader[options.strategy](file, options);
    } catch (error) {
        if (axios.isCancel(error)) {
            return {
                status: UploadStatus.ERROR,
                error: 'Upload cancelled',
            };
        }
        return {
            status: UploadStatus.ERROR,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
};

export const uploadSingle = async (file: File, options: UploadFileOptions): Promise<UploadFileResult> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
        await axios.post<{ message: string }>(API_URLS.UPLOAD_SINGLE, formData, {
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    options.onProgress?.(progress);
                }
            },
            signal: options.signal,
        });

        return {
            status: UploadStatus.COMPLETED,
            url: `/uploads/${file.name}`,
        };
    } catch (error) {
        if (axios.isCancel(error)) {
            throw error;
        }
        return {
            status: UploadStatus.ERROR,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
};

export const uploadChunked = async (file: File, options: UploadFileOptions): Promise<UploadFileResult> => {
    const chunks = createChunks(file);
    const totalChunks = chunks.length;
    let uploadedChunks = 0;

    try {
        for (let i = 0; i < chunks.length; i += CHUNK_UPLOAD_CONFIG.CONCURRENT_UPLOADS) {
            const batch = chunks.slice(i, Math.min(i + CHUNK_UPLOAD_CONFIG.CONCURRENT_UPLOADS, chunks.length));

            await Promise.all(
                batch.map(async (chunk, batchIndex) => {
                    const currentChunkIndex = i + batchIndex;
                    const formData = new FormData();

                    formData.append('file', chunk, file.name);
                    formData.append('currentChunkIndex', currentChunkIndex.toString());
                    formData.append('totalChunks', totalChunks.toString());

                    await axios.post<{ message: string }>(API_URLS.UPLOAD_CHUNKED, formData, {
                        signal: options.signal,
                    });

                    uploadedChunks++;
                    const progress = Math.round((uploadedChunks / totalChunks) * 100);
                    options.onProgress?.(progress);
                })
            );
        }

        return {
            status: UploadStatus.COMPLETED,
            url: `/uploads/${file.name}`,
        };
    } catch (error) {
        if (axios.isCancel(error)) {
            throw error;
        }
        return {
            status: UploadStatus.ERROR,
            error: error instanceof Error ? error.message : 'Chunk upload failed',
        };
    }
};

const createChunks = (file: File): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
        const end = Math.min(start + CHUNK_UPLOAD_CONFIG.CHUNK_SIZE, file.size);
        chunks.push(file.slice(start, end));
        start = end;
    }

    return chunks;
};
