/* eslint-disable max-statements */
import { UiComponentBase } from '../../../src/common/ui-component-base.js';

import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import {
    mockDocument,
    restoreDocument,
    type Mocker,
} from '../util/document_mock.js';

/**
 * UI コンポーネントの共通基底クラスをテストするための具象クラスです。
 */
class TestUiComponent extends UiComponentBase<'test'> {
    public readonly onRightClickMock = mock.fn();
    public readonly onLeftClickMock = mock.fn();

    public override onRightClick(): void {
        this.onRightClickMock();
    }

    protected override onLeftClick(): void {
        this.onLeftClickMock();
    }
}

void describe('UI 基底クラスの振る舞い', () => {
    let mocker: Mocker;

    before(() => {
        mocker = mockDocument();
    });

    after(() => {
        restoreDocument();
    });

    void it('初期設定に従って div 要素、id、クラスを生成する', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: ['first-class', 'second-class'],
        });

        assert.equal(component.element.tagName, 'DIV');
        assert.equal(component.element.id, 'test-component');
        assert.deepEqual(component.classes, ['first-class', 'second-class']);
    });

    void it('指定されたタグ名の要素を生成する', () => {
        const component = new TestUiComponent({
            tagName: 'button',
            id: 'test-button',
            classes: [],
        });

        assert.equal(component.element.tagName, 'BUTTON');
    });

    void it('element と id を取得できる', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        assert.equal(
            component.element instanceof mocker.dom.window.HTMLElement,
            true
        );
        assert.equal(component.id, 'test-component');
    });

    void it('text を設定すると、取得値と要素のテキストに反映する', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        assert.equal(component.text, '');

        component.text = 'Test text';

        assert.equal(component.text, 'Test text');
        assert.equal(component.element.textContent, 'Test text');
    });

    void it('初期設定した text を要素に反映する', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
            text: 'Initial text',
        });

        assert.equal(component.text, 'Initial text');
        assert.equal(component.element.textContent, 'Initial text');
    });

    void it('classes を設定すると、既存のクラスを置き換える', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: ['old-class'],
        });

        component.classes = ['new-class', 'another-class'];

        assert.deepEqual(component.classes, ['new-class', 'another-class']);
    });

    void it('要素をクリックすると、左クリック処理を呼び出す', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        mocker.dispatchMouseEvent(component.element, 'click');

        assert.equal(component.onLeftClickMock.mock.callCount(), 1);
        assert.equal(component.onRightClickMock.mock.callCount(), 0);
    });

    void it('要素を右クリックすると、右クリック処理を呼び出してコンテキストメニューを抑止する', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });
        const event = new mocker.dom.window.MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
        });

        const isNotCanceled = component.element.dispatchEvent(event);

        assert.equal(component.onRightClickMock.mock.callCount(), 1);
        assert.equal(component.onLeftClickMock.mock.callCount(), 0);
        assert.equal(isNotCanceled, false);
    });

    void it('無効化中はクリック処理を呼び出さず、再有効化後は呼び出す', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        assert.equal(component.enabled, true);

        component.enabled = false;
        mocker.dispatchMouseEvent(component.element, 'click');
        const event = new mocker.dom.window.MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
        });
        const isNotCanceled = component.element.dispatchEvent(event);

        assert.equal(component.enabled, false);
        assert.equal(component.onLeftClickMock.mock.callCount(), 0);
        assert.equal(component.onRightClickMock.mock.callCount(), 0);
        assert.equal(isNotCanceled, false);

        component.enabled = true;
        mocker.dispatchMouseEvent(component.element, 'click');
        mocker.dispatchMouseEvent(component.element, 'contextmenu');

        assert.equal(component.enabled, true);
        assert.equal(component.onLeftClickMock.mock.callCount(), 1);
        assert.equal(component.onRightClickMock.mock.callCount(), 1);
    });
});
