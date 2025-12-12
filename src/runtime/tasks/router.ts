import { TaskHandler, TaskInput, TaskOutput, TaskName, TaskRegistry } from './types.js';
import { TaskValidator } from './validate.js';
import { Logger } from '../infra/logger.js';

export class TaskRouter {
  private handlers: Map<TaskName, TaskHandler> = new Map();

  constructor(
    private validator: TaskValidator,
    private logger: Logger
  ) {}

  register(name: TaskName, handler: TaskHandler): void {
    this.handlers.set(name, handler);
  }

  async execute(taskName: TaskName, input: TaskInput): Promise<TaskOutput> {
    this.logger.info(`Executing task: ${taskName}`);

    const handler = this.handlers.get(taskName);
    if (!handler) {
      throw new Error(`Task handler not found: ${taskName}`);
    }

    this.validator.validateInput(taskName, input);

    try {
      const output = await handler.execute(input);
      this.validator.validateOutput(taskName, output);
      this.logger.info(`Task completed: ${taskName}`);
      return output;
    } catch (error) {
      this.logger.error(`Task failed: ${taskName}`, error);
      throw error;
    }
  }
}

export class InMemoryTaskRegistry implements TaskRegistry {
  private handlers: Map<TaskName, TaskHandler> = new Map();

  register(name: TaskName, handler: TaskHandler): void {
    this.handlers.set(name, handler);
  }

  get(name: TaskName): TaskHandler | undefined {
    return this.handlers.get(name);
  }
}
