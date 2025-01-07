"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import QuestionnaryService from "@/services/QuestionnaryService";
import { IQuestionnary } from "@/types/IQuestionnary";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ICreateAnswer } from "@/types/IAnswer";
import AnswerService from "@/services/AnswerService";
import { Pagination } from "@/components/Pagination";
import ModalSent from "@/components/ModalSent";
import ModalToken from "@/components/ModalToken";
import { toast } from "react-toastify";

const schema = z.object({
  answers: z.array(
    z.object({
      answerType: z.number().optional(),
      answer: z
        .union([z.string(), z.number(), z.boolean(), z.instanceof(File)])
        .optional(),
    })
  ),
});

type FormSchema = z.infer<typeof schema>;

export default function Home() {
  const { id } = useParams();
  const [openSent, setOpenSent] = useState(false);
  const [openToken, setOpenToken] = useState(false);
  const [questions, setQuestions] = useState<IQuestionnary>();
  const [respondentId, setRespondentId] = useState<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  const watchAnswers = useWatch({
    control,
    name: "answers",
  });

  const isFormComplete = watchAnswers?.every(
    (answer) => answer.answer !== undefined && answer.answer !== ""
  );

  const getQuestions = async () => {
    try {
      const res = await QuestionnaryService.GetById(Number(id));
      setQuestions(res);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async () => {
    try {
      await QuestionnaryService.PutComplete(Number(id));
      setOpenSent(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitAnswer = async (data: FormSchema) => {
    if (!questions) return;
    const payloads = data.answers.map((answer, index) => {
      const question = questions.questions[index];

      const payload: ICreateAnswer = {
        questionId: question.id,
        questionaryRespondentId: respondentId!,
        value: answer.answer?.toString() || "",
        questionaryId: Number(id),
      };

      if (question.answerType === 2 && answer.answer instanceof File) {
        return AnswerService.PostFile(answer.answer, question.id).then(
          (resUrl) => {
            payload.value = resUrl.result;
            return payload;
          }
        );
      }

      return Promise.resolve(payload);
    });

    try {
      const resolvedPayloads = await Promise.all(payloads);
      await Promise.all(
        resolvedPayloads.map((payload) => AnswerService.Post(payload))
      );
      toast.success("Respostas salvas com sucesso");
    } catch (error) {
      console.log("Error submitting or updating answers", error);
    }
  };

  useEffect(() => {
    getQuestions();
    setOpenToken(true);
  }, []);

  useEffect(() => {
    const fetchFilesAndReset = async () => {
      if (!questions) return;

      const answers = await Promise.all(
        questions.questions.map(async (q) => {
          if (q.answerType === 2 && q.answer[0]?.value) {
            const response = await fetch(q.answer[0]?.value);
            const blob = await response.blob();
            const fileName = q.answer[0]?.value.split("/").pop() || "file";
            const file = new File([blob], fileName, { type: blob.type });
            if (fileInputRef.current) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              fileInputRef.current.files = dataTransfer.files;
            }

            return { answer: file };
          }

          return {
            answer:
              q.answerType === 1
                ? q.answer[q.answer.length - 1]?.value.toString()
                : q.answerType === 3
                ? Number(q.answer[q.answer.length - 1]?.value)
                : q.answerType === 4
                ? q.options?.find(
                    (x) => q.answer[q.answer.length - 1]?.value === x
                  )
                : q.answer[q.answer.length - 1]?.value,
          };
        })
      );

      reset({ answers });
    };

    fetchFilesAndReset();
  }, [questions, reset]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-2 w-full bg-[#F8F7F9]">
      <main className="flex flex-col items-center justify-start px-2 md:px-20 text-center max-w-[1200px] w-full mt-10">
        <form className="w-full">
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
                {x.answerType === 2 &&
                  Array.from({ length: x.maxFiles ?? 0 }).map(
                    (_, fileIndex) => (
                      <Controller
                        key={fileIndex}
                        name={`answers.${index}.answer`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={fileInputRef}
                            type="file"
                            className="mt-4 bg-transparent"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file);
                            }}
                          />
                        )}
                      />
                    )
                  )}
                {x.answerType === 3 && (
                  <div className="mt-4 flex flex-col gap-5">
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
                              onChange={() => {
                                field.onChange(num);
                              }}
                            />
                          )}
                        />
                        {num === 1 && "1 - Nada confiante"}
                        {num === 2 && "2 - Pouco confiante"}
                        {num === 3 && "3 - Neutro"}
                        {num === 4 && "4 - Confiante"}
                        {num === 5 && "5 - Muito confiante"}
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
                            checked={field.value === option}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              field.onChange(isChecked ? option : "");
                            }}
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
          <button
            type="button"
            onClick={handleSubmit(onSubmitAnswer)}
            className="fixed bottom-10 right-10 p-2 bg-blue-800 text-white rounded shadow-lg"
          >
            Salvar Respostas
          </button>
          <div className="w-full flex justify-end mt-4">
            <button
              disabled={!isFormComplete}
              type="button"
              onClick={() => {
                onSubmit();
              }}
              className="mt-4 p-2 bg-blue-500 text-white rounded"
            >
              Enviar formulário
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
