import { JSDOM } from 'jsdom';

const defaultDocument = globalThis.document;

function dispatchMouseEvent(element: Element, eventName: string) {
    const event = new MouseEvent(eventName, {
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(event);
}

export function mockDocument() {
    const dom = new JSDOM();
    const mockDocument = dom.window.document;
    globalThis.document = mockDocument;
    return {
        dispatchMouseEvent,
        dom,
        document: mockDocument,
    };
}

export function restoreDocument() {
    globalThis.document = defaultDocument;
}
