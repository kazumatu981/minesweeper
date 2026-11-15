import { UiComponentBase } from '../../../src/common/ui-component-base.js';
import { UiComponentWithChildrenBase } from '../../../src/common/ui-component-with-children-base.js';

import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import { mockDocument, restoreDocument } from '../util/document_mock.js';

type TestChildEvent = 'child' | 'unmapped-child';

class TestChild extends UiComponentBase<TestChildEvent> {
    public constructor(index: number) {
        super({
            id: `child-${index}`,
            classes: [],
        });
    }

    public triggerEvent(
        eventName: TestChildEvent,
        ...args: unknown[]
    ): void {
        this.emit(eventName, ...args);
    }

    protected override onRightClick(): void {}

    protected override onLeftClick(): void {}
}

class TestParent extends UiComponentWithChildrenBase<
    'parent',
    TestChildEvent,
    TestChild
> {
    protected override onRightClick(): void {}

    protected override onLeftClick(): void {}
}

class TestGrandchild extends UiComponentBase<'grandchild-event'> {
    public constructor() {
        super({
            id: 'test-grandchild',
            classes: [],
        });
    }

    public triggerEvent(...args: unknown[]): void {
        this.emit('grandchild-event', ...args);
    }

    protected override onRightClick(): void {}

    protected override onLeftClick(): void {}
}

class TestMiddle extends UiComponentWithChildrenBase<
    'middle-event',
    'grandchild-event',
    TestGrandchild
> {
    public constructor() {
        super({
            id: 'test-middle',
            classes: [],
            childrenCount: 1,
            generateChild: () => new TestGrandchild(),
            eventMap: new Map([['grandchild-event', 'middle-event']]),
        });
    }

    protected override onRightClick(): void {}

    protected override onLeftClick(): void {}
}

class TestGrandparent extends UiComponentWithChildrenBase<
    'grandparent-event',
    'middle-event',
    TestMiddle
> {
    public constructor() {
        super({
            id: 'test-grandparent',
            classes: [],
            childrenCount: 1,
            generateChild: () => new TestMiddle(),
            eventMap: new Map([['middle-event', 'grandparent-event']]),
        });
    }

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

    void it('forwards all arguments of mapped child events to the parent', () => {
        const component = new TestParent({
            id: 'test-parent',
            classes: [],
            childrenCount: 1,
            generateChild: (index) => new TestChild(index),
            eventMap: new Map([['child', 'parent']]),
        });
        const parentEventMock = mock.fn();
        const child = component.children[0]!;

        component.on('parent', parentEventMock);
        child.triggerEvent('child', child, 'payload', 42);
        child.triggerEvent('unmapped-child');

        assert.equal(parentEventMock.mock.callCount(), 1);
        assert.deepEqual(parentEventMock.mock.calls[0]?.arguments, [
            child,
            'payload',
            42,
        ]);
    });

    void it('forwards child event arguments through two parent levels', () => {
        const grandparent = new TestGrandparent();
        const grandchild = grandparent.children[0]!.children[0]!;
        const eventMock = mock.fn();
        const payload = { source: grandchild };

        grandparent.on('grandparent-event', eventMock);
        grandchild.triggerEvent(grandchild, 'payload', 42, payload);

        assert.equal(eventMock.mock.callCount(), 1);
        assert.deepEqual(eventMock.mock.calls[0]?.arguments, [
            grandchild,
            'payload',
            42,
            payload,
        ]);
    });
});
