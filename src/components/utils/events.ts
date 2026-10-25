import { type StateMachineEvents } from '../../common/index.js';

export type MineEvent = StateMachineEvents | 'bombed' | 'opened';
export type MineFieldEvent = StateMachineEvents | 'score_changed' | 'bombed';
