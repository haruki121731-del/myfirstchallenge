import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface EvaluationThreshold {
  pass_score: number;
  retry_score: number;
  max_retries: number;
}

export interface TimingThreshold {
  task_timeout_ms: number;
  idle_timeout_ms: number;
}

export interface ResourceThreshold {
  max_memory_mb: number;
  max_concurrent_tasks: number;
}

export interface ErrorThreshold {
  max_consecutive_failures: number;
  backoff_multiplier: number;
}

export interface ThresholdConfig {
  thresholds: {
    evaluation: EvaluationThreshold;
    timing: TimingThreshold;
    resource: ResourceThreshold;
    error: ErrorThreshold;
  };
}

export class Thresholds {
  private config: ThresholdConfig;

  constructor(configPath: string) {
    const content = readFileSync(resolve(configPath), 'utf-8');
    this.config = JSON.parse(content);
  }

  getEvaluation(): EvaluationThreshold {
    return this.config.thresholds.evaluation;
  }

  getTiming(): TimingThreshold {
    return this.config.thresholds.timing;
  }

  getResource(): ResourceThreshold {
    return this.config.thresholds.resource;
  }

  getError(): ErrorThreshold {
    return this.config.thresholds.error;
  }
}
