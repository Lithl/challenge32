import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { customElement, query, property } from '@polymer/decorators';
import '@polymer/iron-ajax';

import { CardData, ManaColor } from '../../server/commanders';
import { onlyUnique } from '../../util';

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

  protected listCCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, ''));
  }

  protected listWUCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WU') || this.isPartnerIn_(card, 'WU'));
  }

  protected listUBCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UB') || this.isPartnerIn_(card, 'UB'));
  }

  protected listBRCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BR') || this.isPartnerIn_(card, 'BR'));
  }

  protected listRGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RG') || this.isPartnerIn_(card, 'RG'));
  }

  protected listGWCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GW') || this.isPartnerIn_(card, 'GW'));
  }

  protected listGUCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GU') || this.isPartnerIn_(card, 'GU'));
  }

  protected listWBCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WB') || this.isPartnerIn_(card, 'WB'));
  }

  protected listURCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UR') || this.isPartnerIn_(card, 'UR'));
  }

  protected listBGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BG') || this.isPartnerIn_(card, 'BG'));
  }

  protected listRWCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RW') || this.isPartnerIn_(card, 'RW'));
  }

  protected listWRUCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WRU') || this.isPartnerIn_(card, 'WRU'));
  }

  protected listUGBCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UGB') || this.isPartnerIn_(card, 'UGB'));
  }

  protected listBWRCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BWR') || this.isPartnerIn_(card, 'BWR'));
  }

  protected listRUGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RUG') || this.isPartnerIn_(card, 'RUG'));
  }

  protected listGBWCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GBW') || this.isPartnerIn_(card, 'GBW'));
  }

  protected listGWUCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GWU') || this.isPartnerIn_(card, 'GWU'));
  }

  protected listWUBCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUB') || this.isPartnerIn_(card, 'WUB'));
  }

  protected listUBRCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UBR') || this.isPartnerIn_(card, 'UBR'));
  }

  protected listBRGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BRG') || this.isPartnerIn_(card, 'BRG'));
  }

  protected listRGWCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RGW') || this.isPartnerIn_(card, 'RGW'));
  }

  protected listUBRGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UBRG') || this.isPartnerIn_(card, 'UBRG'));
  }

  protected listWBRGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WBRG') || this.isPartnerIn_(card, 'WBRG'));
  }

  protected listWURGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WURG') || this.isPartnerIn_(card, 'WURG'));
  }

  protected listWUBGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBG') || this.isPartnerIn_(card, 'WUBG'));
  }

  protected listWUBRCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBR') || this.isPartnerIn_(card, 'WUBR'));
  }

  protected listWUBRGCommanders_() {
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBRG') || this.isPartnerIn_(card, 'WUBRG'));
  }

  protected listAllCommanders_() {
    this.listCommanders_(() => true);
  }

  private colorIdentityEquals_(card: CardData, identity: string) {
    if (card.colorIdentity.length !== identity.length) return false;
    for (const color of identity) {
      if (!card.colorIdentity.includes(color as ManaColor)) return false;
    }
    return true;
  }

  private isPartnerIn_(card: CardData, identity: string) {
    if (!card.partnerWith && !card.partnerWithAny) return false;

    for (const color of card.colorIdentity) {
      if (!identity.includes(color)) return false;
    }

    if (card.partnerWith) {
      // only return true if card+specific partner exactly matches identity
      const partner = this.commanders_.find((c: CardData) =>
          c.name === card.partnerWith);
      if (!partner) return false;
      const totalIdentity = [...card.colorIdentity, ...partner.colorIdentity]
          .filter(onlyUnique);
      for (const color of identity) {
        if (!totalIdentity.includes(color as ManaColor)) return false;
      }
      return true;
    } else {
      // only return true if card+another partnerWithAny can match identity
      const partners = this.commanders_.filter((c: CardData) =>
          c.partnerWithAny && c.name !== card.name);
      const compatible = [];
      for (const partner of partners) {
        const totalIdentity = [...card.colorIdentity, ...partner.colorIdentity]
            .filter(onlyUnique);
        let isCompatible = totalIdentity.length === identity.length;
        if (isCompatible) {
          for (const color of totalIdentity) {
            if (!identity.includes(color as ManaColor)) {
              isCompatible = false;
              break;
            }
          }
        }
        if (isCompatible) compatible.push(partner);
      }
      return compatible.length > 0;
    }
  }

  private listCommanders_(filter: (card: CardData) => boolean) {
    console.log(this.commanders_.filter(filter));
  }
}
