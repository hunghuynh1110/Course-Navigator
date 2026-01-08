export type Assessment = {
  category: string;
  assessment_task: string;
  weight: number;
  due_date: string;
  flags: {
    is_hurdle: boolean;
    is_identity_verified: boolean;
    is_in_person: boolean;
    is_team_based: boolean;
  };
};
