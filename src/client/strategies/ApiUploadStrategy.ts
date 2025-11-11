import { uploadFile } from '../api/upload';
import { type IUploadStrategy } from '../components/FileUpload/types/UploadFileStrategy.interface.ts';
import { type UploadFileOptions, type UploadFileResult } from '../components/FileUpload/types/upload.types';

export class ApiUploadStrategy implements IUploadStrategy {
    async upload(file: File, options: UploadFileOptions): Promise<UploadFileResult> {
        return uploadFile(file, options);
    }
}
