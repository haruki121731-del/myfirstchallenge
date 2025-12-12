import { TaskHandler, TaskInput, TaskOutput } from '../types.js';

export class HaltHandler implements TaskHandler {
  async execute(input: TaskInput): Promise<TaskOutput> {
    const reason = input.reason || 'No reason provided';

    return {
      halted: true,
      reason
    };
  }
}
