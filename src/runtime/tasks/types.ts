export interface TaskInput {
  [key: string]: unknown;
}

export interface TaskOutput {
  [key: string]: unknown;
}

export interface TaskContext {
  taskName: string;
  input: TaskInput;
  timestamp: number;
}

export interface TaskHandler {
  execute(input: TaskInput): Promise<TaskOutput>;
}

export type TaskName = 'generate' | 'render' | 'upload' | 'evaluate' | 'mutate' | 'halt';

export interface TaskRegistry {
  register(name: TaskName, handler: TaskHandler): void;
  get(name: TaskName): TaskHandler | undefined;
}
