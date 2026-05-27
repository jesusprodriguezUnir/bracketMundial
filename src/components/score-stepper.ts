import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type ScoreStepperVariant = 'inline' | 'compact' | 'mobile';

@customElement('score-stepper')
export class ScoreStepper extends LitElement {
  @property({ type: Number }) value = 0;
  @property() decrementLabel = 'Restar marcador';
  @property() incrementLabel = 'Sumar marcador';
  @property() variant: ScoreStepperVariant = 'inline';

  static readonly styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .stepper {
      display: inline-flex;
      align-items: center;
      background: var(--paper-2);
      color: var(--ink);
      flex-shrink: 0;
      pointer-events: auto;
    }

    button {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      color: var(--paper);
      background: var(--ink);
      text-align: center;
      touch-action: manipulation;
    }

    button:hover {
      background: var(--retro-red);
    }

    button:active {
      opacity: 0.8;
    }

    .value {
      font-family: var(--font-var);
      text-align: center;
      color: var(--ink);
    }

    .stepper.inline {
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--retro-orange);
    }

    .stepper.inline button {
      padding: 2px 8px;
      font-size: 16px;
      line-height: 1.4;
    }

    .stepper.inline .value {
      font-size: 22px;
      line-height: 1;
      padding: 2px 10px;
      min-width: 24px;
    }

    .stepper.compact {
      border: 1.5px solid var(--ink);
      box-shadow: 1px 1px 0 0 var(--retro-orange);
    }

    .stepper.compact button {
      padding: 0 4px;
      font-size: 12px;
      line-height: 1.4;
    }

    .stepper.compact .value {
      font-size: 13px;
      padding: 0 4px;
      min-width: 14px;
    }

    .stepper.mobile {
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--retro-orange);
    }

    .stepper.mobile button {
      padding: 2px 8px;
      min-width: 28px;
      min-height: 28px;
      font-size: 14px;
      line-height: 1.4;
    }

    .stepper.mobile .value {
      font-size: 16px;
      padding: 0 6px;
      min-width: 22px;
    }

    @media (max-width: 768px) {
      .stepper.inline button {
        padding: 4px 8px;
        font-size: 14px;
        min-width: 36px;
        min-height: 36px;
      }

      .stepper.inline .value {
        font-size: 18px;
        padding: 2px 6px;
      }

      .stepper.compact button,
      .stepper.mobile button {
        padding: 2px 8px;
        min-width: 28px;
        min-height: 28px;
        font-size: 14px;
        line-height: 1.4;
      }

      .stepper.compact .value,
      .stepper.mobile .value {
        font-size: 15px;
        padding: 0 6px;
        min-width: 20px;
      }
    }
  `;

  override firstUpdated() {
    const stepper = this.shadowRoot?.querySelector('.stepper');
    if (stepper) {
      stepper.addEventListener('touchstart', () => {}, { passive: true });
    }
  }

  private _emitStep(event: Event, delta: -1 | 1) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent<{ delta: -1 | 1 }>('step-change', {
      detail: { delta },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="stepper ${this.variant}" @click=${(event: Event) => event.stopPropagation()}>
        <button @click=${(event: Event) => this._emitStep(event, -1)} aria-label=${this.decrementLabel}>−</button>
        <span class="value">${this.value}</span>
        <button @click=${(event: Event) => this._emitStep(event, 1)} aria-label=${this.incrementLabel}>+</button>
      </div>
    `;
  }
}