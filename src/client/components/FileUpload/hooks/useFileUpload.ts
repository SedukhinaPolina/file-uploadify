import { useCallback } from 'react';

import { type IUploadStrategy } from '../types/UploadFileStrategy.interface.ts';
import { type UploadFile, UploadStatus } from '../types/upload.types.ts';

interface UseFileUploadProps {
    uploadStrategy: IUploadStrategy;
    onProgress: (id: string, progress: number) => void;
    onComplete: (id: string) => void;
    onError: (id: string, error: string) => void;
}

interface UseFileUploadReturn {
    upload: (file: UploadFile) => Promise<void>;
}

export const useFileUpload = ({
    uploadStrategy,
    onProgress,
    onComplete,
    onError,
}: UseFileUploadProps): UseFileUploadReturn => {
    const upload = useCallback(
        async (file: UploadFile) => {
            try {
                const result = await uploadStrategy.upload(file.file, {
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
        [uploadStrategy, onProgress, onComplete, onError]
    );

    return {
        upload,
    };
};
