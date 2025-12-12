import { TaskHandler, TaskInput, TaskOutput } from '../types.js';

export class RenderHandler implements TaskHandler {
  async execute(input: TaskInput): Promise<TaskOutput> {
    const { content, template } = input;
    if (typeof content !== 'string' || typeof template !== 'string') {
      throw new Error('content and template must be strings');
    }

    return {
      rendered: `${template}: ${content}`
    };
  }
}
