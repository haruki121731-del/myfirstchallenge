import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface StateTransition {
  [event: string]: string;
}

export interface StateDefinition {
  on?: StateTransition;
  type?: 'final';
}

export interface StateMachineConfig {
  initial: string;
  states: {
    [state: string]: StateDefinition;
  };
}

export class StateMachine {
  private config: StateMachineConfig;
  private currentState: string;

  constructor(configPath: string) {
    const content = readFileSync(resolve(configPath), 'utf-8');
    this.config = JSON.parse(content);
    this.currentState = this.config.initial;
  }

  getCurrentState(): string {
    return this.currentState;
  }

  transition(event: string): string {
    const state = this.config.states[this.currentState];
    if (!state) {
      throw new Error(`Invalid state: ${this.currentState}`);
    }

    if (state.type === 'final') {
      throw new Error(`Cannot transition from final state: ${this.currentState}`);
    }

    if (!state.on || !state.on[event]) {
      throw new Error(`Invalid transition: ${event} from ${this.currentState}`);
    }

    this.currentState = state.on[event];
    return this.currentState;
  }

  isFinal(): boolean {
    const state = this.config.states[this.currentState];
    return state?.type === 'final';
  }

  reset(): void {
    this.currentState = this.config.initial;
  }
}
