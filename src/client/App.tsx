import { type ReactElement } from 'react';

import { FileUpload } from './components/FileUpload';
import { DEFAULT_UPLOAD_STRATEGY } from './constants.ts';
import { uploadStrategyFactory } from './strategies/UploadStrategyFactory.ts';

export const App = (): ReactElement => {
    return (
        <main className="relative isolate h-dvh">
            <img
                src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2FjY291bnRzXC82ZVwvNDAwMDM4OFwvcHJvamVjdHNcLzk4NFwvYXNzZXRzXC9iOFwvMTE1MjY1XC8xMjYwMTU0YzFhYmVmMDVjNjZlY2Q2MDdmMTRhZTkxNS0xNjM4MjU4MjQwLmpwZyJ9:weare:_kpZgwnGPTxOhYxIyfS1MhuZmxGrFCzP6ZW6dc-F6BQ?width=2400"
                alt="background image"
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
            />

            <div className="p-4">
                <section className="max-w-3xl p-4 bg-white bg-opacity-95 rounded-lg shadow-lg">
                    <h1 className="text-xl font-bold mb-4 text-center text-cyan-700">
                        File Upload ({DEFAULT_UPLOAD_STRATEGY})
                    </h1>
                    <FileUpload
                        uploadStrategy={uploadStrategyFactory.get(DEFAULT_UPLOAD_STRATEGY)}
                        maxFiles={5}
                        maxSize={50 * 1024 * 1024}
                    />
                </section>
            </div>
        </main>
    );
};
