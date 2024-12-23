"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import QuestionnaryService from "@/services/QuestionnaryService";
import { IQuestionnary } from "@/types/IQuestionnary";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ICreateAnswer } from "@/types/IAnswer";
import AnswerService from "@/services/AnswerService";
import { Pagination } from "@/components/Pagination";
import ModalSent from "@/components/ModalSent";
import ModalToken from "@/components/ModalToken";

const schema = z.object({
  answers: z.array(
    z.object({
      answerType: z.number().optional(),
      answer: z.union(
        [z.string(), z.number(), z.boolean(), z.instanceof(File)],
        {
          message: "Todas as respostas são obrigatórias",
        }
      ),
    }),
    { message: "Todas as respostas são obrigatórias" }
  ),
});

type FormSchema = z.infer<typeof schema>;

export default function Home() {
  const { id } = useParams();
  const [openSent, setOpenSent] = useState(false);
  const [openToken, setOpenToken] = useState(false);
  const [questions, setQuestions] = useState<IQuestionnary>();
  const [respondentId, setRespondentId] = useState<number>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  const getQuestions = async () => {
    try {
      const res = await QuestionnaryService.GetById(Number(id));
      setQuestions(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getQuestions();
    setOpenToken(true);
  }, []);

  const onSubmit = async (data: FormSchema) => {
    data.answers.map(async (x, index) => {
      if (questions?.questions[index].answerType === 2) {
        try {
          const resUrl = await AnswerService.PostFile(
            x.answer as File,
            questions?.questions[index].id as number
          );

          const answers: ICreateAnswer = {
            questionId: questions?.questions[index].id as number,
            questionaryRespondentId: Number(respondentId),
            value: resUrl.result,
          };

          await AnswerService.Post(answers);
          setOpenSent(true);
        } catch (error) {
          console.log(error);
        }
      } else {
        const answers: ICreateAnswer = {
          questionId: questions?.questions[index].id as number,
          questionaryRespondentId: Number(respondentId),
          value: `${x.answer}`,
        };
        try {
          await AnswerService.Post(answers);
          setOpenSent(true);
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-2 w-full bg-[#F8F7F9]">
      <main className="flex flex-col items-center justify-start px-2 md:px-20 text-center max-w-[1200px] w-full mt-10">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="p-2 bg-[#FFFFFF] text-start rounded-xl w-full font-bold text-[#636267] text-3xl">
            {questions?.title}
          </h1>
          <div className="flex flex-col gap-5 w-full mt-8">
            {questions?.questions.map((x, index) => (
              <div key={index} className="p-8 bg-[#FFFFFF] rounded-xl">
                <div className="flex justify-between w-full">
                  <h3 className="text-[#050506] font-semibold">
                    {index + 1} - {x.title}
                  </h3>
                </div>
                {x.answerType === 1 && (
                  <Controller
                    name={`answers.${index}.answer`}
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        value={
                          typeof field.value === "string" ||
                          typeof field.value === "number"
                            ? field.value
                            : ""
                        }
                        placeholder="Resposta de texto"
                        className="w-full bg-transparent mt-4"
                      />
                    )}
                  />
                )}
                {x.answerType === 2 && (
                  <Controller
                    name={`answers.${index}.answer`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        type="file"
                        className="mt-4 bg-transparent"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    )}
                  />
                )}
                {x.answerType === 3 && (
                  <div className="mt-4 flex gap-5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <label
                        key={num}
                        className="flex items-center gap-1 text-center text-lg"
                      >
                        <Controller
                          name={`answers.${index}.answer`}
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="radio"
                              value={num}
                              checked={field.value === num}
                              onChange={() => field.onChange(num)}
                            />
                          )}
                        />
                        {num}
                      </label>
                    ))}
                  </div>
                )}
                {x.answerType === 4 &&
                  x.options?.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="flex justify-start items-start gap-2 mt-4"
                    >
                      <Controller
                        name={`answers.${index}.answer`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={
                              typeof field.value === "boolean" ||
                              field.value instanceof File
                                ? ""
                                : (field.value as string | number | undefined)
                            }
                            type="checkbox"
                            className="bg-transparent w-5 h-5 rounded-full"
                          />
                        )}
                      />
                      <label className="items-center text-[#636267] font-semibold">
                        {option}
                      </label>
                    </div>
                  ))}
                {errors.answers?.[index]?.answer && (
                  <span className="text-red-500 text-sm">
                    {errors.answers?.[index]?.answer.message}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              className="mt-4 p-2 bg-blue-500 text-white rounded"
            >
              Enviar
            </button>
          </div>
        </form>
        <Pagination
          pageIndex={1}
          perPage={10}
          handlePage={() => {}}
          totalCount={10}
        />
      </main>
      <ModalSent
        open={openSent}
        setOpen={() => {
          setOpenSent(!openSent);
        }}
      />
      <ModalToken
        open={openToken}
        setOpen={() => {
          setOpenToken(!openToken);
        }}
        id={Number(id)}
        setRespondentId={setRespondentId}
      />
    </div>
  );
}
