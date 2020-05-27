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
  private initialPinchDist_ = 0;
  private scaling_ = false;

  private zoomHandlerFn_ = (e: WheelEvent) => this.handleZoom_(e);
  private pinchStartHandlerFn_ = (e: TouchEvent) => this.handleDragstart_(e);
  private pinchMoveHandlerFn_ = (e: TouchEvent) => this.handleDrag_(e);
  private pinchEndHandlerFn_ = (_e: TouchEvent) => this.handleDragend_();

  static get template() {
    // @ts-ignore
    return html([template + shapes]);
  }

  show() {
    if (!this.adjustment) return;

    document.body.addEventListener('wheel', this.zoomHandlerFn_);
    document.body.addEventListener('touchstart', this.pinchStartHandlerFn_);
    document.body.addEventListener('touchmove', this.pinchMoveHandlerFn_);
    document.body.addEventListener('touchend', this.pinchEndHandlerFn_);

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

  protected handleDragstart_(e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent) {
      if (e.touches.length === 1) {
        // started dragging
        this.initialMouseX_ = e.touches[0].clientX;
        this.initialMouseY_ = e.touches[0].clientY;
      } else if (e.touches.length > 1) {
        const diffX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
        const diffY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
        this.initialPinchDist_ = Math.hypot(diffX, diffY);
        this.scaling_ = true;
      }
    } else {
      this.initialMouseX_ = e.x;
      this.initialMouseY_ = e.y;
    }
    this.dragging_.style.display = 'block';
  }

  protected handleDrag_(e: MouseEvent | TouchEvent) {
    if (this.scaling_ && e instanceof TouchEvent && e.touches.length > 1) {
      const diffX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
      const diffY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
      const dist = Math.hypot(diffX, diffY);
      const change = (dist - this.initialPinchDist_) / 500;
      this.initialPinchDist_ = dist;
      let newVal = Math.max(.01, change + this.adjustment!.scaleW);
      newVal = Math.round(newVal * 100) / 100;
      this.set('adjustment.scaleW', newVal);
      newVal = Math.max(.01, change + this.adjustment!.scaleH);
      newVal = Math.round(newVal * 100) / 100;
      this.set('adjustment.scaleH', newVal);
    } else if (!this.scaling_) {
      let diffX: number;
      let diffY: number;
      if (e instanceof TouchEvent) {
        diffX = e.touches[0].clientX - this.initialMouseX_;
        diffY = e.touches[0].clientY - this.initialMouseY_;
      } else {
        diffX = e.x - this.initialMouseX_;
        diffY = e.y - this.initialMouseY_;
      }
      this.set('pxOffsetX_', diffX);
      this.set('pxOffsetY_', diffY);
    }
  }

  protected handleDragend_(e?: TouchEvent) {
    if (e instanceof TouchEvent) {
      this.scaling_ = false;
    } else {
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
    this.dragging_.style.display = 'none';
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
      document.body.removeEventListener('touchstart',
          this.pinchStartHandlerFn_);
      document.body.removeEventListener('touchmove', this.pinchMoveHandlerFn_);
      document.body.removeEventListener('touchend', this.pinchEndHandlerFn_);
    }
  }

  protected handleConfirm_() {
    this.dispatchEvent(new CustomEvent('image-adjustment-confirmed', {
      detail: {
        adjustment: this.adjustment,
      },
      bubbles: true,
      composed: true,
    }));
    this.dialog_.close();
  }

  protected isCircle_(shape: ImageShape) {
    return shape === ImageShape.CIRCLE;
  }

  protected isPetal_(shape: ImageShape) {
    return shape === ImageShape.PETAL;
  }

  protected isObtuseTriangle_(shape: ImageShape) {
    return shape === ImageShape.OBTUSE_TRIANGLE
        || shape === ImageShape.INVERTED_OBTUSE_TRIANGLE;
  }

  protected isInvertedObtuseTriangle_(shape: ImageShape) {
    return shape === ImageShape.INVERTED_OBTUSE_TRIANGLE ? 'inverted' : '';
  }

  protected isAcuteTriangle_(shape: ImageShape) {
    return shape === ImageShape.ACUTE_TRIANGLE
        || shape === ImageShape.INVERTED_ACUTE_TRIANGLE;
  }

  protected isInvertedAcuteTriangle_(shape: ImageShape) {
    return shape === ImageShape.INVERTED_ACUTE_TRIANGLE ? 'inverted' : '';
  }

  protected isTrapezoid_(shape: ImageShape) {
    return shape === ImageShape.TRAPEZOID
        || shape === ImageShape.INVERTED_TRAPEZOID;
  }

  protected isInvertedTrapezoid_(shape: ImageShape) {
    return shape === ImageShape.INVERTED_TRAPEZOID ? 'inverted' : '';
  }

  protected isPentagon_(shape: ImageShape) {
    return shape === ImageShape.PENTAGON;
  }
}
