import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { customElement, query, property } from '@polymer/decorators';
import { CommanderSelector } from '../commander-selector';
import { PreviewHover } from'../preview-hover';
import { AppDrawerElement } from '@polymer/app-layout/app-drawer/app-drawer';
import { PaperIconButtonElement } from '@polymer/paper-icon-button/paper-icon-button';
import { ImageAdjuster, ImageAdjustment, ImageShape } from '../image-adjuster';
import { PaperInputElement } from '@polymer/paper-input/paper-input';
import '@polymer/iron-ajax/iron-ajax';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-progress/paper-progress';
import '../icon-toggle-button';
import '../iconset-mtg';
import '../toggle-button-group';
import '../image-adjuster';

import { CardData, ManaColor } from '../../server/commanders';
import { intersection, onlyUnique, assertUnreachable } from '../../util';
import { DomRepeatCustomEvent } from '../commander-selector';

import { default as template } from './template.html';
import { default as shapes } from './shapes.html';

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

type DiagramModel = Record<ColorDescriptor, CardData[]>;
type DiagramMeta = Record<ColorDescriptor, Partial<Metadata>>;

interface Metadata {
  decklist: string;
  adjustment: AdjustmentData[];
}

const timeoutTask = timeOut.after(100);

interface ShapeData {
  name: ColorDescriptor;
  type: string;
  id: string;
  readonly data: CardDataArrFn;
}

type CardDataArrFn = () => CardData[] | undefined;
type AdjustmentData = Omit<ImageAdjustment, 'card'>;

@customElement('challenge-32')
export class Challenge32 extends GestureEventListeners(PolymerElement) {
  [x: string]: any; // needed for ts to allow automatically adding functions

  @query('#content') private content_!: HTMLDivElement;
  @query('#indicator') private indicator_!: HTMLDivElement;
  @query('#selector') private selector_!: CommanderSelector;
  @query('preview-hover') private preview_!: PreviewHover;
  @query('#menu') private menu_!: AppDrawerElement;
  @query('#menuButton') private menuButton_!: PaperIconButtonElement;
  @query('#adjuster') private adjuster_!: ImageAdjuster;
  @query('#decklist') private decklist_!: PaperInputElement;

  @property() protected commanders_: CardData[] = [];
  @property() protected diagram_: Partial<DiagramModel> = {};
  @property() protected metadata_: Partial<DiagramMeta> = {};
  @property() protected readonly generatorData_: ShapeData[];
  @property() protected editId_ = 'C';

  private selectedId_?: ColorDescriptor;
  private mousemoveDebouncer_: Debouncer | null = null;
  private imgRatioCache_: Partial<Record<ColorDescriptor, number[]>> = {};

  static get template() {
    // @ts-ignore
    return html([template + shapes]);
  }

