import { BaseResource } from '../base.js';
import type { UserProfile, BodyMeasurement } from '../../models/user.js';

export class UserResource extends BaseResource {
  async getProfile(): Promise<UserProfile> {
    return this.client.get<UserProfile>('/v1/user/profile/basic');
  }

  async getBodyMeasurement(): Promise<BodyMeasurement> {
    return this.client.get<BodyMeasurement>('/v1/user/measurement/body');
  }

  async revokeAccess(): Promise<void> {
    await this.client.delete<void>('/v1/user/access');
  }
}
