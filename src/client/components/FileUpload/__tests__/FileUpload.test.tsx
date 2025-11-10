import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<FileUpload uploadStrategy={mockStrategy} maxFiles={1} />);

        const file1 = new File(['test 1'], 'test1.txt', { type: 'text/plain' });
        const file2 = new File(['test 2'], 'test2.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file1] } });
        fireEvent.change(input, { target: { files: [file2] } });

        expect(consoleSpy).toHaveBeenCalledWith('Exceeded maximum number of files');
        consoleSpy.mockRestore();
    });

    it('max file size limit', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const maxSize = 1024;

        render(<FileUpload uploadStrategy={mockStrategy} maxSize={maxSize} />);

        const largeFile = new File(['x'.repeat(maxSize + 1)], 'large.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [largeFile] } });

        expect(consoleSpy).toHaveBeenCalledWith('Exceeded file size limit');
        consoleSpy.mockRestore();
    });

    it('chunked upload for large files', async () => {
        const mockUpload = vi.fn().mockResolvedValue({
            status: UploadStatus.COMPLETED,
        });
        mockStrategy = createMockStrategy(mockUpload);

        render(<FileUpload uploadStrategy={mockStrategy} />);

        const largeFile = new File(['1'.repeat(5 * 1024 * 1024 + 1)], 'large.txt', { type: 'text/plain' });
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
});
