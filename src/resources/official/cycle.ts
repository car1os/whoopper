import { CollectionResource } from '../base.js';
import type { Cycle } from '../../models/cycle.js';
import type { Recovery } from '../../models/recovery.js';
import type { Sleep } from '../../models/sleep.js';

export class CycleResource extends CollectionResource<Cycle> {
  constructor(client: ConstructorParameters<typeof CollectionResource>[0]) {
    super(client, '/v1/cycle');
  }

  async getRecovery(cycleId: number): Promise<Recovery> {
    return this.client.get<Recovery>(`/v1/cycle/${cycleId}/recovery`);
  }

  async getSleep(cycleId: number): Promise<Sleep> {
    return this.client.get<Sleep>(`/v1/cycle/${cycleId}/sleep`);
  }
}
