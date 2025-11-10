import { type UploadFile, UploadStatus } from '../../types/upload.types.ts';

interface FileListProps {
    files: UploadFile[];
    onRemove: (id: string) => void;
}

const STATUS_COLORS: Record<UploadStatus, string> = {
    [UploadStatus.COMPLETED]: 'text-green-600',
    [UploadStatus.ERROR]: 'text-red-600',
    [UploadStatus.UPLOADING]: 'text-blue-600',
    [UploadStatus.PENDING]: 'text-gray-600',
};

export const FileList = ({ files, onRemove }: FileListProps) => {
    return (
        <div className="space-y-2">
            {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm">{file.file.name}</p>
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className={`${STATUS_COLORS[file.status]} capitalize`}>{file.status}</span>
                                <span className="text-gray-500">{file.progress}%</span>
                            </div>
                            {file.error && <p className="mt-1 text-xs text-red-600">{file.error}</p>}

                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onRemove(file.id)}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Remove file"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};
