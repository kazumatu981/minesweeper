const MINE_EVENT_STATE_CHANGE = 'state-change';
const MINE_EVENT_BOOM = 'boom';

export type MineEvent = 'state-change' | 'boom';

export const MINE_EVENTS: Record<MineEvent, string> = {
    [MINE_EVENT_STATE_CHANGE]: MINE_EVENT_STATE_CHANGE,
    [MINE_EVENT_BOOM]: MINE_EVENT_BOOM,
};
