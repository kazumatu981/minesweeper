import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import {
    EventDispatcher,
    EventRegistry,
    type EventRegistryEntry,
} from '../../../src/common/events.js';

void describe('EventRegistry.append によるイベントハンドラーの登録', () => {
    void it('新しいイベントにハンドラーを登録する', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();

        registry.append('test', { callback, condition: undefined });

        assert.deepEqual(registry.get('test'), [
            { callback, condition: undefined },
        ]);
    });
    void it('同じイベントに複数のハンドラーを登録する', () => {
        const registry = new EventRegistry<'test'>();
        const firstCallback = mock.fn();
        const secondCallback = mock.fn();

        registry.append('test', {
            callback: firstCallback,
            condition: undefined,
        });
        registry.append('test', {
            callback: secondCallback,
            condition: undefined,
        });

        assert.deepEqual(registry.get('test'), [
            { callback: firstCallback, condition: undefined },
            { callback: secondCallback, condition: undefined },
        ]);
    });
    void it('同じコールバックと条件の組み合わせを重複登録しない', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();
        const condition = mock.fn(() => true);
        const registration = { callback, condition };

        registry.append('test', registration);
        registry.append('test', registration);

        assert.deepEqual(registry.get('test'), [registration]);
    });
    void it('同じコールバックでも条件が異なれば登録する', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();
        const firstCondition = mock.fn(() => true);
        const secondCondition = mock.fn(() => false);

        registry.append('test', { callback, condition: firstCondition });
        registry.append('test', { callback, condition: secondCondition });

        assert.deepEqual(registry.get('test'), [
            { callback, condition: firstCondition },
            { callback, condition: secondCondition },
        ]);
    });
    void it('条件が同じでもコールバックが異なれば登録する', () => {
        const registry = new EventRegistry<'test'>();
        const firstCallback = mock.fn();
        const secondCallback = mock.fn();
        const condition = mock.fn(() => true);

        registry.append('test', {
            callback: firstCallback,
            condition,
        });
        registry.append('test', {
            callback: secondCallback,
            condition,
        });

        assert.deepEqual(registry.get('test'), [
            { callback: firstCallback, condition },
            { callback: secondCallback, condition },
        ]);
    });
});

void describe('EventRegistry.emitFor によるイベントの通知', () => {
    void it('指定したイベントのハンドラーを登録順に呼び出す', () => {
        const registry = new EventRegistry<'first' | 'second'>();
        const calls: string[] = [];
        const firstHandler = mock.fn(() => calls.push('first handler 1'));
        const secondHandler = mock.fn(() => calls.push('first handler 2'));
        const otherHandler = mock.fn(() => calls.push('second handler'));

        registry.append('first', {
            callback: firstHandler,
            condition: undefined,
        });
        registry.append('first', {
            callback: secondHandler,
            condition: undefined,
        });
        registry.append('second', {
            callback: otherHandler,
            condition: undefined,
        });

        registry.emitFor('first');

        assert.deepEqual(calls, ['first handler 1', 'first handler 2']);
    });
    void it('イベント引数をハンドラーに渡す', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();

        registry.append('test', {
            callback,
            condition: undefined,
        });

        registry.emitFor('test', 'hello', 42);

        assert.deepEqual(callback.mock.calls[0]?.arguments, ['hello', 42]);
    });
    void it('条件を満たしたハンドラーを呼び出す', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();
        const condition = mock.fn((value: unknown) => value === 'run');

        registry.append('test', {
            callback,
            condition,
        });

        registry.emitFor('test', 'run');

        assert.equal(condition.mock.calls.length, 1);
        assert.deepEqual(condition.mock.calls[0]?.arguments, ['run']);
        assert.equal(callback.mock.calls.length, 1);
        assert.deepEqual(callback.mock.calls[0]?.arguments, ['run']);
    });
    void it('条件を満たさないハンドラーを呼び出さない', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();
        const condition = mock.fn((value: unknown) => value === 'run');

        registry.append('test', {
            callback,
            condition,
        });

        registry.emitFor('test', 'skip');

        assert.equal(condition.mock.calls.length, 1);
        assert.deepEqual(condition.mock.calls[0]?.arguments, ['skip']);
        assert.equal(callback.mock.calls.length, 0);
    });
    void it('条件が指定されていないハンドラーを呼び出す', () => {
        const registry = new EventRegistry<'test'>();
        const callback = mock.fn();

        registry.append('test', {
            callback,
            condition: undefined,
        });

        registry.emitFor('test');

        assert.equal(callback.mock.calls.length, 1);
    });
    void it('ハンドラー未登録のイベントを通知しても例外を投げない', () => {
        const registry = new EventRegistry<'test'>();

        assert.doesNotThrow(() => registry.emitFor('test'));
    });
});

void describe('EventRegistry.from によるレジストリの生成', () => {
    void it('イベントエントリーからレジストリを生成する', () => {
        const firstCallback = mock.fn();
        const secondCallback = mock.fn();
        const entries: EventRegistryEntry<'first' | 'second'>[] = [
            {
                eventName: 'first',
                registrations: [
                    { callback: firstCallback, condition: undefined },
                ],
            },
            {
                eventName: 'second',
                registrations: [
                    { callback: secondCallback, condition: undefined },
                ],
            },
        ];

        const registry = EventRegistry.from(entries);

        assert.deepEqual(registry.get('first'), [
            { callback: firstCallback, condition: undefined },
        ]);
        assert.deepEqual(registry.get('second'), [
            { callback: secondCallback, condition: undefined },
        ]);
    });
});

void describe('EventDispatcher のイベント通知', () => {
    class TestDispatcher extends EventDispatcher<'test'> {
        public fire(...args: unknown[]): void {
            this.emit('test', ...args);
        }
    }

    void it('イベントを通知すると on で登録したハンドラーを呼び出す', () => {
        const dispatcher = new TestDispatcher();
        const callback = mock.fn();

        dispatcher.on('test', callback);
        dispatcher.fire();

        assert.equal(callback.mock.calls.length, 1);
    });
    void it('イベント引数を登録済みハンドラーに渡す', () => {
        const dispatcher = new TestDispatcher();
        const callback = mock.fn();

        dispatcher.on('test', callback);
        dispatcher.fire('hello', 42);

        assert.deepEqual(callback.mock.calls[0]?.arguments, ['hello', 42]);
    });
    void it('条件を満たした場合に限り登録済みハンドラーを呼び出す', () => {
        const dispatcher = new TestDispatcher();
        const callback = mock.fn();
        const condition = mock.fn((value: unknown) => value === 'run');

        dispatcher.on('test', callback, condition);
        dispatcher.fire('skip');
        dispatcher.fire('run');

        assert.equal(condition.mock.calls.length, 2);
        assert.deepEqual(
            condition.mock.calls.map((call) => call.arguments),
            [['skip'], ['run']]
        );
        assert.equal(callback.mock.calls.length, 1);
        assert.deepEqual(callback.mock.calls[0]?.arguments, ['run']);
    });
    void it('同じコールバックと条件の組み合わせを重複登録しない', () => {
        const dispatcher = new TestDispatcher();
        const callback = mock.fn();
        const condition = mock.fn(() => true);

        dispatcher.on('test', callback, condition);
        dispatcher.on('test', callback, condition);
        dispatcher.fire();

        assert.equal(condition.mock.calls.length, 1);
        assert.equal(callback.mock.calls.length, 1);
    });
});
