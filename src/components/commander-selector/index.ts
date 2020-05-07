import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property, query } from '@polymer/decorators';
import { PaperDialogElement } from '@polymer/paper-dialog/paper-dialog';
import { PaperInputElement } from '@polymer/paper-input/paper-input';
import { DomRepeat } from '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/neon-animation/animations/scale-up-animation';
import '@polymer/neon-animation/animations/fade-out-animation';

import '@polymer/paper-dialog/paper-dialog';

import { CardData } from '../../server/commanders';

import { default as template } from './template.html';

import './index.scss?name=commander-selector';

interface DomRepeatMouseEvent extends MouseEvent {
  model: {
    item: any,
    index: number,
  };
}

interface DomRepeatCustomEvent extends CustomEvent {
  model: {
    item: any,
    index: number,
  };
}

@customElement('commander-selector')
export class CommanderSelector extends PolymerElement {
  @query('#dialog') private dialog_!: PaperDialogElement;
  @query('#filter') private filter_!: PaperInputElement;
  @query('#preview') private preview_!: HTMLDivElement;
  @query('#list') private list_!: DomRepeat;

  @property() commanders: CardData[] = [];
  @property() identity: string = '';

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  show() {
    this.dialog_.open();
    setTimeout(() => this.filter_.focus(), 0);
  }

  protected displayPreview_(e: DomRepeatMouseEvent) {
    const imgUrl = e.model.item.image.normal;
    this.preview_.style.backgroundImage = `url(${imgUrl})`;
  }

  protected handleOpenClose_() {
    if (this.dialog_.opened) {
      this.filter_.value = '';
      this.preview_.style.backgroundImage = '';
    }
  }

  protected filterCommanders_(card: CardData) {
    return card.name.toLowerCase()
        .includes((this.filter_.value || '').toLowerCase());
  }

  protected updateFilter_() {
    this.preview_.style.backgroundImage = '';
    this.list_.render();
  }

  protected selectCommander_(e: DomRepeatCustomEvent) {
    this.dispatchEvent(new CustomEvent('commander-selected', {
      detail: e.model.item,
      bubbles: true,
      composed: true,
    }));
    this.dialog_.close();
  }
}
