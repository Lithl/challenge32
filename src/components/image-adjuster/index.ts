import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { customElement, property, query } from '@polymer/decorators';
import { PaperDialogElement } from '@polymer/paper-dialog';
import { CardData } from '../../server/commanders';
import '@polymer/paper-input/paper-input';

import { default as template } from './template.html';
import { default as shapes } from '../challenge-32/shapes.html';

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
  card: CardData;
  left: number;
  top: number;
  scaleW: number;
  scaleH: number;
}

@customElement('image-adjuster')
export class ImageAdjuster extends PolymerElement {
  @query('#dialog') private dialog_!: PaperDialogElement;
  @query('#dragging') private dragging_!: HTMLDivElement;

  @property() shape?: ImageShape;
  @property() isFull = true;
  @property() isLeft = false;
  @property() adjustment?: ImageAdjustment;
  @property() protected initialScaleW_ = 1;
  @property() protected initialScaleH_ = 1;
  @property() protected pxOffsetX_ = 0;
  @property() protected pxOffsetY_ = 0;
  @property() protected imgRatio_ = 1;

  private initialMouseX_ = 0;
  private initialMouseY_ = 0;

  private zoomHandlerFn_ = (e: WheelEvent) => this.handleZoom_(e);

  static get template() {
    // @ts-ignore
    return html([template + shapes]);
  }

  show() {
    if (!this.adjustment) return;

    document.body.addEventListener('wheel', this.zoomHandlerFn_);

    const img = new Image();
    img.addEventListener('load', () => {
      const w = img.width;
      const h = img.height;
      this.imgRatio_ = h / w;
      if (w > h) {
        this.initialScaleW_ = 1;
        this.initialScaleH_ = w / h;
      } else {
        this.initialScaleW_ = h / w;
        this.initialScaleH_ = 1;
      }
      this.dialog_.open();
    });
    img.src = this.adjustment.card.image.art;
  }

  protected initialOffsetX_(cW: number, cH: number, imgRatio: number) {
    if (cH / cW > imgRatio) {
      const w = this.initialWidth_(cW, cH, imgRatio);
      const h = this.initialHeight_(cW, cH, imgRatio);
      return -Math.abs(w - h) / 2;
    } else {
      return 0;
    }
  }

  protected initialWidth_(cW: number, cH: number, imgRatio: number) {
    const containerRatio = cH / cW;
    if (containerRatio > imgRatio) {
      return cH / imgRatio;
    } else {
      return cW;
    }
  }

  protected initialHeight_(cW: number, cH: number, imgRatio: number) {
    const containerRatio = cH / cW;
    if (containerRatio > imgRatio) {
      return cH;
    } else {
      return cW * imgRatio;
    }
  }

  protected handleDragstart_(e: MouseEvent) {
    this.initialMouseX_ = e.x;
    this.initialMouseY_ = e.y;
    this.dragging_.style.display = 'block';
  }

  protected handleDrag_(e: MouseEvent) {
    const diffX = e.x - this.initialMouseX_;
    const diffY = e.y - this.initialMouseY_;
    this.set('pxOffsetX_', diffX);
    this.set('pxOffsetY_', diffY);
  }

  protected handleDragend_() {
    this.dragging_.style.display = 'none';
    const vh = document.body.getBoundingClientRect().height;
    const vhOffsetX = this.pxOffsetX_ / (vh / 100);
    const vhOffsetY = this.pxOffsetY_ / (vh / 100);
    let newVal = Number(this.adjustment!.left) + vhOffsetX;
    newVal = Math.round(newVal * 10) / 10;
    this.set('adjustment.left', newVal);
    newVal = Number(this.adjustment!.top) + vhOffsetY;
    newVal = Math.round(newVal * 10) / 10;
    this.set('adjustment.top', newVal);
    this.pxOffsetX_ = 0;
    this.pxOffsetY_ = 0;
  }

  protected handleZoom_(e: WheelEvent) {
    const zoomFactor = -e.deltaY / 100;
    let newVal = Number(this.adjustment!.scaleW) + zoomFactor;
    newVal = Math.max(Math.round(newVal * 100) / 100, .01);
    this.set('adjustment.scaleW', newVal);
    newVal = Number(this.adjustment!.scaleH) + zoomFactor;
    newVal = Math.max(Math.round(newVal * 100) / 100, .01);
    this.set('adjustment.scaleH', newVal);
  }

  protected halfMask_(left: boolean) {
    return left ? 'mask mask-right' : 'mask mask-left';
  }

  protected handleOpenClose_() {
    if (!this.dialog_.opened) {
      document.body.removeEventListener('wheel', this.zoomHandlerFn_);
    }
  }

  protected handleConfirm_() {

  }

  protected isCircle_(shape: ImageShape) {
    return shape === ImageShape.CIRCLE;
  }

  protected isPetal_(shape: ImageShape) {
    return shape === ImageShape.PETAL;
  }

  protected isObtuseTriangle_(shape: ImageShape) {
    return shape === ImageShape.OBTUSE_TRIANGLE;
  }

  protected isInvertedObtuseTriangle_(shape: ImageShape) {
    return shape === ImageShape.INVERTED_OBTUSE_TRIANGLE;
  }

  protected isAcuteTriangle_(shape: ImageShape) {
    return shape === ImageShape.ACUTE_TRIANGLE;
  }

  protected isInvertedAcuteTriangle_(shape: ImageShape) {
    return shape === ImageShape.INVERTED_ACUTE_TRIANGLE;
  }

  protected isTrapezoid_(shape: ImageShape) {
    return shape === ImageShape.TRAPEZOID;
  }

  protected isInvertedTrapezoid_(shape: ImageShape) {
    return shape === ImageShape.INVERTED_TRAPEZOID;
  }

  protected isPentagon_(shape: ImageShape) {
    return shape === ImageShape.PENTAGON;
  }
}
