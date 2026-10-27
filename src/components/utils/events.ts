import { type StateMachineEvents } from '../../common/index.js';

export type MineEvent = StateMachineEvents | 'bombed' | 'opened' | 'resolved';
export type MineFieldEvent =
    | StateMachineEvents
    | 'score-changed'
    | 'resolved'
    | 'bombed';
