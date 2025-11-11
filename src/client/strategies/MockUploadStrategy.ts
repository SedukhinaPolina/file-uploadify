import { type IUploadStrategy } from '../components/FileUpload/types/UploadFileStrategy.interface.ts';
import {
    type UploadFileOptions,
    type UploadFileResult,
    UploadStatus,
} from '../components/FileUpload/types/upload.types.ts';

/**
 * Mock upload strategy that simulates file uploads without a backend.
 */
const FAILURE_RATE = 0.1;
const STEPS = 10;
const DELAY_PER_STEP = 100;
export class MockUploadStrategy implements IUploadStrategy {
    async upload(file: File, options: UploadFileOptions): Promise<UploadFileResult> {
        try {
            for (let i = 1; i <= STEPS; i++) {
                await this.sleep(DELAY_PER_STEP);
                const progress = Math.round((i / STEPS) * 100);
                options.onProgress?.(progress);
            }

            if (Math.random() < FAILURE_RATE) {
                return {
                    status: UploadStatus.ERROR,
                    error: 'Mock upload failed (simulated error)',
                };
            }

            const mockUrl = URL.createObjectURL(file);
            return {
                status: UploadStatus.COMPLETED,
                url: mockUrl,
            };
        } catch (error) {
            return {
                status: UploadStatus.ERROR,
                error: error instanceof Error ? error.message : 'Mock upload failed',
            };
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
