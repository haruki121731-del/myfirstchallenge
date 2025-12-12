import { TaskHandler, TaskInput, TaskOutput } from '../types.js';

export class UploadHandler implements TaskHandler {
  async execute(input: TaskInput): Promise<TaskOutput> {
    const { data, destination } = input;
    if (typeof data !== 'string' || typeof destination !== 'string') {
      throw new Error('data and destination must be strings');
    }

    return {
      url: `${destination}/${Date.now()}`
    };
  }
}
