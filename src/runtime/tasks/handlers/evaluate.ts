import { TaskHandler, TaskInput, TaskOutput } from '../types.js';

export class EvaluateHandler implements TaskHandler {
  async execute(input: TaskInput): Promise<TaskOutput> {
    const { target } = input;
    if (typeof target !== 'string') {
      throw new Error('target must be a string');
    }

    const score = Math.random();
    let result: 'pass' | 'fail' | 'retry';

    if (score >= 0.8) {
      result = 'pass';
    } else if (score >= 0.5) {
      result = 'retry';
    } else {
      result = 'fail';
    }

    return {
      result,
      score
    };
  }
}
