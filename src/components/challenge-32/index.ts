import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { customElement, query, property } from '@polymer/decorators';
import { CommanderSelector } from '../commander-selector';
import { PreviewHover } from'../preview-hover';
import { AppDrawerElement } from '@polymer/app-layout/app-drawer/app-drawer';
import { PaperIconButtonElement } from '@polymer/paper-icon-button/paper-icon-button';
import { ImageAdjuster, ImageShape } from '../image-adjuster';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-button/paper-button';
import '../icon-toggle-button';
import '../iconset-mtg';
import '../toggle-button-group';
import '../image-adjuster';

import { CardData, ManaColor } from '../../server/commanders';
import { intersection, onlyUnique } from '../../util';
import { DomRepeatCustomEvent } from '../commander-selector';

import { default as template } from './template.html';

import './index.scss?name=challenge-32';

export type ColorDescriptor = 'colorless' | 'monoWhite' | 'monoBlue' |
    'monoBlack' | 'monoRed' | 'monoGreen' | 'azorius' | 'dimir' | 'rakdos' |
    'gruul' | 'selesnya' | 'simic' | 'orzhov' | 'izzet' | 'golgari' | 'boros' |
    'jeskai' | 'sultai' | 'mardu' | 'temur' | 'abzan' | 'bant' | 'esper' |
    'grixis' | 'jund' | 'naya' | 'whiteless' | 'blueless' | 'blackless' |
    'redless' | 'greenless' | 'pentacolor';
interface Identity {
  name: string;
  type?: string;
  colors: ManaColor[];
}
const identities: Record<ColorDescriptor, Identity> = {
  colorless: { name: 'Colorless', colors: [] },
  monoWhite: { name: 'Mono-white', type: 'white-mana', colors: ['W'] },
  monoBlue: { name: 'Mono-blue', type: 'blue-mana', colors: ['U'] },
  monoBlack: { name: 'Mono-black', type: 'black-mana', colors: ['B'] },
  monoRed: { name: 'Mono-red', type: 'red-mana', colors: ['R'] },
  monoGreen: { name: 'Mono-green', type: 'green-mana', colors: ['G'] },

  azorius: { name: 'Azorius', type: 'ally', colors: ['W', 'U'] },
  dimir: { name: 'Dimir', type: 'ally', colors: ['U', 'B'] },
  rakdos: { name: 'Rakdos', type: 'ally', colors: ['B', 'R'] },
  gruul: { name: 'Gruul', type: 'ally', colors: ['R', 'G'] },
  selesnya: { name: 'Selesnya', type: 'ally', colors: ['W', 'G'] },

  simic: { name: 'Simic', type: 'enemy', colors: ['U', 'G'] },
  orzhov: { name: 'Orzhov', type: 'enemy', colors: ['W', 'B'] },
  izzet: { name: 'Izzet', type: 'enemy', colors: ['U', 'R'] },
  golgari: { name: 'Golgari', type: 'enemy', colors: ['B', 'G'] },
  boros: { name: 'Boros', type: 'enemy', colors: ['W', 'R'] },

  jeskai: { name: 'Jeskai', type: 'wedge', colors: ['W', 'U', 'R'] },
  sultai: { name: 'Sultai', type: 'wedge', colors: ['U', 'B', 'G'] },
  mardu: { name: 'Mardu', type: 'wedge', colors: ['W', 'B', 'R'] },
  temur: { name: 'Temur', type: 'wedge', colors: ['U', 'R', 'G'] },
  abzan: { name: 'Abzan', type: 'wedge', colors: ['W', 'B', 'G'] },

  bant: { name: 'Bant', type: 'shard', colors: ['W', 'U', 'G'] },
  esper: { name: 'Esper', type: 'shard', colors: ['W', 'U', 'B'] },
  grixis: { name: 'Grixis', type: 'shard', colors: ['U', 'B', 'R'] },
  jund: { name: 'Jund', type: 'shard', colors: ['B', 'R', 'G'] },
  naya: { name: 'Naya', type: 'shard', colors: ['W', 'R', 'G'] },

  whiteless: {
    name: 'Whiteless',
    type: 'four-color',
    colors: ['U', 'B', 'R', 'G'],
  },
  blueless: {
    name: 'Blueless',
    type: 'four-color',
    colors: ['W', 'B', 'R', 'G'],
  },
  blackless: {
    name: 'Blackless',
    type: 'four-color',
    colors: ['W', 'U', 'R', 'G'],
  },
  redless: {
    name: 'Redless',
    type: 'four-color',
    colors: ['W', 'U', 'B', 'G'],
  },
  greenless: {
    name: 'Greenless',
    type: 'four-color',
    colors: ['W', 'U', 'B', 'R'],
  },
  pentacolor: {
    name: 'Pentacolor',
    type: '',
    colors: ['W', 'U', 'B', 'R', 'G'],
  },
};
const allColorDescriptors = Object.keys(identities) as ColorDescriptor[];

