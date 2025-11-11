import { type IUploadStrategy } from '../components/FileUpload/types/UploadFileStrategy.interface.ts';
import { DEFAULT_UPLOAD_STRATEGY } from '../constants.ts';

import { ApiUploadStrategy } from './ApiUploadStrategy.ts';
import { MockUploadStrategy } from './MockUploadStrategy.ts';

export class UploadStrategyFactory {
    private strategies = new Map<string, IUploadStrategy>();

    constructor() {
        this.register('api', new ApiUploadStrategy());
        this.register('mock', new MockUploadStrategy());
    }

    register(key: string, strategy: IUploadStrategy): void {
        this.strategies.set(key, strategy);
    }

    get(key: string = DEFAULT_UPLOAD_STRATEGY): IUploadStrategy {
        const strategy = this.strategies.get(key);
        if (!strategy) {
            throw new Error(`Upload strategy '${key}' not found`);
        }
        return strategy;
    }
}

export const uploadStrategyFactory = new UploadStrategyFactory();
