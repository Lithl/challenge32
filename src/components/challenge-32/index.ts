import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { customElement, query, property } from '@polymer/decorators';
import { CommanderSelector } from '../commander-selector';
import { PreviewHover } from'../preview-hover';
import '@polymer/iron-ajax/iron-ajax';

import { CardData, ManaColor } from '../../server/commanders';
import { intersection, onlyUnique } from '../../util';

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
  golgari: { name: 'Golgari', colors: ['B', 'G'] },
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
const allColorDescriptors = Object.keys(identities) as ColorDescriptor[];

interface DiagramModel extends Record<ColorDescriptor, [CardData]> {}

const timeoutTask = timeOut.after(100);

@customElement('challenge-32')
export class Challenge32 extends GestureEventListeners(PolymerElement) {
  [x: string]: any;

  @query('#content') private content_!: HTMLDivElement;
  @query('#selector') private selector_!: CommanderSelector;
  @query('preview-hover') private preview_!: PreviewHover;

  @property() protected commanders_: CardData[] = [];
  @property() protected diagram_: Partial<DiagramModel> = {};

  private selectedId_?: ColorDescriptor;
  private mousemoveDebouncer_: Debouncer | null = null;

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

  protected handlePreviewHover_(e: MouseEvent, _: any, nextSibling?: HTMLElement) {
    const path = e.composedPath();
    const deck = nextSibling || path.find((el) =>
        (el as HTMLElement).classList.contains('deck')) as HTMLElement;

    if (deck) {
      const identity = intersection(allColorDescriptors, [...deck.classList]);
      if (identity.length) {
        const data = this.diagram_[identity[0] as ColorDescriptor];
        this.preview_.data = data;
        const idData = identities[identity[0] as ColorDescriptor];
        const symbols = idData.colors.length ? idData.colors.join('') : 'C';
        this.preview_.identity = `${idData.name} (${symbols})`;

        this.preview_.show(e);
      }
    }
  }

  protected handlePreviewHoverHelper_(e: MouseEvent) {
    const img = e.composedPath().find((el) =>
        (el as HTMLElement).classList.contains('mana-symbol')) as HTMLElement;
    this.handlePreviewHover_(e, undefined, img.nextElementSibling as HTMLElement);
  }

  protected handlePreviewUnhover_() {
    this.mousemoveDebouncer_ = Debouncer.debounce(this.mousemoveDebouncer_, timeoutTask, () => {
      this.preview_.hide();
    });
  }

  protected colorIdentityEquals_(card: CardData, identity: string) {
    if (card.colorIdentity.length !== identity.length) return false;
    for (const color of identity) {
      if (!card.colorIdentity.includes(color as ManaColor)) return false;
    }
    return true;
  }

  protected isPartnerIn_(card: CardData, identity: string) {
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

  protected listCommanders_(filter?: (card: CardData) => boolean) {
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

allColorDescriptors.forEach((k) => {
  const id = identities[k];
  const colorsStr = id.colors.join('');
  const fnNameColors = colorsStr || 'C';
  const fnCode = `list${fnNameColors}Commanders_() {
  this.selectedId_ = '${k}';
  this.listCommanders_((card) =>
      this.colorIdentityEquals_(card, '${colorsStr}') || this.isPartnerIn_(card, '${colorsStr}'));
}`;

  const fn = (new Function(`return function ${fnCode}`))();
  Challenge32.prototype[`list${fnNameColors}Commanders_`] = fn;
});