interface DiagramModel extends Record<ColorDescriptor, CardData[]> {}

const timeoutTask = timeOut.after(100);

interface ShapeData {
  name: string;
  type: string;
  id: string;
  readonly data: () => CardData[] | undefined;
}

@customElement('challenge-32')
export class Challenge32 extends GestureEventListeners(PolymerElement) {
  [x: string]: any;

  @query('#content') private content_!: HTMLDivElement;
  @query('#selector') private selector_!: CommanderSelector;
  @query('preview-hover') private preview_!: PreviewHover;
  @query('#menu') private menu_!: AppDrawerElement;
  @query('#menuButton') private menuButton_!: PaperIconButtonElement;
  @query('#adjuster') private adjuster_!: ImageAdjuster;

  @property() protected commanders_: CardData[] = [];
  @property() protected diagram_: Partial<DiagramModel> = {};
  @property() protected readonly generatorData_: ShapeData[];
  @property() protected editId_ = 'C';

  private selectedId_?: ColorDescriptor;
  private mousemoveDebouncer_: Debouncer | null = null;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  constructor() {
    super();

    const self = this;
    const dataArr: ShapeData[] = [];
    Object.entries(identities).forEach((id) => {
      dataArr.push({
        name: id[0],
        type: id[1].type!,
        id: id[1].colors.join('').toLowerCase(),
        get data() {
          return () => self.diagram_[id[0] as ColorDescriptor];
        },
      });
    });
    this.generatorData_ = dataArr;
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

  protected handleImageAdjust_(e: DomRepeatCustomEvent) {
    const card = e.model.item as CardData;
    const isFull = this.colorIdentityEquals_(card, this.editId_);
    const isLeft = !isFull && e.model.index === 0;

    this.adjuster_.isFull = isFull;
    this.adjuster_.isLeft = isLeft;

    switch (this.editId_) {
      case 'C':
        this.adjuster_.shape = ImageShape.CIRCLE;
        break;
      case 'W':
      case 'U':
      case 'B':
      case 'R':
      case 'G':
      case 'UBRG':
      case 'WBRG':
      case 'WURG':
      case 'WUBG':
      case 'WUBR':
        this.adjuster_.shape = ImageShape.PETAL;
        break;
      case 'WU':
      case 'WG':
      case 'UBG':
      case 'WBR':
      case 'URG':
        this.adjuster_.shape = ImageShape.OBTUSE_TRIANGLE;
        break;
      case 'UB':
      case 'BR':
      case 'RG':
      case 'WUR':
      case 'WBG':
        this.adjuster_.shape = ImageShape.INVERTED_OBTUSE_TRIANGLE;
        break;
      case 'WUG':
      case 'WUB':
      case 'WRG':
        this.adjuster_.shape = ImageShape.ACUTE_TRIANGLE;
        break;
      case 'UBR':
      case 'BRG':
        this.adjuster_.shape = ImageShape.INVERTED_ACUTE_TRIANGLE;
        break;
      case 'UG':
      case 'WB':
      case 'WR':
        this.adjuster_.shape = ImageShape.TRAPEZOID;
        break;
      case 'UR':
      case 'BG':
        this.adjuster_.shape = ImageShape.INVERTED_TRAPEZOID;
        break;
      case 'WUBRG':
        this.adjuster_.shape = ImageShape.PENTAGON;
        break;
      default:
        throw new TypeError('invalid identity type string');
    }
    this.adjuster_.show();
  }

  protected hasCommanderFor_(id: string) {
    return !!this.commanderFor_(id);
  }

  protected commanderFor_(id: string) {
    const identity = this.filterIdentities_(id);
    return this.diagram_[identity[0] as ColorDescriptor];
  }

  protected identityToName_(id: string) {
    return this.filterIdentities_(id)[1].name;
  }

  private filterIdentities_(id: string) {
    let idArr: ManaColor[] = [];
    if (id !== 'C') {
      idArr = id.split('') as ManaColor[];
    }
    return Object.entries(identities).find((val) => {
      if (val[1].colors.length !== idArr.length) return false;
      for (const color of val[1].colors) {
        if (!idArr.includes(color)) return false;
      }
      return true;
    })! as [ColorDescriptor, Identity];
  }

  protected handleEditIdChanged_(e: CustomEvent) {
    const prev: string[] = e.detail.previous;
    const curr: string[] = e.detail.current;

    if (prev.includes('C') && curr.length > 1) {
      // went from colorless to colored, deselect C
      setTimeout(() =>
          this.editId_ = curr.filter((v: string) => v !== 'C').join(''), 0);
    } else if (curr.includes('C')) {
      // went from colored to colorless, set to only C
      setTimeout(() => this.editId_ = 'C');
    } else if (prev.includes('C') && curr.length === 0) {
      // went from colorless to nothing, use 5C
      setTimeout(() => this.editId_ = 'WUBRG');
    } else if (!prev.includes('C') && curr.length === 0) {
      // went from colored to nothing, use C
      setTimeout(() => this.editId_ = 'C');
    } else {
      this.editId_ = curr.join('');
    }
  }

  protected toggleMenu_() {
    this.menu_.opened = !this.menu_.opened;
    this.notifyPath('editId_', this.editId_);
  }

  protected handleMenuToggle_() {
    this.menuButton_.classList.toggle('menu-open', this.menu_.opened!);
  }

  protected generatorItemTapped_(e: DomRepeatCustomEvent) {
    this[`list${e.model.item.id.toUpperCase()}Commanders_`]();
  }

  protected getArt_(item: () => CardData[] | undefined, idx: number) {
    const data = item();
    return data && data[idx].image.art;
  }

  protected hasPartner_(item: () => CardData[] | undefined) {
    const data = item();
    return data && data[1];
  }

  protected hasSymbolUrl_(item: ShapeData) {
    return item.id.length === 1;
  }

  protected getCommanders_(e: CustomEvent) {
    this.commanders_ = e.detail.response.commanders;
  }

  protected handlePreviewHover_(
      e: MouseEvent,
      _: any,
      nextSibling?: HTMLElement) {
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
    const sibs = [...this.content_.children];
    const imgIdx = sibs.findIndex((elem) => elem === img);
    const petal = sibs.find((elem, idx) =>
        idx >= imgIdx && elem.nodeName === 'DIV');
    this.handlePreviewHover_(e, undefined, petal as HTMLElement);
  }

  protected handlePreviewUnhover_() {
    this.mousemoveDebouncer_ = Debouncer.debounce(
        this.mousemoveDebouncer_,
        timeoutTask, () => {
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

  protected listEditCommanders_() {
    const identity = this.filterIdentities_(this.editId_);
    this.selectedId_ = identity[0];
    this.listCommanders_((card) => {
      const id = this.editId_ === 'C' ? '' : this.editId_;
      return this.colorIdentityEquals_(card, id) || this.isPartnerIn_(card, id);
    });
  }

  protected openEditor_(id: ColorDescriptor) {
    this.editId_ = identities[id].colors.join('') || 'C';
    this.menu_.opened = !this.menu_.opened;
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
      const idx = this.generatorData_.findIndex((shape) =>
          shape.name === this.selectedId_);
      this.notifyPath(`generatorData_.${idx}.data`);
    }
  }

  protected isVisible_(card?: (() => CardData[] | undefined) | CardData[]) {
    if (typeof card === 'function') {
      return !!card() ? 'visible' : 'hidden';
    }
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
  if (this.diagram_.${k}) {
    this.openEditor_('${k}');
  } else {
    this.selectedId_ = '${k}';
    this.listCommanders_((card) =>
        this.colorIdentityEquals_(card, '${colorsStr}') ||
        this.isPartnerIn_(card, '${colorsStr}'));
  }
}`;

  const fn = (new Function(`return function ${fnCode}`))();
  Challenge32.prototype[`list${fnNameColors}Commanders_`] = fn;
});
