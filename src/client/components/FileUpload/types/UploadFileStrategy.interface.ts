import { type UploadFileOptions, type UploadFileResult } from './upload.types.ts';

export interface IUploadStrategy {
    upload(file: File, options: UploadFileOptions): Promise<UploadFileResult>;
}
