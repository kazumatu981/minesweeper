const MINE_EVENT_STATE_CHANGE = 'state-change';
const MINE_EVENT_BOMBED = 'bombed';
const MINE_EVENT_OPENED = 'opened';

export type MineEvent = 'state-change' | 'bombed' | 'opened';

export const MINE_EVENTS: Record<MineEvent, string> = {
    [MINE_EVENT_STATE_CHANGE]: MINE_EVENT_STATE_CHANGE,
    [MINE_EVENT_BOMBED]: MINE_EVENT_BOMBED,
    [MINE_EVENT_OPENED]: MINE_EVENT_OPENED,
};

export type MineFieldEvent = MineEvent;

export const MINE_FIELD_EVENTS: Record<MineFieldEvent, string> = {
    ...MINE_EVENTS,
};
