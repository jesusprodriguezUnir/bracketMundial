import { css } from 'lit';

export const retroButton = css`
  .btn {
    background: var(--fill);
    border: 1px solid var(--hairline-strong);
    color: var(--ink);
    padding: 8px 16px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-var);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: transform 0.1s, background 0.12s, border-color 0.12s;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }
  @media (hover: hover) {
    .btn:hover {
      border-color: var(--accent);
      background: var(--fill-soft);
    }
  }
  .btn:active {
    opacity: 0.7;
  }
  .btn-primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--on-accent);
    font-weight: 800;
    box-shadow: var(--glow-accent-sm);
  }
  @media (hover: hover) {
    .btn-primary:hover {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }
  }
  .btn-secondary {
    background: var(--fill);
    color: var(--ink);
  }
  @media (hover: hover) {
    .btn-secondary:hover {
      background: var(--fill-soft);
    }
  }
  .btn-danger {
    background: var(--retro-red);
    border-color: var(--retro-red);
    color: #fff;
  }
  @media (hover: hover) {
    .btn-danger:hover {
      opacity: 0.85;
    }
  }
`;
