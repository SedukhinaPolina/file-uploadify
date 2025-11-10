import { useCallback } from 'react';

import { uploadFile } from '../api/upload.ts';
import { type UploadFile, UploadStatus } from '../types/upload.types';

interface UseFileUploadProps {
    onProgress: (id: string, progress: number) => void;
    onComplete: (id: string) => void;
    onError: (id: string, error: string) => void;
}

interface UseFileUploadReturn {
    upload: (file: UploadFile) => Promise<void>;
}

export const useFileUpload = ({ onProgress, onComplete, onError }: UseFileUploadProps): UseFileUploadReturn => {
    const upload = useCallback(
        async (file: UploadFile) => {
            try {
                const result = await uploadFile(file.file, {
                    method: file.uploadMethod,
                    onProgress: (progress) => {
                        onProgress(file.id, progress);
                    },
                });

                if (result.status === UploadStatus.COMPLETED) {
                    onComplete(file.id);
                } else if (result.status === UploadStatus.ERROR) {
                    onError(file.id, result.error || 'Upload failed');
                }
            } catch (error) {
                if (error instanceof Error) {
                    onError(file.id, error.message);
                } else {
                    onError(file.id, 'An unexpected error occurred');
                }
            }
        },
        [onProgress, onComplete, onError]
    );

    return {
        upload,
    };
};
