import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property, query } from '@polymer/decorators';
import { PaperDialogElement } from '@polymer/paper-dialog';

import { default as template } from './template.html';

import './index.scss?name=image-adjuster';

export enum ImageShape {
  CIRCLE,
  PETAL,
  OBTUSE_TRIANGLE,
  INVERTED_OBTUSE_TRIANGLE,
  ACUTE_TRIANGLE,
  INVERTED_ACUTE_TRIANGLE,
  TRAPEZOID,
  INVERTED_TRAPEZOID,
  PENTAGON,
}

export interface ImageAdjustment {
  url: string;
  left: number;
  top: number;
  scale: number;
}

@customElement('image-adjuster')
export class ImageAdjuster extends PolymerElement {
  @query('#dialog') private dialog_!: PaperDialogElement;

  @property() shape?: ImageShape;
  @property() isFull = true;
  @property() isLeft = false;
  @property() adjustment?: ImageAdjustment;

  static get template() {
    // @ts-ignore
    return html([template]);
  }

  show() {
    this.dialog_.open();
  }
}
