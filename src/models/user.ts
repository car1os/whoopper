export interface UserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface BodyMeasurement {
  height_meter: number;
  weight_kilogram: number;
  max_heart_rate: number;
}
