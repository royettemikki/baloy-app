export type Slate = { name: string; color: string } | null;

export type Candidate = {
  id: number;
  name: string;
  roleDescription: string;
  photoUrl: string | null;
  statement: string | null;
  ballotNumber: number;
  isIncumbent: boolean;
  slate: Slate;
};

export type Position = {
  id: number;
  title: string;
  seats: number;
  candidates: Candidate[];
};
export type Election = {
  id: number;
  title: string;
  closesAt: string;
  positions: Position[];
};
