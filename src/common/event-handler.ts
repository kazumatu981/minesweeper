type EventAction<T> = (thisObject: T, ...args: any[]) => void;
type EventPredicate<T> = (thisObject: T, ...args: any[]) => boolean;

interface EventHandlerElement<T> {
    action: EventAction<T>;
    when?: EventPredicate<T>;
}
/**
 * イベントを管理する基底クラス。 本プロジェクトで活用する部品はこれを継承して作成すること。
 */
export class EventHandler<TEvents extends string> {
    readonly #events: Partial<Record<TEvents, EventHandlerElement<this>[]>> =
        {};

    //#region メソッド
    /**
     * イベントを登録する。 ローカル変数に eventHandler を登録しておくことで、
     * fire()が呼び出されるとそのメソッドが実行されるよう
     * に予約しておく。同じイベント名が指定されても、イベントは配列で格納されるため、上書きされることはない。
     * @param eventName - イベント名
     * @param eventHandler - イベントハンドラ
     * @param when - event発生条件
     */
    on(eventName: TEvents, element: EventHandlerElement<this>) {
        const handlers = this.#events[eventName];
        if (handlers === undefined) {
            // 見つからなかった場合: 新しい配列を作成して eventHandlerを追加する
            this.#events[eventName] = [element];
        } else {
            //見つかった場合: 配列に eventHandlerを追加する
            handlers.push(element);
        }
    }

    /**
     * イベントを実行する。
     * ローカル変数 eventHandler に登録されたイベントを参照して、
     * 存在すれば、そのイベント(関数)を実行する。
     * イベントは複数存在する場合は、先頭から順に実行する。
     * @param eventName イベント名
     * @param args イベントに渡す引数
     */
    emit(eventName: TEvents, ...args: any[]) {
        const handlerDefines = this.#events[eventName] ?? [];
        // 見つかった場合: 配列の各要素に対して eventHandlerを実行する
        for (const handlerDefine of handlerDefines) {
            if (handlerDefine.when) {
                if (handlerDefine.when(this, ...args)) {
                    handlerDefine.action(this, ...args);
                }
            } else {
                handlerDefine.action(this, ...args);
            }
        }
    }
    //#endregion
}
