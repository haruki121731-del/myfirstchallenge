import { TaskGrammar, Schema } from './grammar.js';
import { TaskInput, TaskOutput } from './types.js';

export class TaskValidator {
  constructor(private grammar: TaskGrammar) {}

  validateInput(taskName: string, input: TaskInput): void {
    const schema = this.grammar.getInputSchema(taskName);
    this.validate(input, schema, `${taskName} input`);
  }

  validateOutput(taskName: string, output: TaskOutput): void {
    const schema = this.grammar.getOutputSchema(taskName);
    this.validate(output, schema, `${taskName} output`);
  }

  private validate(data: unknown, schema: Schema, context: string): void {
    if (schema.type === 'object') {
      if (!data || typeof data !== 'object') {
        throw new Error(`${context} must be an object`);
      }

      if (schema.required) {
        for (const key of schema.required) {
          if (!(key in (data as Record<string, unknown>))) {
            throw new Error(`${context} missing required field: ${key}`);
          }
        }
      }

      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          const value = (data as Record<string, unknown>)[key];
          if (value !== undefined) {
            this.validateProperty(value, propSchema, `${context}.${key}`);
          }
        }
      }
    }
  }

  private validateProperty(value: unknown, schema: unknown, context: string): void {
    if (!schema || typeof schema !== 'object') {
      return;
    }

    const typedSchema = schema as { type?: string; enum?: unknown[] };

    if (typedSchema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== typedSchema.type) {
        throw new Error(`${context} must be ${typedSchema.type}, got ${actualType}`);
      }
    }

    if (typedSchema.enum && !typedSchema.enum.includes(value)) {
      throw new Error(`${context} must be one of ${typedSchema.enum.join(', ')}`);
    }
  }
}
