import { UiComponentBase } from '../../../src/common/ui-component-base.js';
import { UiComponentWithChildrenBase } from '../../../src/common/ui-component-with-children-base.js';

import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import { mockDocument, restoreDocument } from '../util/document_mock.js';

class TestChild extends UiComponentBase<'child'> {
    public constructor(index: number) {
        super({
            id: `child-${index}`,
            classes: [],
        });
    }

    protected override onRightClick(): void {}

    protected override onLeftClick(): void {}
}

class TestParent extends UiComponentWithChildrenBase<
    'parent',
    'child',
    TestChild
> {
    protected override onRightClick(): void {}

    protected override onLeftClick(): void {}
}

void describe('UiComponentWithChildrenBase', () => {
    before(() => {
        mockDocument();
    });

    after(() => {
        restoreDocument();
    });

    void it('generates the configured number of children and appends them in order', () => {
        const generateChildMock = mock.fn(
            (index: number) => new TestChild(index)
        );
        const component = new TestParent({
            id: 'test-parent',
            classes: [],
            childrenCount: 3,
            generateChild: generateChildMock,
        });

        assert.equal(generateChildMock.mock.callCount(), 3);
        assert.deepEqual(
            generateChildMock.mock.calls.map((call) => call.arguments[0]),
            [0, 1, 2]
        );
        assert.deepEqual(
            component.children.map((child) => child.id),
            ['child-0', 'child-1', 'child-2']
        );
        assert.deepEqual(
            Array.from(component.element.children).map((child) => child.id),
            ['child-0', 'child-1', 'child-2']
        );
    });

    void it('retains the children array reference and updates it when reset', () => {
        const component = new TestParent({
            id: 'test-parent',
            classes: [],
            childrenCount: 2,
            generateChild: (index) => new TestChild(index),
        });
        const children = component.children;

        component.resetChildren(3);

        assert.strictEqual(component.children, children);
        assert.deepEqual(
            component.children.map((child) => child.id),
            ['child-0', 'child-1', 'child-2']
        );
        assert.deepEqual(
            Array.from(component.element.children).map((child) => child.id),
            ['child-0', 'child-1', 'child-2']
        );
    });

    void it('clears the children and DOM when reset to zero', () => {
        const component = new TestParent({
            id: 'test-parent',
            classes: [],
            childrenCount: 2,
            generateChild: (index) => new TestChild(index),
        });

        component.resetChildren(0);

        assert.deepEqual(component.children, []);
        assert.equal(component.element.childElementCount, 0);
    });
});
