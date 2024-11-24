export type FaveType = "comments" | "stories";

export interface FaveOptions {
  id: string;
  comments: boolean;
  p: number;
}

export type Fave = {
  id: number;
  url: string;
  type: string;
} & (
  | { user: string }
  | {
      title: string;
      hnUrl: string;
    }
);

export const MAX_RETRIES = 5;
