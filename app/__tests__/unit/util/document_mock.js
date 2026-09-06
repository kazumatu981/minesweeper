import { mock } from 'node:test';

const defaultDocument = globalThis.document;

export function mockDocument() {
    const mockDocument = {
        createElement: mock.fn(() => {
            return {
                classList: {
                    add: mock.fn(),
                    remove: mock.fn(),
                },
                textContent: '',
                addEventListener: mock.fn(() => {}),
            };
        }),
    };
    globalThis.document = mockDocument;
    return mockDocument;
}

export function restoreDocument() {
    globalThis.document = defaultDocument;
}
