import { StateMachine } from './state/machine.js';
import { TaskGrammar } from './tasks/grammar.js';
import { TaskValidator } from './tasks/validate.js';
import { TaskRouter } from './tasks/router.js';
import { Thresholds } from './thresholds/thresholds.js';
import { ThresholdEvaluator } from './thresholds/evaluate.js';
import { ConsoleLogger } from './infra/logger.js';
import { InMemoryStore } from './infra/store.js';
import { SystemClock } from './infra/clock.js';
import { GenerateHandler } from './tasks/handlers/generate.js';
import { RenderHandler } from './tasks/handlers/render.js';
import { UploadHandler } from './tasks/handlers/upload.js';
import { EvaluateHandler } from './tasks/handlers/evaluate.js';
import { MutateHandler } from './tasks/handlers/mutate.js';
import { HaltHandler } from './tasks/handlers/halt.js';

export class AutonomousRuntime {
  private stateMachine: StateMachine;
  private taskRouter: TaskRouter;
  private thresholdEvaluator: ThresholdEvaluator;
  private logger: ConsoleLogger;
  private store: InMemoryStore<unknown>;
  private clock: SystemClock;

  constructor(
    stateMachineConfig: string,
    taskGrammarConfig: string,
    thresholdConfig: string
  ) {
    this.logger = new ConsoleLogger();
    this.store = new InMemoryStore();
    this.clock = new SystemClock();

    this.stateMachine = new StateMachine(stateMachineConfig);
    const taskGrammar = new TaskGrammar(taskGrammarConfig);
    const taskValidator = new TaskValidator(taskGrammar);
    this.taskRouter = new TaskRouter(taskValidator, this.logger);

    const thresholds = new Thresholds(thresholdConfig);
    this.thresholdEvaluator = new ThresholdEvaluator(thresholds);

    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.taskRouter.register('generate', new GenerateHandler());
    this.taskRouter.register('render', new RenderHandler());
    this.taskRouter.register('upload', new UploadHandler());
    this.taskRouter.register('evaluate', new EvaluateHandler());
    this.taskRouter.register('mutate', new MutateHandler());
    this.taskRouter.register('halt', new HaltHandler());
  }

  async run(): Promise<void> {
    this.logger.info('Runtime started');
    this.stateMachine.transition('START');

    while (!this.stateMachine.isFinal()) {
      const currentState = this.stateMachine.getCurrentState();
      this.logger.info(`Current state: ${currentState}`);

      try {
        const event = await this.executeStateTask(currentState);
        this.stateMachine.transition(event);
      } catch (error) {
        this.logger.error('Task execution failed', error);
        this.stateMachine.transition('FAILURE');
      }
    }

    this.logger.info('Runtime halted');
  }

  private async executeStateTask(state: string): Promise<string> {
    switch (state) {
      case 'generating': {
        const output = await this.taskRouter.execute('generate', {
          prompt: 'test prompt'
        });
        this.store.set('generated', output);
        return 'SUCCESS';
      }

      case 'rendering': {
        const generated = this.store.get('generated') as { content: string };
        if (!generated) throw new Error('No generated content');
        const output = await this.taskRouter.execute('render', {
          content: generated.content,
          template: 'default'
        });
        this.store.set('rendered', output);
        return 'SUCCESS';
      }

      case 'uploading': {
        const rendered = this.store.get('rendered') as { rendered: string };
        if (!rendered) throw new Error('No rendered content');
        const output = await this.taskRouter.execute('upload', {
          data: rendered.rendered,
          destination: 'https://example.com'
        });
        this.store.set('uploaded', output);
        return 'SUCCESS';
      }

      case 'evaluating': {
        const uploaded = this.store.get('uploaded') as { url: string };
        if (!uploaded) throw new Error('No uploaded content');
        const output = await this.taskRouter.execute('evaluate', {
          target: uploaded.url
        });
        this.store.set('evaluated', output);

        const result = (output as { result: string; score: number }).result;
        if (result === 'pass') return 'PASS';
        if (result === 'retry') return 'RETRY';
        return 'FAIL';
      }

      case 'mutating': {
        const evaluated = this.store.get('evaluated');
        const output = await this.taskRouter.execute('mutate', {
          state: evaluated || {}
        });
        this.store.set('mutated', output);
        return 'SUCCESS';
      }

      case 'halt': {
        await this.taskRouter.execute('halt', {
          reason: 'Runtime completed'
        });
        return 'HALT';
      }

      default:
        throw new Error(`Unknown state: ${state}`);
    }
  }
}

async function main() {
  const runtime = new AutonomousRuntime(
    'config/runtime/state_machine.json',
    'config/runtime/task_grammar.json',
    'config/runtime/threshold.json'
  );

  await runtime.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Runtime error:', error);
    process.exit(1);
  });
}
