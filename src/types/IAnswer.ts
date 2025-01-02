export interface IAnswer {
  id: number;
  questionId: number;
  questionaryRespondentId: number;
  value: string;
}

export interface ICreateAnswer {
  questionId: number;
  questionaryId: number;
  questionaryRespondentId: number;
  value: string;
}
