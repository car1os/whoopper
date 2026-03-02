export interface HeartRateSample {
  time: string;
  bpm: number;
}

export interface HeartRateTimeSeries {
  samples: HeartRateSample[];
  start: string;
  end: string;
}
