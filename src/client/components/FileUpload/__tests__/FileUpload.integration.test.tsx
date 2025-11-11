import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { vi, describe, it, expect, beforeEach, afterEach, type MockedFunction } from 'vitest';

import { CHUNK_UPLOAD_CONFIG } from '../../../constants';
import { uploadStrategyFactory } from '../../../strategies/UploadStrategyFactory';
import { FileUpload } from '../index';

vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
        isCancel: vi.fn().mockReturnValue(false),
    },
}));

const mockedPost = axios.post as MockedFunction<typeof axios.post>;

describe('FileUpload Integration Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should complete upload flow', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'File uploaded successfully' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as InternalAxiosRequestConfig,
        };
        mockedPost.mockResolvedValue(mockResponse);

        const strategy = uploadStrategyFactory.get('api');

        const maxFiles = 5;
        render(<FileUpload uploadStrategy={strategy} maxFiles={maxFiles} />);
        expect(screen.getByText(/click to select files/i)).toBeInTheDocument();
        expect(screen.getByText(`Up to ${maxFiles} more files`)).toBeInTheDocument();

        const file = new File(['test file content'], 'test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(mockedPost).toHaveBeenCalledWith(
                '/api/upload-single',
                expect.any(FormData),
                expect.objectContaining({
                    onUploadProgress: expect.any(Function) as (progressEvent: number) => void,
                    signal: undefined,
                })
            );
        });

        await waitFor(
            () => {
                expect(screen.getByText('completed')).toBeInTheDocument();
                expect(screen.getByText('100%')).toBeInTheDocument();
            },
            { timeout: 1000 }
        );

        const removeButton = screen.getByRole('button', { name: /remove file/i });
        fireEvent.click(removeButton);

        expect(screen.queryByText('integration-test.txt')).not.toBeInTheDocument();
        expect(screen.getByText('Up to 5 more files')).toBeInTheDocument();
    });

    it('should handle upload failure', async () => {
        mockedPost.mockRejectedValue(new Error('Upload failed'));

        const strategy = uploadStrategyFactory.get('api');
        render(<FileUpload uploadStrategy={strategy} />);

        const file = new File(['test content'], 'error-test.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('error-test.txt')).toBeInTheDocument();
        });

        await waitFor(
            () => {
                expect(screen.getByText('error')).toBeInTheDocument();
                expect(screen.getByText('Upload failed')).toBeInTheDocument();
            },
            { timeout: 1000 }
        );
    });

    it('should upload chinked file', async () => {
        const mockResponse: AxiosResponse = {
            data: { message: 'Chunk uploaded successfully' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as InternalAxiosRequestConfig,
        };
        mockedPost.mockResolvedValue(mockResponse);

        const strategy = uploadStrategyFactory.get('api');
        render(<FileUpload uploadStrategy={strategy} />);

        const largeContent = '1'.repeat(CHUNK_UPLOAD_CONFIG.CHUNKED_UPLOAD_THRESHOLD + 1);
        const largeFile = new File([largeContent], 'large-file.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/choose files to upload/i);

        fireEvent.change(input, { target: { files: [largeFile] } });

        await waitFor(() => {
            expect(screen.getByText('large-file.txt')).toBeInTheDocument();
        });

        await waitFor(
            () => {
                expect(mockedPost).toHaveBeenCalledWith(
                    '/api/upload-chunk',
                    expect.any(FormData),
                    expect.objectContaining({
                        signal: undefined,
                    })
                );
            },
            { timeout: 3000 }
        );
    });
});
