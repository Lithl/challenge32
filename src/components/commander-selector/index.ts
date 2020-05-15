import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property, query } from '@polymer/decorators';
import { PaperDialogElement } from '@polymer/paper-dialog/paper-dialog';
import { PaperInputElement } from '@polymer/paper-input/paper-input';
import { DomRepeat } from '@polymer/polymer/lib/elements/dom-repeat';
import { PaperListboxElement } from '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/neon-animation/animations/scale-up-animation';
import '@polymer/neon-animation/animations/fade-out-animation';
import '@polymer/paper-button';

import '@polymer/paper-dialog/paper-dialog';

import { ColorDescriptor } from '../challenge-32';
import { CardData, ManaColor } from '../../server/commanders';
import { onlyUnique } from '../../util';

import { default as template } from './template.html';

import './index.scss?name=commander-selector';

interface DomRepeatMouseEvent extends MouseEvent {
  model: {
    item: any,
    index: number,
  };
}

export interface DomRepeatCustomEvent extends CustomEvent {
  model: {
    item: any,
    index: number,
    itemsIndex: number,
  };
}

const identityMap: Record<ColorDescriptor, ManaColor[]> = {
  monoWhite: ['W'],
  monoBlue: ['U'],
  monoBlack: ['B'],
  monoRed: ['R'],
  monoGreen: ['G'],

  azorius: ['W', 'U'],
  dimir: ['U', 'B'],
  rakdos: ['B', 'R'],
  gruul: ['R', 'G'],
  selesnya: ['G', 'W'],

  simic: ['G', 'U'],
  orzhov: ['W', 'B'],
  izzet: ['U', 'R'],
  golgari: ['B', 'G'],
  boros: ['R', 'W'],

  bant: ['G', 'W', 'U'],
  esper: ['W', 'U', 'B'],
  grixis: ['U', 'B', 'R'],
  jund: ['B', 'R', 'G'],
  naya: ['R', 'G', 'W'],

  jeskai: ['W', 'R', 'U'],
  sultai: ['U', 'G', 'B'],
  mardu: ['B', 'W', 'R'],
  temur: ['R', 'U', 'G'],
  abzan: ['G', 'B', 'W'],

  whiteless: ['U', 'B', 'R', 'G'],
  blueless: ['W', 'B', 'R', 'G'],
  blackless: ['W', 'U', 'R', 'G'],
  redless: ['W', 'U', 'B', 'G'],
  greenless: ['W', 'U', 'B', 'R'],

  pentacolor: ['W', 'U', 'B', 'R', 'G'],
  colorless: [],
};

@customElement('commander-selector')
export class CommanderSelector extends PolymerElement {
  @query('#dialog') private dialog_!: PaperDialogElement;
  @query('#filter') private filter_!: PaperInputElement;
  @query('#preview') private preview_!: HTMLDivElement;
  @query('#list') private list_!: DomRepeat;
  @query('#listContainer') private listContainer_!: PaperListboxElement;

  @property() commanders: CardData[] = [];
  @property() identity: string = '';

  private lastTapped_?: CardData;

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
      this.listContainer_.selectedValues = [];
      this.lastTapped_ = undefined;
    }
  }

  protected filterCommanders_(card: CardData) {
    return card.name.toLowerCase()
        .includes((this.filter_.value || '').toLowerCase());
  }

  protected updateFilter_() {
    this.listContainer_.selectedValues = [];
    this.preview_.style.backgroundImage = '';
    this.list_.render();
  }

  protected selectCommander_(e: DomRepeatCustomEvent) {
    let partnerWithForced = false;
    if (e.model.item.partnerWith) {
      // automatically select partnerWith partner
      const displayed = this.commanders.filter((card: CardData) => {
        return this.filterCommanders_(card);
      });
      const partnerIdx = displayed.findIndex((card: CardData) => {
        return card.name.toLowerCase() === e.model.item.partnerWith.toLowerCase();
      });
      if (partnerIdx >= 0) {
        this.listContainer_.selectedValues = [partnerIdx];
        partnerWithForced = true;
      }
    }

    if (this.lastTapped_) {
      if (!partnerWithForced && this.lastTapped_ !== e.model.item) {
        if (!(this.lastTapped_.partnerWithAny && e.model.item.partnerWithAny)) {
          // unless both previous and current selections have partner, only select one
          this.listContainer_.selectedValues = [];
        } else {
          // current and previous are both partners
          if (this.listContainer_.selectedValues!.length > 1) {
            // force selecting only 2
            this.shift('listContainer_.selectedValues');
          }

          // prevent multiselect if partners don't match correct identity
          const prevId = this.lastTapped_.colorIdentity;
          const currId = e.model.item.colorIdentity;
          const combinedId = [...prevId, ...currId].filter(onlyUnique);
          const identity = identityMap[this.identityToColorDescriptor_(this.identity)];
          let isGoodId = identity.length === combinedId.length;
          for (const color of identity) {
            isGoodId = isGoodId && combinedId.includes(color);
            if (!isGoodId) break;
          }
          if (!isGoodId) {
            this.listContainer_.selectedValues = [];
          }
        }

        this.lastTapped_ = e.model.item;
      } else if (!partnerWithForced && this.lastTapped_ === e.model.item) {
        // prevent deselect
        this.push('listContainer_.selectedValues', e.model.index);
      } else if (partnerWithForced) {
        // make sure we track lastTapped for partnerWith cards
        this.lastTapped_ = e.model.item;
      }
    } else {
      // nothing has been tapped until now
      this.lastTapped_ = e.model.item;
    }
  }

  protected handleConfirm_() {
    const displayed = this.commanders.filter((card: CardData) => {
      return this.filterCommanders_(card);
    });
    const selected = displayed.filter((_: CardData, idx: number) => {
      return this.listContainer_.selectedValues!.includes(idx);
    });
    const identity = identityMap[this.identityToColorDescriptor_(this.identity)];
    const selectedIdentity = selected.map((card: CardData) => card.colorIdentity)
        .reduce((memo: ManaColor[], val: ManaColor[]) => {
          return [...memo, ...val];
        }, []).filter(onlyUnique);

    let isGoodId = identity.length === selectedIdentity.length;
    for (const color of identity) {
      isGoodId = isGoodId && selectedIdentity.includes(color);
      if (!isGoodId) break;
    }

    if (isGoodId) {
      this.dispatchEvent(new CustomEvent('commander-selected', {
        detail: selected,
        bubbles: true,
        composed: true,
      }));
      this.dialog_.close();
    }
  }

  private identityToColorDescriptor_(identity: string) {
    return identity.toLowerCase().split('-').map((s, i) => {
      return i === 0 ? s : s.substring(0, 1).toUpperCase() + s.substring(1);
    }).join('') as ColorDescriptor;
  }
}
