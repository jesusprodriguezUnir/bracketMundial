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
      background: var(--fill);
      color: var(--ink);
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
    }

    button {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-weight: 800;
      color: var(--on-accent);
      background: var(--accent);
      text-align: center;
      touch-action: manipulation;
      transition: background 0.12s;
    }

    button:hover {
      background: var(--accent-hover);
    }

    button:active {
      opacity: 0.8;
    }

    .value {
      font-family: var(--font-var);
      font-weight: 800;
      text-align: center;
      color: var(--ink);
    }

    .stepper.inline {
      border: 1px solid var(--hairline-strong);
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
      border: 1px solid var(--hairline);
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
      border: 1px solid var(--hairline-strong);
    }

    .stepper.mobile button {
      padding: 4px 10px;
      min-width: 44px;
      min-height: 44px;
      font-size: 18px;
      line-height: 1.4;
    }

    .stepper.mobile .value {
      font-size: 20px;
      padding: 0 10px;
      min-width: 26px;
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
    }
  `;

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