  constructor() {
    super();

    const self = this;
    const dataArr: ShapeData[] = [];
    Object.entries(identities).forEach((id) => {
      dataArr.push({
        name: id[0] as ColorDescriptor,
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
      this.indicator_.classList.toggle('landscape', true);
      this.content_.classList.toggle('portrait', false);
      this.indicator_.classList.toggle('portrait', false);
    } else {
      this.content_.classList.toggle('landscape', false);
      this.indicator_.classList.toggle('landscape', false);
      this.content_.classList.toggle('portrait', true);
      this.indicator_.classList.toggle('portrait', true);
    }
  }

  protected decksCompleted_() {
    return Object.keys(this.diagram_).length;
  }

  protected pctCompleted_() {
    const pct = this.decksCompleted_() / 32 * 100;
    return (Math.round(pct * 100) / 100).toFixed(2);
  }

  protected progressLabel_() {
    return `${this.decksCompleted_()} of 32\u2014${this.pctCompleted_()}%`;
  }

  protected handleImageAdjusted_(e: CustomEvent) {
    const descriptor = this.descriptor_(this.editId_);
    if (!this.metadata_[descriptor]) {
      this.metadata_[descriptor] = {
          adjustment: [{
          left: 0,
          top: 0,
          scaleW: 1,
          scaleH: 1,
        }, {
          left: 0,
          top: 0,
          scaleW: 1,
          scaleH: 1,
        }],
      };
    }
    const idx = e.detail.isFull || e.detail.isLeft ? 0 : 1;
    this.metadata_[descriptor]!.adjustment![idx] = {
      left: e.detail.adjustment.left,
      top: e.detail.adjustment.top,
      scaleW: e.detail.adjustment.scaleW,
      scaleH: e.detail.adjustment.scaleH,
    };
    const shapeIdx = this.generatorData_
        .findIndex((shape) => shape.name === descriptor);
    this.notifyPath(`generatorData_.${shapeIdx}.data`);
    this.notifyPath(`diagram_.${this.selectedId_}`);
  }

  protected getDecklist_(id: string) {
    const descriptor = this.descriptor_(id);
    if (!this.metadata_[descriptor]) return '';
    return this.metadata_[descriptor]!.decklist || '';
  }

  protected getDecklistDisplay_(id: string) {
    return this.getDecklist_(id).replace(/^.+\/\//, '');
  }

  protected hasDecklist_(id: string) {
    const descriptor = this.descriptor_(id);
    if (!this.metadata_[descriptor]) return false;
    return !!(this.metadata_[descriptor]!.decklist);
  }

  protected descriptor_(id: string) {
    return this.filterIdentities_(id)[0];
  }

  protected decklistKeydown_(e: KeyboardEvent) {
    if (!(e.key === 'Enter' || e.key === 'Tab')) return;
    const val = this.decklist_.value;
    if (!val) return;
    if (!val.trim().length) return;

    const descriptor = this.descriptor_(this.editId_);
    if (!this.metadata_[descriptor]) {
      this.metadata_[descriptor] = {
        decklist: '',
      };
    }
    this.set(`metadata_.${descriptor}.decklist`, val);

    this.decklist_.value = '';
    this.decklist_.blur();
  }

  protected handleImageAdjust_(e: DomRepeatCustomEvent) {
    const card = e.model.item as CardData;
    const descriptor = this.descriptor_(this.editId_);
    const isFull = !!this.diagram_[descriptor]
        && this.diagram_[descriptor]!.length === 1;
    const isLeft = e.model.index === 0;

    this.adjuster_.isFull = isFull;
    this.adjuster_.isLeft = isLeft;

    if (this.metadata_[descriptor] && this.metadata_[descriptor]!.adjustment) {
      this.adjuster_.adjustment = Object.assign(
          {},
          this.metadata_[descriptor]!.adjustment![e.model.index],
          {card});
    } else {
      this.adjuster_.adjustment = {
        card,
        left: 0,
        top: 0,
        scaleW: 1,
        scaleH: 1,
      };
    }

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
    const descriptor = this.descriptor_(id);
    return this.diagram_[descriptor];
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

  protected getImageStyle_(
      shapeName: ColorDescriptor,
      item: CardDataArrFn | CardData[] | undefined,
      idx: number) {
    const data = typeof item === 'function' ? item() : item;
    if (!data) return '';
    const card = data[idx];
    this.addRatioToCache_(card.image.art, shapeName, idx);
    let style = `background-image: url(${card.image.art});`;
    if (this.metadata_[shapeName] && this.metadata_[shapeName]!.adjustment) {
      // imgRatioCache_[card.image.art] is set asynchronously, so might be
      // undefined. However, this section will only be reached after confirming
      // the image adjustment dialog, while this function will have been called
      // on the same image upon confirming the comander selection dialog, so
      // under most circumstances the value will be set correctly.
      const dim = this.getDimensions_(shapeName);
      const ratioCache = this.imgRatioCache_[shapeName] || [1, 1];
      const baseW = this.initialWidth_(dim.width, dim.height, ratioCache[idx]);
      const baseH = this.initialHeight_(dim.width, dim.height, ratioCache[idx]);
      const adjustment = this.metadata_[shapeName]!.adjustment![idx] || {
        left: 0,
        top: 0,
        scaleW: 1,
        scaleH: 1,
      };
      style += `background-size:
    calc(${baseW}vh * ${adjustment.scaleW})
    calc(${baseH}vh * ${adjustment.scaleH});`;
      const offset = this.initialOffsetX_(
          dim.width,
          dim.height,
          ratioCache[idx]);
      style += `background-position:
    calc(${offset}vh + ${adjustment.left}vh)
    ${adjustment.top}vh`;
    }
    return style;
  }

  private initialOffsetX_(cW: number, cH: number, imgRatio: number) {
    if (cH / cW > imgRatio) {
      const w = this.initialWidth_(cW, cH, imgRatio);
      const h = this.initialHeight_(cW, cH, imgRatio);
      return -Math.abs(w - h) / 2;
    } else {
      return 0;
    }
  }

  private initialWidth_(cW: number, cH: number, imgRatio = 1) {
    const containerRatio = cH / cW;
    if (containerRatio > imgRatio) {
      return cH / imgRatio;
    } else {
      return cW;
    }
  }

  private initialHeight_(cW: number, cH: number, imgRatio = 1) {
    const containerRatio = cH / cW;
    if (containerRatio > imgRatio) {
      return cH;
    } else {
      return cW * imgRatio;
    }
  }

  private addRatioToCache_(url: string, id: ColorDescriptor, idx: number) {
    const image = new Image();
    image.addEventListener('load', () => {
      const w = image.width;
      const h = image.height;
      if (this.imgRatioCache_[id] === undefined) {
        this.imgRatioCache_[id] = [1, 1];
      }
      this.imgRatioCache_[id]![idx] = h / w;
    });
    image.src = url;
  }

  private getDimensions_(shapeName: ColorDescriptor) {
    switch (shapeName) {
      case 'colorless':
        return {
          // computed: vh equivalent to 185.5px
          width: 15.68959,
          height: 15.68959,
        };
      case 'monoWhite':
      case 'monoBlue':
      case 'monoBlack':
      case 'monoRed':
      case 'monoGreen':
      case 'whiteless':
      case 'blueless':
      case 'blackless':
      case 'redless':
      case 'greenless':
        return {
          // computed: vh equivalent to 382.2px
          width: 32.32648,
          height: 32.32648,
        };
      case 'azorius':
      case 'dimir':
      case 'rakdos':
      case 'gruul':
      case 'selesnya':
      case 'jeskai':
      case 'sultai':
      case 'mardu':
      case 'temur':
      case 'abzan':
        return {
          // distance between mono-color mana symbols
          width: 47.55,
          // arbitrarily chosen
          height: 14.683,
        };
      case 'bant':
      case 'esper':
      case 'grixis':
      case 'jund':
      case 'naya':
        return {
          // dimensions to fill space between ally-color triangles
          width: 21.21,
          height: 25.855,
        };
      case 'simic':
      case 'orzhov':
      case 'izzet':
      case 'golgari':
      case 'boros':
        return {
          // width of shards
          width: 21.21,
          // width of side of 5c pentagon
          height: 10.55,
        };
      case 'pentacolor':
        return {
          // arbitrarily chosen
          width: 10,
          height: 10,
        };
      default:
        assertUnreachable(shapeName);
    }
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
      if (totalIdentity.length !== identity.length) return false;
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
    const descriptor = this.descriptor_(this.editId_);
    this.selectedId_ = descriptor;
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
      if (this.metadata_[this.selectedId_]) {
        delete this.metadata_[this.selectedId_]!.adjustment;
      }
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
