import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type IUploadStrategy } from '../../types/UploadFileStrategy.interface';
import { type UploadFile, UploadMethod, UploadStatus } from '../../types/upload.types';
import { useFileUpload } from '../useFileUpload';

describe('useFileUpload Hook', () => {
    let mockStrategy: IUploadStrategy;
    let onProgress: ReturnType<typeof vi.fn>;
    let onComplete: ReturnType<typeof vi.fn>;
    let onError: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onProgress = vi.fn();
        onComplete = vi.fn();
        onError = vi.fn();

        mockStrategy = {
            upload: vi.fn(),
        };
    });

    const createMockFile = (name: string = 'test.txt'): UploadFile => ({
        id: 'test-id',
        file: new File(['test'], name, { type: 'text/plain' }),
        progress: 0,
        status: UploadStatus.PENDING,
        uploadMethod: UploadMethod.SINGLE,
    });

    it('should call upload strategy', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy.upload = mockUpload;

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(mockUpload).toHaveBeenCalledWith(
            uploadFile.file,
            expect.objectContaining({
                method: UploadMethod.SINGLE,
                onProgress: expect.any(Function) as (progress: number) => void,
            })
        );
    });

    it('should call onComplete', async () => {
        mockStrategy.upload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(onComplete).toHaveBeenCalledWith('test-id');
        expect(onError).not.toHaveBeenCalled();
    });

    it('should call onError when upload fails', async () => {
        mockStrategy.upload = vi.fn().mockResolvedValue({
            status: UploadStatus.ERROR,
            error: 'Upload failed',
        });

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(onError).toHaveBeenCalledWith('test-id', 'Upload failed');
        expect(onComplete).not.toHaveBeenCalled();
    });

    it('should call onError with default message when no error provided', async () => {
        mockStrategy.upload = vi.fn().mockResolvedValue({
            status: UploadStatus.ERROR,
        });

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(onError).toHaveBeenCalledWith('test-id', 'Upload failed');
    });

    it('should handle thrown exceptions', async () => {
        mockStrategy.upload = vi.fn().mockRejectedValue(new Error('exception'));

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(onError).toHaveBeenCalledWith('test-id', 'exception');
        expect(onComplete).not.toHaveBeenCalled();
    });

    it('should handle non-Error exceptions', async () => {
        mockStrategy.upload = vi.fn().mockRejectedValue('unknown error');
        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(onError).toHaveBeenCalledWith('test-id', 'An unexpected error occurred');
    });

    it('should call onProgress when progress is reported', async () => {
        mockStrategy.upload = vi
            .fn()
            .mockImplementation((_: File, options: { onProgress?: (progress: number) => void }) => {
                if (options.onProgress) {
                    options.onProgress(25);
                    options.onProgress(50);
                    options.onProgress(100);
                }
                return Promise.resolve({ status: UploadStatus.COMPLETED });
            });

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile = createMockFile();

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(onProgress).toHaveBeenCalledWith('test-id', 25);
        expect(onProgress).toHaveBeenCalledWith('test-id', 50);
        expect(onProgress).toHaveBeenCalledWith('test-id', 100);
    });

    it('should handle chunk upload method', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy.upload = mockUpload;

        const { result } = renderHook(() =>
            useFileUpload({
                uploadStrategy: mockStrategy,
                onProgress,
                onComplete,
                onError,
            })
        );

        const uploadFile: UploadFile = {
            ...createMockFile(),
            uploadMethod: UploadMethod.CHUNKED,
        };

        await act(async () => {
            await result.current.upload(uploadFile);
        });

        expect(mockUpload).toHaveBeenCalledWith(
            uploadFile.file,
            expect.objectContaining({
                method: UploadMethod.CHUNKED,
            })
        );
    });
});
