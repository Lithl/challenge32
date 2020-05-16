import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property } from '@polymer/decorators';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-styles/color';

import { default as template } from './template.html';

import './index.scss?name=icon-toggle-button';

@customElement('icon-toggle-button')
export class IconToggleButton extends PolymerElement {
  @property() checked = false;
  @property() icon = '';

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  protected checkedClass_(checked: boolean) {
    return checked ? 'checked' : 'unchecked';
  }

  protected toggleChecked_() {
    this.checked = !this.checked;
  }
}
