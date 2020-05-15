import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, query, property } from '@polymer/decorators';
import '@polymer/paper-styles/shadow';
import { CardData } from 'src/server/commanders';

import { default as template } from './template.html';

import './index.scss?name=preview-hover';

@customElement('preview-hover')
export class PreviewHover extends PolymerElement {
  @query('#content') private content_!: HTMLDivElement;

  @property() data?: CardData[];
  @property() identity = '';

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  show(e: MouseEvent) {
    this.content_.style.opacity = '1';

    const contentRect = this.content_.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    let previewX = e.x + 50;
    let previewY = e.y - contentRect.height / 2;

    if (previewX + contentRect.width + 8 > bodyRect.width) {
      previewX = e.x - contentRect.width - 50;
    }
    previewY = Math.max(8, previewY);
    previewY = Math.min(bodyRect.height - contentRect.height - 8, previewY);

    this.style.left = `${previewX}px`;
    this.style.top = `${previewY}px`;
  }

  hide() {
    this.content_.style.opacity = '';
  }
}
