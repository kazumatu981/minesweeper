import { EventHandler } from './event-handler.js';
import {
    type IStateMachine,
    type DecisionTableDictionary,
} from './decision-table.js';
export type StateMachineEvents = 'state-change';

export abstract class StateMachine<
    TEvents extends StateMachineEvents,
    TState extends string,
    TAction extends string,
>
    extends EventHandler<TEvents>
    implements IStateMachine<TState>
{
    #state: TState;

    abstract selectNextState: DecisionTableDictionary<
        TAction,
        TState,
        StateMachine<TEvents, TState, TAction>,
        TState
    >;

    constructor(state: TState) {
        super();
        this.#state = state;
    }

    get state(): TState {
        return this.#state;
    }

    protected set state(value: TState) {
        if (this.#state !== value) {
            this.#state = value;
            this.emit('state-change' as TEvents);
        }
    }

    public set __unsafeState(value: TState) {
        this.#state = value;
    }

    protected goNextState(action: TAction) {
        this.state = this.selectNextState[action][this.state](this);
    }
}
