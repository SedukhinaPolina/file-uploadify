import { useState, useCallback } from 'react';

import { CHUNK_UPLOAD_CONFIG, DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE } from '../../constants.ts';

import { FileList } from './FileList';
import { FileSelector } from './FileSelector';
import { useFileUpload } from './hooks/useFileUpload';
import { type IUploadStrategy } from './types/UploadFileStrategy.interface.ts';
import { type UploadFile, UploadStatus, UploadMethod } from './types/upload.types';

export type { UploadFile } from './types/upload.types';
export { UploadStatus, UploadMethod } from './types/upload.types';
export { FileList } from './FileList';
export { FileSelector } from './FileSelector';

interface FileUploadProps {
    uploadStrategy: IUploadStrategy;
    maxFiles?: number;
    maxSize?: number;
    showFileList?: boolean;
    onFilesChange?: (files: UploadFile[]) => void;
}

export const FileUpload = ({
    uploadStrategy,
    maxFiles = DEFAULT_MAX_FILES,
    maxSize = DEFAULT_MAX_SIZE,
    showFileList = true,
    onFilesChange,
}: FileUploadProps) => {
    const [files, setFiles] = useState<UploadFile[]>([]);

    const updateFiles = useCallback(
        (updater: (prev: UploadFile[]) => UploadFile[]) => {
            setFiles((prev) => {
                const updated = updater(prev);
                onFilesChange?.(updated);
                return updated;
            });
        },
        [onFilesChange]
    );

    const handleProgress = useCallback(
        (id: string, progress: number) => {
            updateFiles((prev) =>
                prev.map((file) => (file.id === id ? { ...file, progress, status: UploadStatus.UPLOADING } : file))
            );
        },
        [updateFiles]
    );

    const handleComplete = useCallback(
        (id: string) => {
            updateFiles((prev) =>
                prev.map((file) => (file.id === id ? { ...file, status: UploadStatus.COMPLETED, progress: 100 } : file))
            );
        },
        [updateFiles]
    );

    const handleError = useCallback(
        (id: string, error: string) => {
            updateFiles((prev) =>
                prev.map((file) => (file.id === id ? { ...file, status: UploadStatus.ERROR, error } : file))
            );
        },
        [updateFiles]
    );

    const removeFile = useCallback(
        (id: string) => {
            updateFiles((prev) => prev.filter((f) => f.id !== id));
        },
        [updateFiles]
    );

    const { upload } = useFileUpload({
        uploadStrategy,
        onProgress: handleProgress,
        onComplete: handleComplete,
        onError: handleError,
    });

    const uploadFiles = useCallback(
        (newFiles: File[]) => {
            if (files.length + newFiles.length > maxFiles) {
                alert('Exceeded maximum number of files');
                return;
            }

            const oversizedFiles = newFiles.filter((file) => file.size > maxSize);
            if (oversizedFiles.length > 0) {
                alert('Exceeded file size limit');
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

            updateFiles((prev) => [...prev, ...filesToAdd]);
            Promise.all(filesToAdd.map((file) => upload(file))).catch(console.error);
        },
        [files.length, maxFiles, maxSize, upload, updateFiles]
    );

    return (
        <div className="space-y-6">
            <FileSelector onFilesSelected={uploadFiles} maxFiles={maxFiles - files.length} />
            {showFileList && files.length > 0 && <FileList files={files} onRemove={removeFile} />}
        </div>
    );
};
