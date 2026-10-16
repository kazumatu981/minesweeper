import { JSDOM } from 'jsdom';

const defaultDocument = globalThis.document;
export interface Mocker {
    dispatchMouseEvent: (element: Element, eventName: string) => void;
    dom: JSDOM;
    document: Document;
}

export function mockDocument(): Mocker {
    const dom = new JSDOM();
    const mockDocument = dom.window.document;
    globalThis.document = mockDocument;

    function dispatchMouseEvent(element: Element, eventName: string) {
        const event = new dom.window.MouseEvent(eventName, {
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(event);
    }

    return {
        dispatchMouseEvent,
        dom,
        document: mockDocument,
    };
}

export function restoreDocument() {
    globalThis.document = defaultDocument;
}
