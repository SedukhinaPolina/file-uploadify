import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { CHUNK_UPLOAD_CONFIG } from '../../../constants';
import { FileUpload } from '../index';
import { type IUploadStrategy } from '../types/UploadFileStrategy.interface';
import { UploadStatus } from '../types/upload.types';

const createMockStrategy = (mockUpload = vi.fn()): IUploadStrategy => ({
    upload: mockUpload,
});

describe('FileUpload Component', () => {
    let mockStrategy: IUploadStrategy;

    beforeEach(() => {
        mockStrategy = createMockStrategy();
    });

    it('render file selector and allow file selection', () => {
        render(<FileUpload uploadStrategy={mockStrategy} />);

        expect(screen.getByLabelText(/choose files to upload/i)).toBeInTheDocument();
        expect(screen.getByText(/click to select files/i)).toBeInTheDocument();
    });

    it('show max files limit in selector', () => {
        render(<FileUpload uploadStrategy={mockStrategy} maxFiles={3} />);

        expect(screen.getByText('Up to 3 more files')).toBeInTheDocument();
    });

    it('upload files when selected', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockUpload).toHaveBeenCalledWith(
                file,
                expect.objectContaining({
                    method: 'single',
                })
            );
        });
    });

    it('show file list when files are selected', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
            expect(screen.getByText('completed')).toBeInTheDocument();
        });
    });

    it('max files limit', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        render(<FileUpload uploadStrategy={mockStrategy} maxFiles={1} />);

        const file1 = new File(['test 1'], 'test1.txt', { type: 'text/plain' });
        const file2 = new File(['test 2'], 'test2.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file1] } });
        fireEvent.change(input, { target: { files: [file2] } });

        expect(alertSpy).toHaveBeenCalledWith('Exceeded maximum number of files');
        alertSpy.mockRestore();
    });

    it('max file size limit', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const maxSize = 1024;

        render(<FileUpload uploadStrategy={mockStrategy} maxSize={maxSize} />);

        const largeFile = new File(['1'.repeat(maxSize + 1)], 'large.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [largeFile] } });

        expect(alertSpy).toHaveBeenCalledWith('Exceeded file size limit');
        alertSpy.mockRestore();
    });

    it('chunked upload for large files', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} />);

        const largeFile = new File(['1'.repeat(CHUNK_UPLOAD_CONFIG.CHUNKED_UPLOAD_THRESHOLD + 1)], 'large.txt', {
            type: 'text/plain',
        });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [largeFile] } });

        await waitFor(() => {
            expect(mockUpload).toHaveBeenCalledWith(
                largeFile,
                expect.objectContaining({
                    method: 'chunked',
                })
            );
        });
    });

    it('should update progress', async () => {
        const mockUpload = vi.fn().mockImplementation((_, options: { onProgress?: (progress: number) => void }) => {
            if (options.onProgress) {
                options.onProgress(25);
                options.onProgress(50);
                options.onProgress(100);
            }
            return Promise.resolve({ status: UploadStatus.COMPLETED });
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('completed')).toBeInTheDocument();
            expect(screen.getByText('100%')).toBeInTheDocument();
        });
    });

    it('should remove file', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
        });

        const removeButton = screen.getByRole('button', { name: /remove file/i });
        fireEvent.click(removeButton);

        expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('should not render list when showFileList is false', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} showFileList={false} />);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockUpload).toHaveBeenCalled();
        });

        expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('should call onFilesChange when files are added', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);
        const onFilesChange = vi.fn();

        render(<FileUpload uploadStrategy={mockStrategy} onFilesChange={onFilesChange} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(onFilesChange).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        file,
                        status: UploadStatus.PENDING,
                    }),
                ])
            );
        });
    });

    it('should call onFilesChange when files are removed', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);
        const onFilesChange = vi.fn();

        render(<FileUpload uploadStrategy={mockStrategy} onFilesChange={onFilesChange} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
        });

        onFilesChange.mockClear();

        const removeButton = screen.getByRole('button', { name: /remove file/i });
        fireEvent.click(removeButton);

        expect(onFilesChange).toHaveBeenCalledWith([]);
    });

    it('should call onFilesChange on progress updates', async () => {
        const mockUpload = vi.fn().mockImplementation((_, options: { onProgress?: (progress: number) => void }) => {
            if (options.onProgress) {
                options.onProgress(50);
            }
            return Promise.resolve({ status: UploadStatus.COMPLETED });
        });
        mockStrategy = createMockStrategy(mockUpload);
        const onFilesChange = vi.fn();

        render(<FileUpload uploadStrategy={mockStrategy} onFilesChange={onFilesChange} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(onFilesChange).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        progress: 50,
                        status: UploadStatus.UPLOADING,
                    }),
                ])
            );
        });
    });
});
