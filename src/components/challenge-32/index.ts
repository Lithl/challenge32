import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, query } from '@polymer/decorators';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';

import { default as template } from './template.html';

import './index.scss?name=challenge-32';

@customElement('challenge-32')
export class Challenge32 extends PolymerElement {
  @query('#header') protected headerDiv_!: HTMLDivElement;
  @query('#content') protected contentDiv_!: HTMLDivElement;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();
    this.contentDiv_.style.height = `${window.innerHeight - this.headerDiv_.clientHeight - 32}px`;
  }
}
