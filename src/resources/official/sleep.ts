import { CollectionResource } from '../base.js';
import type { Sleep } from '../../models/sleep.js';

export class SleepResource extends CollectionResource<Sleep> {
  constructor(client: ConstructorParameters<typeof CollectionResource>[0]) {
    super(client, '/activity/sleep');
  }
}
