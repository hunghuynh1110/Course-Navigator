import type { Assessment } from "./assessment";

export type CourseRawData = {
  code: string;
  title: string;
  level: string;
  description: string;
  units: number;
  assessments: Assessment[];
  prerequisites_text: string;
  prerequisites_list: string[];
  incompatible_list: string[];
};

export type Course = {
  id: string;
  title: string;
  raw_data: CourseRawData;
};
