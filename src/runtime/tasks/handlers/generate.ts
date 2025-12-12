import { TaskHandler, TaskInput, TaskOutput } from '../types.js';

export class GenerateHandler implements TaskHandler {
  async execute(input: TaskInput): Promise<TaskOutput> {
    const { prompt } = input;
    if (typeof prompt !== 'string') {
      throw new Error('prompt must be a string');
    }

    return {
      content: `Generated content for: ${prompt}`,
      metadata: { timestamp: Date.now() }
    };
  }
}
