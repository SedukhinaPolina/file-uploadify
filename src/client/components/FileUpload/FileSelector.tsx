import { useRef, useId, type ChangeEvent } from 'react';

interface FileSelectorProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles: number;
}

export const FileSelector = ({ onFilesSelected, maxFiles }: FileSelectorProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onFilesSelected(files);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    return (
        <div className="w-full">
            <label
                htmlFor={inputId}
                className="flex justify-center px-6 py-5 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            >
                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleSelect}
                    disabled={maxFiles === 0}
                    aria-label="Choose files to upload"
                />
                <div className="space-y-2 text-center">
                    <p className="text-cyan-700 hover:text-cyan-600">Click to select files</p>
                    <p className="text-xs text-gray-500">
                        {maxFiles > 0 ? `Up to ${maxFiles} more files` : 'Maximum files reached'}
                    </p>
                </div>
            </label>
        </div>
    );
};
