import { api } from "./api";
import { HttpStatusCode } from "axios";
import { NotFoundError, UnexpectedError, ValidationError } from "@/errors";
import { IAnswer, ICreateAnswer } from "@/types/IAnswer";

const endpoint = "/Answers";

const AnswerService = {
  Post: async (company: ICreateAnswer) => {
    try {
      const res = await api.post(`${endpoint}`, company);
      return res.data as IAnswer;
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
  PostFile: async (file: File, anwserId: number) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/AwsFiles/answer/${anwserId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data as { result: string };
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

export default AnswerService;
