# file-uploadify

File upload component for React apps with support for single and chunked uploads.

## Demo

[https://sedukhinalina.github.io/file-uploadify/](https://sedukhinalina.github.io/file-uploadify/)

## Features

- Multiple file uploads with progress tracking
- Automatic chunking for large files
- Parallel chunk uploads
- Cam be used with or without the built-in file list
- Pluggable upload strategies - easily extend for S3, GraphQL, etc.

## Installation

```bash
npm install
npm run dev
```
The application will be available at `http://localhost:3000/file-uploadify/`

## Testing

```bash
# Run all tests
npm test

# Run client tests
npm run test:client

# Run tests with coverage
npm run test:client:coverage

# Run server e2e tests
npm run test:server
```


## Component Usage

### Basic Usage

```tsx
import { FileUpload } from './components/FileUpload';
import { uploadStrategyFactory } from './strategies/UploadStrategyFactory';

function App() {
  return (
    <FileUpload
      uploadStrategy={uploadStrategyFactory.get('api')}
      maxFiles={5}
      maxSize={50 * 1024 * 1024}
    />
  );
}
```

### Custom UI

```tsx
import { FileUpload, type UploadFile } from './components/FileUpload';
import { ApiUploadStrategy } from './strategies/ApiUploadStrategy';

function App() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const strategy = useMemo(() => new ApiUploadStrategy(), []);

  return (
    <div>
      <FileUpload
        uploadStrategy={strategy}
        showFileList={false}
        onFilesChange={setFiles}
      />
      <div>
        {files.map(file => (
          <div key={file.id}>
            {file.file.name} - {file.progress}% - {file.status}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `uploadStrategy` | `IUploadStrategy` | *required* | Upload strategy implementation |
| `maxFiles` | `number` | `5` | Maximum number of files allowed |
| `maxSize` | `number` | `10MB` | Maximum file size in bytes |
| `showFileList` | `boolean` | `true` | Show/hide the built-in file list |
| `onFilesChange` | `(files: UploadFile[]) => void` | - | Callback when files state changes |

### Creating Custom Upload Strategies

```tsx
import { IUploadStrategy, UploadFileOptions, UploadFileResult } from './types';

class S3UploadStrategy implements IUploadStrategy {
  async upload(file: File, options: UploadFileOptions): Promise<UploadFileResult> {
    return {
      status: UploadStatus.COMPLETED,
      url: 's3://bucket/file.txt'
    };
  }
}

uploadStrategyFactory.register('s3', new S3UploadStrategy());
```

## Configuration

Edit `src/client/constants.ts`:

```ts
export const CHUNK_UPLOAD_CONFIG = {
  CHUNK_SIZE: 1024 * 1024,              // 1MB chunks
  CONCURRENT_UPLOADS: 3,                // 3 parallel uploads
  CHUNKED_UPLOAD_THRESHOLD: 5 * 1024 * 1024, // Files >5MB use chunking
};

export const DEFAULT_MAX_FILES = 5;
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
```


## TODOs

UX:
* Add upload cancellation
* Implement retry logic
* Add file type validation/filtering
* Better error handling UI (at the moment it's just alerts)
* Localization/i18n
* Custom themes/styling system

Technical:
* Add error boundaries
* Add Storybook and configurable demo
* Add E2E tests with Playwright


## Mock API

You find the express API under `src/server`. A file upload API is provided. You can use it and/or modify it to your needs.

### List of files

```http
GET /api/files
```

### Upload a single file

```http
POST /api/upload-single
```

| Body parameter | Type   | Description                      |
| :------------- | :----- | :------------------------------- |
| `file`         | `file` | **Required**. The file to upload |

### Upload a file in chunks

```http
POST /api/upload-chunks
```

| Body parameter      | Type     | Description                                  |
| :------------------ | :------- | :------------------------------------------- |
| `file`              | `file`   | **Required**. The file to upload             |
| `currentChunkIndex` | `number` | **Required**. The current chunk index number |
| `totalChunks`       | `number` | **Required**. The total number of chunks     |
