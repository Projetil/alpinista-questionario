import { IAnswer } from "./IAnswer";

export interface IQuestionnary {
  id: number;
  createdAt: string;
  updatedAt: string | null;
  title: string;
  customerId: number;
  questions: IQuestion[];
  type: number;
  limitDate: string;
}

export interface IPagedQuestionnary {
  totalItems: number;
  items: IQuestionnary[];
}

export interface IQuestion {
  id: number;
  questionaryId: number;
  title: string;
  maxFiles?: string;
  maxSize?: string;
  options?: string[];
  answerType: number;
  answer: IAnswer[];
}

export interface ICreateQuestionnary {
  title: string;
  customerId: number;
  companyId: number;
  questions: ICreateQuestion[];
  respondents: ICreateQuestionaryRespondents[];
  type: number;
  limitDate: string;
}

export interface ICreateQuestionaryRespondents {
  email: string;
  name: string;
}

export interface IQuestionaryRespondents {
  id: number;
  questionaryId: number;
  isCompleted: boolean;
  token: string;
  email: string;
  name: string;
}

export interface ICreateQuestion {
  title: string;
  answerType: number;
  maxFiles?: string;
  maxSize?: string;
  options?: string[];
}

export interface IQuestionDtoForm {
  id: number;
  title: string;
  type: string;
  fileSize?: number;
  maxFiles?: number;
  options?: string[];
}

export enum AnswerType {
  "Resposta curta" = 1,
  "Arquivo" = 2,
  "1 a 5" = 3,
  "Opções" = 4,
}
