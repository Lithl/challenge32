import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { customElement, query, property } from '@polymer/decorators';
import { CommanderSelector } from '../commander-selector';
import '@polymer/iron-ajax/iron-ajax';

import { CardData, ManaColor } from '../../server/commanders';
import { onlyUnique } from '../../util';

import { default as template } from './template.html';

import './index.scss?name=challenge-32';

export type ColorDescriptor = 'colorless' | 'monoWhite' | 'monoBlue' |
    'monoBlack' | 'monoRed' | 'monoGreen' | 'azorius' | 'dimir' | 'rakdos' |
    'gruul' | 'selesnya' | 'simic' | 'orzhov' | 'izzet' | 'golgari' | 'boros' |
    'jeskai' | 'sultai' | 'mardu' | 'temur' | 'abzan' | 'bant' | 'esper' |
    'grixis' | 'jund' | 'naya' | 'whiteless' | 'blueless' | 'blackless' |
    'redless' | 'greenless' | 'pentacolor';
const identities: Record<ColorDescriptor, {name: string, colors: ManaColor[]}> = {
  colorless: { name: 'Colorless', colors: [] },
  monoWhite: { name: 'Mono-white', colors: ['W'] },
  monoBlue: { name: 'Mono-blue', colors: ['U'] },
  monoBlack: { name: 'Mono-black', colors: ['B'] },
  monoRed: { name: 'Mono-red', colors: ['R'] },
  monoGreen: { name: 'Mono-green', colors: ['G'] },

  azorius: { name: 'Azorius', colors: ['W', 'U'] },
  dimir: { name: 'Dimir', colors: ['U', 'B'] },
  rakdos: { name: 'Rakdos', colors: ['B', 'R'] },
  gruul: { name: 'Gruul', colors: ['R', 'G'] },
  selesnya: { name: 'Selesnya', colors: ['W', 'G'] },

  simic: { name: 'Simic', colors: ['U', 'G'] },
  orzhov: { name: 'Orzhov', colors: ['W', 'B'] },
  izzet: { name: 'Izzet', colors: ['U', 'R'] },
  golgari: { name: 'Golgari', colors: ['B'] },
  boros: { name: 'Boros', colors: ['W', 'R'] },

  jeskai: { name: 'Jeskai', colors: ['W', 'U', 'R'] },
  sultai: { name: 'Sultai', colors: ['U', 'B', 'G'] },
  mardu: { name: 'Mardu', colors: ['W', 'B', 'R'] },
  temur: { name: 'Temur', colors: ['U', 'R', 'G'] },
  abzan: { name: 'Abzan', colors: ['W', 'B', 'G'] },

  bant: { name: 'Bant', colors: ['W', 'U', 'G'] },
  esper: { name: 'Esper', colors: ['W', 'U', 'B'] },
  grixis: { name: 'Grixis', colors: ['U', 'B', 'R'] },
  jund: { name: 'Jund', colors: ['B', 'R', 'G'] },
  naya: { name: 'Naya', colors: ['W', 'R', 'G'] },

  whiteless: { name: 'Whiteless', colors: ['U', 'B', 'R', 'G'] },
  blueless: { name: 'Blueless', colors: ['W', 'B', 'R', 'G'] },
  blackless: { name: 'Blackless', colors: ['W', 'U', 'R', 'G'] },
  redless: { name: 'Redless', colors: ['W', 'U', 'B', 'G'] },
  greenless: { name: 'Greenless', colors: ['W', 'U', 'B', 'R'] },
  pentacolor: { name: 'Pentacolor', colors: ['W', 'U', 'B', 'R', 'G'] },
};
const allColorDescriptors = Object.keys(identities);

interface DiagramModel extends Record<ColorDescriptor, [CardData]> {}

@customElement('challenge-32')
export class Challenge32 extends GestureEventListeners(PolymerElement) {
  @query('#content') private content_!: HTMLDivElement;
  @query('#selector') private selector_!: CommanderSelector;

  @property() protected commanders_: CardData[] = [];
  @property() protected diagram_: Partial<DiagramModel> = {};

  private selectedId_?: ColorDescriptor;

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

  protected getCommanders_(e: CustomEvent) {
    this.commanders_ = e.detail.response.commanders;
  }

