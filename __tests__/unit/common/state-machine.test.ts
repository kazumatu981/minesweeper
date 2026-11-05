import {
    StateMachine,
    type StateActionHandler,
} from '../../../src/common/state-machine.js';
import { type DecisionTableDictionary } from '../../../src/common/decision-table.js';

import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

type TestState = 'idle' | 'running' | 'finished';
type TestAction = 'start' | 'finish';

type TestContext = {
    transitionTable: DecisionTableDictionary<
        TestAction,
        TestState,
        TestContext
    >;
    stateActionHandlers: StateActionHandler<TestState>[];
};

/**
 * ステートマシンのテストに使用するコンテキストを作成する。
 *
 * @param stateActionHandlers - 状態変化時に実行するモックハンドラー。
 * @returns コンテキストと、呼び出しを検証する遷移関数のモック。
 */
function createTestContext(
    stateActionHandlers: StateActionHandler<TestState>[] = []
): {
    context: TestContext;
    transitionToRunning: ReturnType<
        typeof mock.fn<(context: TestContext) => TestState>
    >;
} {
    const transitionToRunning = mock.fn(
        (_context: TestContext): TestState => 'running'
    );
    const context: TestContext = {
        transitionTable: {
            start: {
                idle: transitionToRunning,
                running: () => 'running',
                finished: () => 'finished',
            },
            finish: {
                idle: () => 'idle',
                running: () => 'finished',
                finished: () => 'finished',
            },
        },
        stateActionHandlers,
    };

    return { context, transitionToRunning };
}

void describe('unittest: StateMachine', () => {
    void it('should transition state and invoke only matching state action handlers with context', () => {
        const idleAction = mock.fn(),
            runningAction = mock.fn(),
            selectedStatesAction = mock.fn(),
            anyStateAction = mock.fn();
        const stateActionHandlers: StateActionHandler<TestState>[] = [
            { state: 'idle', action: idleAction },
            { state: 'running', action: runningAction },
            { state: ['running', 'finished'], action: selectedStatesAction },
            { state: undefined, action: anyStateAction },
        ];
        const { context, transitionToRunning } =
            createTestContext(stateActionHandlers);
        const stateMachine = new StateMachine<
            TestState,
            TestAction,
            TestContext
        >('idle', context);

        stateMachine.applyAction('start');

        assert.deepEqual(
            {
                state: stateMachine.state,
                transitionArguments:
                    transitionToRunning.mock.calls[0]?.arguments,
                handlerCalls: {
                    idle: idleAction.mock.calls.length,
                    running: runningAction.mock.calls[0]?.arguments,
                    selectedStates:
                        selectedStatesAction.mock.calls[0]?.arguments,
                    anyState: anyStateAction.mock.calls[0]?.arguments,
                },
            },
            {
                state: 'running',
                transitionArguments: [context],
                handlerCalls: {
                    idle: 0,
                    running: [context],
                    selectedStates: [context],
                    anyState: [context],
                },
            }
        );

        stateMachine.applyAction('finish');

        assert.deepEqual(
            {
                state: stateMachine.state,
                running: runningAction.mock.calls.length,
                selectedStates: selectedStatesAction.mock.calls.length,
                anyState: anyStateAction.mock.calls.length,
            },
            {
                state: 'finished',
                running: 1,
                selectedStates: 2,
                anyState: 2,
            }
        );
    });

    void it('should not invoke state action handlers when the state does not change', () => {
        const runningAction = mock.fn();
        const { context } = createTestContext([
            { state: 'running', action: runningAction },
        ]);
        const stateMachine = new StateMachine<
            TestState,
            TestAction,
            TestContext
        >('running', context);

        stateMachine.applyAction('start');

        assert.equal(stateMachine.state, 'running');
        assert.equal(runningAction.mock.calls.length, 0);
    });

    void it('should invoke the initial-state handler when reset changes the state', () => {
        const idleAction = mock.fn();
        const { context } = createTestContext([
            { state: 'idle', action: idleAction },
        ]);
        const stateMachine = new StateMachine<
            TestState,
            TestAction,
            TestContext
        >('idle', context);

        stateMachine.applyAction('start');
        assert.equal(stateMachine.state, 'running');

        stateMachine.reset();

        assert.equal(stateMachine.state, 'idle');
        assert.deepEqual(idleAction.mock.calls[0]?.arguments, [context]);

        stateMachine.reset();

        assert.equal(idleAction.mock.calls.length, 1);
    });
});
