import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement } from '@polymer/decorators';
import '@polymer/iron-iconset-svg/iron-iconset-svg';

import { default as template } from './template.html';

@customElement('iconset-mtg')
export class IconsetMtg extends PolymerElement {
  static get template() {
    // @ts-ignore
    return html([template]);
  }
}
