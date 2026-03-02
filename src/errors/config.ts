import { WhoopError } from './base.js';

export class ConfigurationError extends WhoopError {
  constructor(
    message = 'Invalid configuration',
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = 'ConfigurationError';
  }
}
