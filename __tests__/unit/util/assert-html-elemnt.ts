import { AssertionError } from 'node:assert';
export class AssertHtmlElement {
    static equalClassNames(
        element: HTMLElement,
        expectedClassNames: string[]
    ): void {
        const actualClassNames = Array.from(element.classList);
        if (actualClassNames.length !== expectedClassNames.length) {
            throw new AssertionError({
                message: 'Class names length mismatch',
                actual: actualClassNames,
                expected: expectedClassNames,
            });
        }
        for (const className of expectedClassNames) {
            if (!element.classList.contains(className)) {
                throw new AssertionError({
                    message: `Class name "${className}" not found`,
                    actual: actualClassNames,
                    expected: expectedClassNames,
                });
            }
        }
    }
    static equalTextContent(element: HTMLElement, expectedText: string): void {
        const actualText = element.textContent ?? '';
        if (actualText !== expectedText) {
            throw new AssertionError({
                message: `Text content mismatch`,
                actual: actualText,
                expected: expectedText,
            });
        }
    }
}
