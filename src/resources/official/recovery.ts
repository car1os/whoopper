import { CollectionResource } from '../base.js';
import type { Recovery } from '../../models/recovery.js';

export class RecoveryResource extends CollectionResource<Recovery> {
  constructor(client: ConstructorParameters<typeof CollectionResource>[0]) {
    super(client, '/v1/recovery');
  }
}
