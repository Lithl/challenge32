import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property } from '@polymer/decorators';
import { IconToggleButton } from '../icon-toggle-button';

import { default as template } from './template.html';

import './index.scss?name=toggle-button-group';

@customElement('toggle-button-group')
export class ToggleButtonGroup extends PolymerElement {
  @property() attrForValue = '';
  @property({ type: String, observer: 'valueChanged_' }) value = '';

  private valueArr_: string[] = [];
  private freezeValueChanged_ = false;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();

    this.updateSelected();

    [...this.children].forEach((child) => {
      if (child instanceof IconToggleButton) {
        child.addEventListener('button-state-changed', () => this.buttonStateChanged_());
      }
    });
  }

  updateSelected() {
    if (!this.valueArr_.length) return; // user is not setting vals

    const attr = this.attrForValue || 'value';
    [...this.children].forEach((child) => {
      const val = child.getAttribute(attr) || child.textContent;
      const checked = val !== null && this.valueArr_.includes(val);
      if (child instanceof IconToggleButton) {
        child.checked = checked;
      } else {
        child.setAttribute('checked', checked ? 'checked' : '');
      }
    });
  }

  private buttonStateChanged_() {
    this.freezeValueChanged_ = true;
    this.value = [...this.children].map((child) => {
      const attr = this.attrForValue || 'value';
      const val = child.getAttribute(attr) || child.textContent;
      if (child instanceof IconToggleButton) {
        return (child as IconToggleButton).checked ? val : '';
      } else {
        const checkedAttr = child.getAttribute('checked');
        const checked = checkedAttr === 'checked' || checkedAttr === 'true';
        return checked ? val : '';
      }
    }).join('');
    this.valueChanged_(null, null, true);
    this.freezeValueChanged_ = false;
  }

  private valueChanged_(_: any, _2: any, force = false) {
    if (this.freezeValueChanged_ && !force) return;

    let tmpVal: string[];
    if (this.value.includes(',')) {
      // 'a, b' => ['a', 'b']
      tmpVal = this.value.split(/(?:\s*)?,(?:\s*)?/);
    } else if (/\s+/.test(this.value)) {
      // 'a b' => ['a', 'b']
      tmpVal = this.value.split(/\s+/);
    } else {
      // 'ab' => ['a', 'b']
      tmpVal = this.value.split('');
    }

    this.dispatchEvent(new CustomEvent('group-value-changed', {
      detail: {
        group: this,
        previous: JSON.parse(JSON.stringify(this.valueArr_)),
        current: JSON.parse(JSON.stringify(tmpVal)),
      },
      bubbles: true,
      composed: true,
    }));
    this.valueArr_ = tmpVal;
    this.updateSelected();
  }
}
