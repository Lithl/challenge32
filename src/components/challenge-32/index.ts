import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { customElement, query, property } from '@polymer/decorators';
import '@polymer/iron-ajax';

import { CardData, ManaColor } from '../../server/commanders';

import { default as template } from './template.html';

import './index.scss?name=challenge-32';

@customElement('challenge-32')
export class Challenge32 extends GestureEventListeners(PolymerElement) {
  @query('#content') protected content!: HTMLDivElement;

  @property() protected commanders_: CardData[] = [];

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  ready() {
    super.ready();

    this.orient_();
  }

  private orient_() {
    const bodyRect = document.body.getBoundingClientRect();
    const width = bodyRect.width;
    const height = bodyRect.height;
    if (width > height) {
      this.content.classList.toggle('landscape', true);
      this.content.classList.toggle('portrait', false);
    } else {
      this.content.classList.toggle('landscape', false);
      this.content.classList.toggle('portrait', true);
    }
  }

  protected getCommanders_(e: CustomEvent) {
    this.commanders_ = e.detail.response.commanders;
  }

  protected listWCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'W'));
  }

  protected listUCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'U'));
  }

  protected listBCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'B'));
  }

  protected listRCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'R'));
  }

  protected listGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'G'));
  }

  private colorIdentityEquals_(card: CardData, identity: string) {
    if (card.colorIdentity.length !== identity.length) return false;
    for (const color of identity) {
      if (!card.colorIdentity.includes(color as ManaColor)) return false;
    }
    return true;
  }

  private listCommanders_(filter: (card: CardData) => boolean) {
    console.log(this.commanders_.filter(filter));
  }
}
