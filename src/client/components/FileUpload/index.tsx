import { useState, useCallback } from 'react';

import { CHUNK_UPLOAD_CONFIG, DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE } from '../../constants.ts';

import { FileList } from './FileList';
import { FileSelector } from './FileSelector';
import { useFileUpload } from './hooks/useFileUpload';
import { type IUploadStrategy } from './types/UploadFileStrategy.interface.ts';
import { type UploadFile, UploadStatus, UploadMethod } from './types/upload.types';

interface FileUploadProps {
    uploadStrategy: IUploadStrategy;
    maxFiles?: number;
    maxSize?: number;
}

export const FileUpload = ({
    uploadStrategy,
    maxFiles = DEFAULT_MAX_FILES,
    maxSize = DEFAULT_MAX_SIZE,
}: FileUploadProps) => {
    const [files, setFiles] = useState<UploadFile[]>([]);

    const handleProgress = useCallback((id: string, progress: number) => {
        setFiles((prev) =>
            prev.map((file) => (file.id === id ? { ...file, progress, status: UploadStatus.UPLOADING } : file))
        );
    }, []);

    const handleComplete = useCallback((id: string) => {
        setFiles((prev) =>
            prev.map((file) => (file.id === id ? { ...file, status: UploadStatus.COMPLETED, progress: 100 } : file))
        );
    }, []);

    const handleError = useCallback((id: string, error: string) => {
        setFiles((prev) =>
            prev.map((file) => (file.id === id ? { ...file, status: UploadStatus.ERROR, error } : file))
        );
    }, []);

    const { upload } = useFileUpload({
        uploadStrategy,
        onProgress: handleProgress,
        onComplete: handleComplete,
        onError: handleError,
    });

    const uploadFiles = useCallback(
        (newFiles: File[]) => {
            if (files.length + newFiles.length > maxFiles) {
                // todo: handle
                console.error('Exceeded maximum number of files');
                return;
            }

            const oversizedFiles = newFiles.filter((file) => file.size > maxSize);
            if (oversizedFiles.length > 0) {
                // todo: handle
                console.error('Exceeded file size limit');
                return;
            }

            const filesToAdd: UploadFile[] = newFiles.map((file) => ({
                id: crypto.randomUUID(),
                file,
                progress: 0,
                status: UploadStatus.PENDING,
                uploadMethod:
                    file.size >= CHUNK_UPLOAD_CONFIG.CHUNKED_UPLOAD_THRESHOLD
                        ? UploadMethod.CHUNKED
                        : UploadMethod.SINGLE,
            }));

            setFiles((prev) => [...prev, ...filesToAdd]);
            Promise.all(filesToAdd.map((file) => upload(file))).catch(console.error);
        },
        [files.length, maxFiles, maxSize, upload]
    );

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    return (
        <div className="space-y-6">
            <FileSelector onFilesSelected={uploadFiles} maxFiles={maxFiles - files.length} />
            {files.length > 0 && <FileList files={files} onRemove={removeFile} />}
        </div>
    );
};