  protected listWCommanders_() {
    this.selectedId_ = 'monoWhite';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'W'));
  }

  protected listUCommanders_() {
    this.selectedId_ = 'monoBlue';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'U'));
  }

  protected listBCommanders_() {
    this.selectedId_ = 'monoBlack';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'B'));
  }

  protected listRCommanders_() {
    this.selectedId_ = 'monoRed';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'R'));
  }

  protected listGCommanders_() {
    this.selectedId_ = 'monoGreen';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'G'));
  }

  protected listCCommanders_() {
    this.selectedId_ = 'colorless';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, ''));
  }

  protected listWUCommanders_() {
    this.selectedId_ = 'azorius';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WU') || this.isPartnerIn_(card, 'WU'));
  }

  protected listUBCommanders_() {
    this.selectedId_ = 'dimir';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UB') || this.isPartnerIn_(card, 'UB'));
  }

  protected listBRCommanders_() {
    this.selectedId_ = 'rakdos';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BR') || this.isPartnerIn_(card, 'BR'));
  }

  protected listRGCommanders_() {
    this.selectedId_ = 'gruul';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RG') || this.isPartnerIn_(card, 'RG'));
  }

  protected listGWCommanders_() {
    this.selectedId_ = 'selesnya';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GW') || this.isPartnerIn_(card, 'GW'));
  }

  protected listGUCommanders_() {
    this.selectedId_ = 'simic';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GU') || this.isPartnerIn_(card, 'GU'));
  }

  protected listWBCommanders_() {
    this.selectedId_ = 'orzhov';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WB') || this.isPartnerIn_(card, 'WB'));
  }

  protected listURCommanders_() {
    this.selectedId_ = 'izzet';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UR') || this.isPartnerIn_(card, 'UR'));
  }

  protected listBGCommanders_() {
    this.selectedId_ = 'golgari';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BG') || this.isPartnerIn_(card, 'BG'));
  }

  protected listRWCommanders_() {
    this.selectedId_ = 'boros';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RW') || this.isPartnerIn_(card, 'RW'));
  }

  protected listWRUCommanders_() {
    this.selectedId_ = 'jeskai';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WRU') || this.isPartnerIn_(card, 'WRU'));
  }

  protected listUGBCommanders_() {
    this.selectedId_ = 'sultai';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UGB') || this.isPartnerIn_(card, 'UGB'));
  }

  protected listBWRCommanders_() {
    this.selectedId_ = 'mardu';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BWR') || this.isPartnerIn_(card, 'BWR'));
  }

  protected listRUGCommanders_() {
    this.selectedId_ = 'temur';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RUG') || this.isPartnerIn_(card, 'RUG'));
  }

  protected listGBWCommanders_() {
    this.selectedId_ = 'abzan';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GBW') || this.isPartnerIn_(card, 'GBW'));
  }

  protected listGWUCommanders_() {
    this.selectedId_ = 'bant';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'GWU') || this.isPartnerIn_(card, 'GWU'));
  }

  protected listWUBCommanders_() {
    this.selectedId_ = 'esper';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUB') || this.isPartnerIn_(card, 'WUB'));
  }

  protected listUBRCommanders_() {
    this.selectedId_ = 'grixis';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UBR') || this.isPartnerIn_(card, 'UBR'));
  }

  protected listBRGCommanders_() {
    this.selectedId_ = 'jund';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'BRG') || this.isPartnerIn_(card, 'BRG'));
  }

  protected listRGWCommanders_() {
    this.selectedId_ = 'naya';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'RGW') || this.isPartnerIn_(card, 'RGW'));
  }

  protected listUBRGCommanders_() {
    this.selectedId_ = 'whiteless';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'UBRG') || this.isPartnerIn_(card, 'UBRG'));
  }

  protected listWBRGCommanders_() {
    this.selectedId_ = 'blueless';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WBRG') || this.isPartnerIn_(card, 'WBRG'));
  }

  protected listWURGCommanders_() {
    this.selectedId_ = 'blackless';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WURG') || this.isPartnerIn_(card, 'WURG'));
  }

  protected listWUBGCommanders_() {
    this.selectedId_ = 'redless';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBG') || this.isPartnerIn_(card, 'WUBG'));
  }

  protected listWUBRCommanders_() {
    this.selectedId_ = 'greenless';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBR') || this.isPartnerIn_(card, 'WUBR'));
  }

  protected listWUBRGCommanders_() {
    this.selectedId_ = 'pentacolor';
    this.listCommanders_((card: CardData) =>
        this.colorIdentityEquals_(card, 'WUBRG') || this.isPartnerIn_(card, 'WUBRG'));
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

  private listCommanders_(filter?: (card: CardData) => boolean) {
    if (filter) {
      this.selector_.commanders = this.commanders_.filter(filter);
    } else {
      this.selector_.commanders = this.commanders_;
    }
    this.selector_.identity = identities[this.selectedId_!].name;
    this.selector_.show();
  }

  protected handleCommanderSelected_(e: CustomEvent) {
    if (this.selectedId_) {
      this.set(`diagram_.${this.selectedId_}`, e.detail);
    }
  }

  protected isVisible_(card?: CardData) {
    return !!card ? 'visible' : 'hidden';
  }

  protected isBackground_(card?: CardData) {
    return !!card ? 'background' : '';
  }
}
