import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface Schema {
  type: string;
  required?: string[];
  properties?: {
    [key: string]: unknown;
  };
  enum?: string[];
}

export interface TaskGrammarDefinition {
  input_schema: Schema;
  output_schema: Schema;
}

export interface TaskGrammarConfig {
  tasks: {
    [taskName: string]: TaskGrammarDefinition;
  };
}

export class TaskGrammar {
  private config: TaskGrammarConfig;

  constructor(configPath: string) {
    const content = readFileSync(resolve(configPath), 'utf-8');
    this.config = JSON.parse(content);
  }

  getInputSchema(taskName: string): Schema {
    const task = this.config.tasks[taskName];
    if (!task) {
      throw new Error(`Task grammar not found: ${taskName}`);
    }
    return task.input_schema;
  }

  getOutputSchema(taskName: string): Schema {
    const task = this.config.tasks[taskName];
    if (!task) {
      throw new Error(`Task grammar not found: ${taskName}`);
    }
    return task.output_schema;
  }

  hasTask(taskName: string): boolean {
    return !!this.config.tasks[taskName];
  }
}
