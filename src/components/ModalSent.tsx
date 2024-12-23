"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

const ModalSent = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: () => void;
}) => {
  const navigate = useRouter();
  return (
    <Modal isOpen={open} onClose={setOpen}>
      <div className="bg-white py-6 px-3 md:px-10 rounded-2xl flex flex-col gap-2 max-h-screen h-full md:h-auto md:w-auto w-full md:min-w-[350px] md:max-w-[500px]">
        <h2 className="text-[#050506] font-semibold text-2xl">
          Questionário enviado com sucesso
        </h2>
        <p className="text-[#636267]">
          Obrigado por responder o questionário, sua resposta foi enviada com
          sucesso.
        </p>
        <div className="flex flex-col-reverse gap-4">
          <Button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-white text-[#3088EE] border border-[#3088EE] font-semibold"
          >
            Responder novamente
          </Button>
          <Button
            onClick={() =>
              navigate.push("https://main.d3p420ewzuedbs.amplifyapp.com/")
            }
            className="bg-[#3088EE] text-white font-semibold mt-6"
          >
            Ir para o Alpinistas
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalSent;
