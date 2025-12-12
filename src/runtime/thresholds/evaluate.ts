import { Thresholds } from './thresholds.js';

export type EvaluationResult = 'PASS' | 'FAIL' | 'RETRY';

export class ThresholdEvaluator {
  constructor(private thresholds: Thresholds) {}

  evaluateScore(score: number): EvaluationResult {
    const evaluation = this.thresholds.getEvaluation();

    if (score >= evaluation.pass_score) {
      return 'PASS';
    } else if (score >= evaluation.retry_score) {
      return 'RETRY';
    } else {
      return 'FAIL';
    }
  }

  shouldRetry(retryCount: number): boolean {
    const evaluation = this.thresholds.getEvaluation();
    return retryCount < evaluation.max_retries;
  }

  shouldBackoff(consecutiveFailures: number): boolean {
    const error = this.thresholds.getError();
    return consecutiveFailures >= error.max_consecutive_failures;
  }

  getBackoffDelay(attempt: number): number {
    const error = this.thresholds.getError();
    return Math.pow(error.backoff_multiplier, attempt) * 1000;
  }

  isWithinResourceLimits(currentTasks: number, memoryMb: number): boolean {
    const resource = this.thresholds.getResource();
    return (
      currentTasks <= resource.max_concurrent_tasks &&
      memoryMb <= resource.max_memory_mb
    );
  }
}
