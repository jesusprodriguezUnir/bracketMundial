import { css } from 'lit';

export const retroButton = css`
  .btn {
    background: var(--paper-2);
    border: 3px solid var(--ink);
    color: var(--ink);
    padding: 8px 16px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-var);
    font-size: 0.85rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    border-radius: 0;
    box-shadow: var(--shadow-hard-md);
    transition: transform 0.1s, box-shadow 0.1s;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }
  @media (hover: hover) {
    .btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 0 var(--ink);
    }
  }
  .btn:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 0 var(--ink);
  }
  .btn-primary {
    background: var(--retro-yellow);
    border-color: var(--ink);
  }
  @media (hover: hover) {
    .btn-primary:hover {
      background: var(--retro-yellow);
    }
  }
  .btn-secondary {
    background: var(--paper-3);
    color: var(--ink);
  }
  @media (hover: hover) {
    .btn-secondary:hover {
      background: var(--paper);
    }
  }
  .btn-danger {
    background: var(--retro-red);
    color: var(--paper);
  }
  @media (hover: hover) {
    .btn-danger:hover {
      background: var(--retro-orange);
      color: var(--paper);
    }
  }
`;
