import { CollectionResource } from '../base.js';
import type { Cycle } from '../../models/cycle.js';
import type { Recovery } from '../../models/recovery.js';
import type { Sleep } from '../../models/sleep.js';

export class CycleResource extends CollectionResource<Cycle> {
  constructor(client: ConstructorParameters<typeof CollectionResource>[0]) {
    super(client, '/cycle');
  }

  async getRecovery(cycleId: number): Promise<Recovery> {
    return this.client.get<Recovery>(`/cycle/${cycleId}/recovery`);
  }

  async getSleep(cycleId: number): Promise<Sleep> {
    return this.client.get<Sleep>(`/cycle/${cycleId}/sleep`);
  }
}
