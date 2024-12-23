import { api } from "./api";
import { HttpStatusCode } from "axios";
import { NotFoundError, UnexpectedError, ValidationError } from "@/errors";
import { IQuestionaryRespondents } from "@/types/IQuestionnary";
const endpoint = "/QuestionaryRespondents";

const TokenService = {
  GetById: async (token: string, id: number) => {
    try {
      const res = await api.get(`${endpoint}/Verify-Token/${token}/${id}`);
      return res.data as IQuestionaryRespondents;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      switch (error.statusCode) {
        case HttpStatusCode.BadRequest:
          throw new ValidationError(error.body.erros);
        case HttpStatusCode.NotFound:
          throw new NotFoundError();
        default:
          throw new UnexpectedError();
      }
    }
  },
};

export default TokenService;
