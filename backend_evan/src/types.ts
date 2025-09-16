export type Year =
  | 'freshman'
  | 'sophomore'
  | 'junior'
  | 'senior'
  | 'graduate'
  | 'other';

export type CommuterStatus =
  | 'commuter_other_city'
  | 'commuter_huntsville'
  | 'non_commuter';

export interface AuthedRequestUser {
  id: string;
  email: string;
}