export type ConditionResult = boolean;

export interface Condition {
  evaluate(context: unknown): ConditionResult;
}

export class AlwaysTrueCondition implements Condition {
  evaluate(_context: unknown): ConditionResult {
    return true;
  }
}

export class PropertyCondition implements Condition {
  constructor(
    private property: string,
    private expectedValue: unknown
  ) {}

  evaluate(context: unknown): ConditionResult {
    if (!context || typeof context !== 'object') {
      return false;
    }
    const value = (context as Record<string, unknown>)[this.property];
    return value === this.expectedValue;
  }
}

export class ThresholdCondition implements Condition {
  constructor(
    private property: string,
    private threshold: number,
    private operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  ) {}

  evaluate(context: unknown): ConditionResult {
    if (!context || typeof context !== 'object') {
      return false;
    }
    const value = (context as Record<string, unknown>)[this.property];
    if (typeof value !== 'number') {
      return false;
    }

    switch (this.operator) {
      case '>':
        return value > this.threshold;
      case '<':
        return value < this.threshold;
      case '>=':
        return value >= this.threshold;
      case '<=':
        return value <= this.threshold;
      case '==':
        return value === this.threshold;
      case '!=':
        return value !== this.threshold;
      default:
        throw new Error(`Invalid operator: ${this.operator}`);
    }
  }
}
