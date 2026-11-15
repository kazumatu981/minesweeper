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

void describe('子コンポーネントを持つ UI 基底クラス', () => {
    before(() => {
        mockDocument();
    });

    after(() => {
        restoreDocument();
    });

    void it('設定された数の子コンポーネントを生成し、順番に追加する', () => {
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

    void it('reset 後も子配列の参照を保ち、要素を更新する', () => {
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

    void it('子の数を 0 に reset すると、子コンポーネントと DOM を空にする', () => {
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

    void it('対応付けられた子イベントの引数をすべて親へ伝える', () => {
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

    void it('子イベントの引数を親子 2 段階で伝える', () => {
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
