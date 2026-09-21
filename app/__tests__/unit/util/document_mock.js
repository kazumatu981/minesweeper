import { JSDOM } from 'jsdom';

const defaultDocument = globalThis.document;

export function mockDocument() {
    const dom = new JSDOM();
    const mockDocument = dom.window.document;
    globalThis.document = mockDocument;
    return {
        dom,
        document: mockDocument,
    };
}

export function restoreDocument() {
    globalThis.document = defaultDocument;
}
