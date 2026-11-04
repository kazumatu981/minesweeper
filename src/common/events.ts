/**
 * eventを実行するイベントハンドラ
 */
export type EventCallback = (...args: unknown[]) => void;
/**
 * eventを実行すべきかどうかを判定する判定関数
 */
export type EventPredicate = (...args: unknown[]) => boolean;

/**
 * イベント名と、そのイベントに登録された処理の一覧を表す。
 */
export interface EventRegistryEntry<TEvents extends string> {
    /** イベント名 */
    eventName: TEvents;
    /** イベント名に対応する処理の登録情報 */
    registrations: EventRegistration[];
}

/**
 * イベントに登録する処理と、その実行条件を表す。
 */
interface EventRegistration {
    /** イベント発生時に実行する処理 */
    callback: EventCallback;
    /** 処理を実行する条件。未指定の場合は常に実行する */
    condition: EventPredicate | undefined;
}

/**
 * イベント名と、そのイベントに登録された処理を管理するクラス。
 */
export class EventRegistry<TEvents extends string> extends Map<
    TEvents,
    EventRegistration[]
> {
    /**
     * イベントに処理を登録する。同じ処理と条件の組み合わせは重複して登録しない。
     * @param eventName - イベント名
     * @param registration - 登録する処理と条件
     */
    append(eventName: TEvents, registration: EventRegistration): void {
        if (this.has(eventName)) {
            const registrations = this.get(eventName);
            if (
                registrations!.find(
                    (e) =>
                        e.callback === registration.callback &&
                        e.condition === registration.condition
                )
            ) {
                return;
            }
            this.get(eventName)!.push(registration);
        } else {
            this.set(eventName, [registration]);
        }
    }

    /**
     * 条件を満たす処理を、登録された順に実行する。
     * @param eventName - イベント名
     * @param args - 処理と条件に渡す引数
     */
    emitFor(eventName: TEvents, ...args: unknown[]): void {
        (this.get(eventName) ?? []).forEach((handlerDefine) => {
            if (handlerDefine.condition) {
                if (handlerDefine.condition(...args)) {
                    handlerDefine.callback(...args);
                }
            } else {
                handlerDefine.callback(...args);
            }
        });
    }

    /**
     * 登録情報の配列からイベントレジストリを作成する。
     * @param entries - イベント名と登録情報の配列
     */
    static from<TEvents extends string>(
        entries: EventRegistryEntry<TEvents>[]
    ): EventRegistry<TEvents> {
        const map = new EventRegistry<TEvents>();
        entries.forEach((entry) => {
            map.set(entry.eventName, entry.registrations);
        });
        return map;
    }
}

/**
 * イベントの登録と実行を行う基底クラス。本プロジェクトでイベントを扱う部品はこれを継承して作成すること。
 */
export class EventDispatcher<TEvents extends string> {
    readonly #registry: EventRegistry<TEvents> = new EventRegistry();

    /**
     * イベントに処理を登録する。同じイベント名には複数の処理を登録できる。
     * 同じ処理と条件の組み合わせは重複して登録しない。
     * @param eventName - イベント名
     * @param callback - イベント発生時に実行する処理
     * @param condition - 処理を実行する条件
     */
    public on(
        eventName: TEvents,
        callback: EventCallback,
        condition?: EventPredicate
    ) {
        this.#registry.append(eventName, { callback, condition });
    }

    /**
     * イベントに登録された処理を実行する。
     * @param eventName - イベント名
     * @param args - 処理と条件に渡す引数
     */
    protected emit(eventName: TEvents, ...args: unknown[]) {
        this.#registry.emitFor(eventName, ...args);
    }
}
