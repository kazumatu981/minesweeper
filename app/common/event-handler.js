import { __assertIsString, __assertIsFunction } from './assert.js';
/**
 * イベントを管理する基底クラス。 本プロジェクトで活用する部品はこれを継承して作成すること。
 */
export class EventHandler {
    constructor() {
        this._events = {};
    }

    //#region メソッド
    /**
     * イベントを登録する。 ローカル変数に eventHandler を登録しておくことで、
     * fire()が呼び出されるとそのメソッドが実行されるよう
     * に予約しておく。同じイベント名が指定されても、イベントは配列で格納されるため、上書きされることはない。
     * @param {string} eventName - イベント名
     * @param {function} eventHandler - イベントハンドラ
     */
    on(eventName, eventHandler) {
        __assertIsString(eventName);
        __assertIsFunction(eventHandler);

        const handlers = this._events[eventName];
        if (handlers === undefined) {
            // 見つからなかった場合: 新しい配列を作成して eventHandlerを追加する
            this._events[eventName] = [eventHandler];
        } else {
            //見つかった場合: 配列に eventHandlerを追加する
            handlers.push(eventHandler);
        }
    }

    /**
     * イベントを実行する。
     * ローカル変数 eventHandler に登録されたイベントを参照して、
     * 存在すれば、そのイベント(関数)を実行する。
     * イベントは複数存在する場合は、先頭から順に実行する。
     * @param {string} eventName イベント名
     * @param  {...any} args イベントに渡す引数
     */
    fire(eventName, ...args) {
        __assertIsString(eventName);

        const handlers = this._events[eventName];
        if (handlers === undefined) {
            // 見つからなかった場合: 何もしない
            return;
        }
        // 見つかった場合: 配列の各要素に対して eventHandlerを実行する
        for (const handler of handlers) {
            handler(this, ...args);
        }
    }
    //#endregion
}
