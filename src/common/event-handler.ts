/**
 * eventを実行するイベントハンドラ
 */
export type EventAction = (...args: unknown[]) => void;
/**
 * eventを実行すべきかどうかを判定する判定関数
 */
export type EventPredicate = (...args: unknown[]) => boolean;

/**
 * event定義本体
 */
interface EventHandlerElement {
    action: EventAction;
    when: EventPredicate | undefined;
}

export interface EventHandlerEntry<TEvents extends string> {
    eventName: TEvents;
    elements: EventHandlerElement[];
}

export class EventHandlerMap<TEvents extends string> extends Map<
    TEvents,
    EventHandlerElement[]
> {
    append(eventName: TEvents, element: EventHandlerElement): void {
        if (this.has(eventName)) {
            const elements = this.get(eventName);
            if (
                elements!.find(
                    (e) =>
                        e.action === element.action && e.when === element.when
                )
            ) {
                return;
            }
            this.get(eventName)!.push(element);
        } else {
            this.set(eventName, [element]);
        }
    }

    emitFor(eventName: TEvents, ...args: unknown[]): void {
        (this.get(eventName) ?? []).forEach((handlerDefine) => {
            if (handlerDefine.when) {
                if (handlerDefine.when(...args)) {
                    handlerDefine.action(...args);
                }
            } else {
                handlerDefine.action(...args);
            }
        });
    }

    static from<TEvents extends string>(
        entries: EventHandlerEntry<TEvents>[]
    ): EventHandlerMap<TEvents> {
        const map = new EventHandlerMap<TEvents>();
        entries.forEach((entry) => {
            map.set(entry.eventName, entry.elements);
        });
        return map;
    }
}

/**
 * イベントを管理する基底クラス。 本プロジェクトで活用する部品はこれを継承して作成すること。
 */
export class EventHandler<TEvents extends string> {
    readonly #events: EventHandlerMap<TEvents> = new EventHandlerMap();

    //#region メソッド
    /**
     * イベントを登録する。 ローカル変数に eventHandler を登録しておくことで、
     * fire()が呼び出されるとそのメソッドが実行されるよう
     * に予約しておく。同じイベント名が指定されても、イベントは配列で格納されるため、上書きされることはない。
     * @param eventName - イベント名
     * @param eventHandler - イベントハンドラ
     * @param when - event発生条件
     */
    public on(eventName: TEvents, action: EventAction, when?: EventPredicate) {
        this.#events.append(eventName, { action, when });
    }

    /**
     * イベントを実行する。
     * ローカル変数 eventHandler に登録されたイベントを参照して、
     * 存在すれば、そのイベント(関数)を実行する。
     * イベントは複数存在する場合は、先頭から順に実行する。
     * @param eventName イベント名
     * @param args イベントに渡す引数
     */
    protected emit(eventName: TEvents, ...args: unknown[]) {
        this.#events.emitFor(eventName, ...args);
    }
    //#endregion
}
