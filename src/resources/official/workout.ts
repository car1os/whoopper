import { CollectionResource } from '../base.js';
import type { Workout } from '../../models/workout.js';

export class WorkoutResource extends CollectionResource<Workout> {
  constructor(client: ConstructorParameters<typeof CollectionResource>[0]) {
    super(client, '/activity/workout');
  }
}
