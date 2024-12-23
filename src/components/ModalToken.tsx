"use client";

import { Button } from "@/components/ui/button";
import Modal from "./Modal";
import { useState } from "react";
import { Input } from "./ui/input";
import TokenService from "@/services/TokenService";
import { toast } from "react-toastify";

const ModalToken = ({
  open,
  setOpen,
  id,
  setRespondentId,
}: {
  open: boolean;
  setOpen: () => void;
  id: number;
  setRespondentId: (id: number) => void;
}) => {
  const [token, setToken] = useState<string>("");

  const handleSubmit = async () => {
    try {
      const res = await TokenService.GetById(token, id);
      toast.success("Token valido");
      setRespondentId(res.id);
      setOpen();
    } catch (error) {
      console.log(error);
      toast.error("Token invalido");
    }
  };

  return (
    <Modal isOpen={open} onClose={setOpen}>
      <div className="bg-white py-6 px-3 md:px-10 rounded-2xl flex flex-col gap-2 max-h-screen h-full md:h-auto md:w-auto w-full md:min-w-[350px] md:max-w-[500px]">
        <h2 className="text-[#050506] font-semibold text-2xl">
          Questionário Alpinista
        </h2>
        <p className="text-[#636267]">Digite um token valido</p>
        <Input
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
          }}
        />
        <div className="flex flex-col-reverse gap-4">
          <Button
            onClick={() => handleSubmit()}
            className="bg-[#3088EE] text-white font-semibold mt-6"
          >
            Ir para o Alpinistas
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalToken;
