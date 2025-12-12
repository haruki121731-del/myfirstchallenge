import { TaskHandler, TaskInput, TaskOutput } from '../types.js';

export class MutateHandler implements TaskHandler {
  async execute(input: TaskInput): Promise<TaskOutput> {
    const { state } = input;
    if (!state || typeof state !== 'object') {
      throw new Error('state must be an object');
    }

    return {
      mutated: {
        ...state,
        mutatedAt: Date.now()
      }
    };
  }
}
