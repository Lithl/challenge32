import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { customElement, query, property } from '@polymer/decorators';
import '@polymer/iron-ajax';
import { CommanderSelector } from '../commander-selector';

import { CardData, ManaColor } from '../../server/commanders';
import { onlyUnique } from '../../util';

import { default as template } from './template.html';

import './index.scss?name=challenge-32';

@customElement('challenge-32')
export class Challenge32 extends GestureEventListeners(PolymerElement) {
  @query('#content') private content_!: HTMLDivElement;
  @query('#selector') private selector_!: CommanderSelector;

  @property() protected commanders_: CardData[] = [];

  private selectedId_?: HTMLElement;

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
      this.content_.classList.toggle('landscape', true);
      this.content_.classList.toggle('portrait', false);
    } else {
      this.content_.classList.toggle('landscape', false);
      this.content_.classList.toggle('portrait', true);
    }
  }

  private getDeckInPath_(path: any[]) {
    return path.find((item: any) =>
        item.classList && item.classList.contains('deck'));
  }

  protected getCommanders_(e: CustomEvent) {
    this.commanders_ = e.detail.response.commanders;
  }

  protected listWCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('mono-white', (card: CardData) =>
        this.colorIdentityEquals_(card, 'W'));
  }

  protected listUCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('mono-blue', (card: CardData) =>
        this.colorIdentityEquals_(card, 'U'));
  }

  protected listBCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('mono-black', (card: CardData) =>
        this.colorIdentityEquals_(card, 'B'));
  }

  protected listRCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('mono-red', (card: CardData) =>
        this.colorIdentityEquals_(card, 'R'));
  }

  protected listGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('mono-green', (card: CardData) =>
        this.colorIdentityEquals_(card, 'G'));
  }

  protected listCCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('colorless', (card: CardData) =>
        this.colorIdentityEquals_(card, ''));
  }

  protected listWUCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Azorius', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WU') || this.isPartnerIn_(card, 'WU'));
  }

  protected listUBCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Dimir', (card: CardData) =>
        this.colorIdentityEquals_(card, 'UB') || this.isPartnerIn_(card, 'UB'));
  }

  protected listBRCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Rakdos', (card: CardData) =>
        this.colorIdentityEquals_(card, 'BR') || this.isPartnerIn_(card, 'BR'));
  }

  protected listRGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Gruul', (card: CardData) =>
        this.colorIdentityEquals_(card, 'RG') || this.isPartnerIn_(card, 'RG'));
  }

  protected listGWCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Selesnya', (card: CardData) =>
        this.colorIdentityEquals_(card, 'GW') || this.isPartnerIn_(card, 'GW'));
  }

  protected listGUCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Simic', (card: CardData) =>
        this.colorIdentityEquals_(card, 'GU') || this.isPartnerIn_(card, 'GU'));
  }

  protected listWBCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Orzhov', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WB') || this.isPartnerIn_(card, 'WB'));
  }

  protected listURCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Izzet', (card: CardData) =>
        this.colorIdentityEquals_(card, 'UR') || this.isPartnerIn_(card, 'UR'));
  }

  protected listBGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Golgari', (card: CardData) =>
        this.colorIdentityEquals_(card, 'BG') || this.isPartnerIn_(card, 'BG'));
  }

  protected listRWCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Boros', (card: CardData) =>
        this.colorIdentityEquals_(card, 'RW') || this.isPartnerIn_(card, 'RW'));
  }

  protected listWRUCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Jeskai', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WRU') || this.isPartnerIn_(card, 'WRU'));
  }

  protected listUGBCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Sultai', (card: CardData) =>
        this.colorIdentityEquals_(card, 'UGB') || this.isPartnerIn_(card, 'UGB'));
  }

  protected listBWRCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Mardu', (card: CardData) =>
        this.colorIdentityEquals_(card, 'BWR') || this.isPartnerIn_(card, 'BWR'));
  }

  protected listRUGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Temur', (card: CardData) =>
        this.colorIdentityEquals_(card, 'RUG') || this.isPartnerIn_(card, 'RUG'));
  }

  protected listGBWCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Abzan', (card: CardData) =>
        this.colorIdentityEquals_(card, 'GBW') || this.isPartnerIn_(card, 'GBW'));
  }

  protected listGWUCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Bant', (card: CardData) =>
        this.colorIdentityEquals_(card, 'GWU') || this.isPartnerIn_(card, 'GWU'));
  }

  protected listWUBCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Esper', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WUB') || this.isPartnerIn_(card, 'WUB'));
  }

  protected listUBRCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Grixis', (card: CardData) =>
        this.colorIdentityEquals_(card, 'UBR') || this.isPartnerIn_(card, 'UBR'));
  }

  protected listBRGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Jund', (card: CardData) =>
        this.colorIdentityEquals_(card, 'BRG') || this.isPartnerIn_(card, 'BRG'));
  }

  protected listRGWCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('Naya', (card: CardData) =>
        this.colorIdentityEquals_(card, 'RGW') || this.isPartnerIn_(card, 'RGW'));
  }

  protected listUBRGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('whiteless', (card: CardData) =>
        this.colorIdentityEquals_(card, 'UBRG') || this.isPartnerIn_(card, 'UBRG'));
  }

  protected listWBRGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('blueless', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WBRG') || this.isPartnerIn_(card, 'WBRG'));
  }

  protected listWURGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('blackless', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WURG') || this.isPartnerIn_(card, 'WURG'));
  }

  protected listWUBGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('redless', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBG') || this.isPartnerIn_(card, 'WUBG'));
  }

  protected listWUBRCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('greenless', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBR') || this.isPartnerIn_(card, 'WUBR'));
  }

  protected listWUBRGCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('pentacolor', (card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBRG') || this.isPartnerIn_(card, 'WUBRG'));
  }

  protected listAllCommanders_(e: Event) {
    this.selectedId_ = this.getDeckInPath_(e.composedPath());
    this.listCommanders_('any', () => true);
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

  private listCommanders_(id: string, filter: (card: CardData) => boolean) {
    this.selector_.commanders = this.commanders_.filter(filter);
    this.selector_.identity = id;
    this.selector_.show();
  }

  protected handleCommanderSelected_(e: CustomEvent) {
    if (this.selectedId_) {
      const border = this.selectedId_.querySelector('.border') as HTMLElement;
      if (border) {
        border.style.visibility = 'visible';
      }
      const img = this.selectedId_.querySelector('.image') as HTMLElement;
      if (img) {
        img.style.backgroundImage = `url(${e.detail.image.art})`;
      }
    }
  }
}
