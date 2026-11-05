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
    readonly onRightClickMock = mock.fn();
    readonly onLeftClickMock = mock.fn();

    override onRightClick(): void {
        this.onRightClickMock();
    }

    override onLeftClick(): void {
        this.onLeftClickMock();
    }
}

void describe('UiComponentBase', () => {
    let mocker: Mocker;

    before(() => {
        mocker = mockDocument();
    });

    after(() => {
        restoreDocument();
    });

    void it('creates a div with the configured id and classes by default', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: ['first-class', 'second-class'],
        });

        assert.equal(component.element.tagName, 'DIV');
        assert.equal(component.element.id, 'test-component');
        assert.deepEqual(component.classes, ['first-class', 'second-class']);
    });

    void it('creates an element with the configured tag name', () => {
        const component = new TestUiComponent({
            tagName: 'button',
            id: 'test-button',
            classes: [],
        });

        assert.equal(component.element.tagName, 'BUTTON');
    });

    void it('exposes its element and id', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        assert.equal(component.element instanceof mocker.dom.window.HTMLElement, true);
        assert.equal(component.id, 'test-component');
    });

    void it('gets and sets its text', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        assert.equal(component.text, '');

        component.text = 'Test text';

        assert.equal(component.text, 'Test text');
        assert.equal(component.element.textContent, 'Test text');
    });

    void it('sets the initial text when configured', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
            text: 'Initial text',
        });

        assert.equal(component.text, 'Initial text');
        assert.equal(component.element.textContent, 'Initial text');
    });

    void it('replaces its classes when setting classes', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: ['old-class'],
        });

        component.classes = ['new-class', 'another-class'];

        assert.deepEqual(component.classes, ['new-class', 'another-class']);
    });

    void it('calls onLeftClick when the element is clicked', () => {
        const component = new TestUiComponent({
            id: 'test-component',
            classes: [],
        });

        mocker.dispatchMouseEvent(component.element, 'click');

        assert.equal(component.onLeftClickMock.mock.callCount(), 1);
        assert.equal(component.onRightClickMock.mock.callCount(), 0);
    });

    void it('calls onRightClick and prevents the context menu', () => {
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
});
