import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

export interface DragToDismissInterface {
  _dragThreshold: number;
  _dragDismiss(): void;
  _getDragTarget(): HTMLElement | null;
  _getDragAnimateTarget(): HTMLElement | null;
  _dragCanStart(target: HTMLElement): boolean;
  _onDragMove?(deltaY: number): void;
  _onDragEnd?(deltaY: number, elapsed: number): boolean | void;
}

export const DragToDismissMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class DragToDismissElement extends superClass implements DragToDismissInterface {
    _dragThreshold = 120;

    private _startY = 0;
    private _currentY = 0;
    private _startTime = 0;
    private _isDragging = false;

    _getDragTarget(): HTMLElement | null {
      return this;
    }

    _getDragAnimateTarget(): HTMLElement | null {
      return this.shadowRoot?.querySelector('.modal') as HTMLElement | null;
    }

    _dragCanStart(target: HTMLElement): boolean {
      return target.scrollTop <= 0;
    }

    _dragDismiss(): void {
      this.remove();
    }

    _onDragMove?(_deltaY: number): void {}
    _onDragEnd?(_deltaY: number, _elapsed: number): boolean | void {}

    private readonly _handleTouchStart = (e: TouchEvent) => {
      const target = this._getDragTarget();
      if (!target) return;
      if (!this._dragCanStart(target)) return;
      this._startY = e.touches[0].clientY;
      this._currentY = this._startY;
      this._startTime = Date.now();
      this._isDragging = true;
      const modal = this._getDragAnimateTarget();
      if (modal) modal.style.transition = 'none';
    };

    private readonly _handleTouchMove = (e: TouchEvent) => {
      if (!this._isDragging) return;
      this._currentY = e.touches[0].clientY;
      const deltaY = this._currentY - this._startY;
      if (deltaY > 0) {
        if (e.cancelable) e.preventDefault();
        const modal = this._getDragAnimateTarget();
        if (modal) modal.style.transform = `translateY(${deltaY}px)`;
        if (this._onDragMove) this._onDragMove(deltaY);
      } else {
        this._isDragging = false;
      }
    };

    private readonly _handleTouchEnd = () => {
      if (!this._isDragging) return;
      this._isDragging = false;
      const deltaY = this._currentY - this._startY;
      const elapsed = Date.now() - this._startTime;

      if (this._onDragEnd) {
        const result = this._onDragEnd(deltaY, elapsed);
        if (result === true) {
          return;
        } else if (result === false) {
          this._resetDrag();
          return;
        }
      }

      const modal = this._getDragAnimateTarget();
      if (modal) {
        modal.style.transition = 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
        if (deltaY > this._dragThreshold) {
          modal.style.transform = `translateY(100vh)`;
          setTimeout(() => this._dragDismiss(), 200);
        } else {
          modal.style.transform = '';
        }
      }
    };

    private _resetDrag() {
      const modal = this._getDragAnimateTarget();
      if (modal) {
        modal.style.transition = 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
        modal.style.transform = '';
      }
    }

    override connectedCallback() {
      super.connectedCallback();
      const target = this._getDragTarget();
      if (target) {
        target.addEventListener('touchstart', this._handleTouchStart, { passive: false });
        target.addEventListener('touchmove', this._handleTouchMove, { passive: false });
        target.addEventListener('touchend', this._handleTouchEnd);
        target.addEventListener('touchcancel', this._handleTouchEnd);
      }
    }

    override disconnectedCallback() {
      const target = this._getDragTarget();
      if (target) {
        target.removeEventListener('touchstart', this._handleTouchStart);
        target.removeEventListener('touchmove', this._handleTouchMove);
        target.removeEventListener('touchend', this._handleTouchEnd);
        target.removeEventListener('touchcancel', this._handleTouchEnd);
      }
      super.disconnectedCallback();
    }
  }
  return DragToDismissElement as typeof DragToDismissElement & T;
};
