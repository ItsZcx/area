import { createContext, useContext, useState } from "react";

export interface CreateForm {
    actionService: string;
    action: string;
    actionParams: { [key: string]: string };
    reactionService: string;
    reaction: string;
    reactionParams: { [key: string]: string };
  }  

interface CreateContextType {
  form: CreateForm;
  setForm: React.Dispatch<React.SetStateAction<CreateForm>>;
}

export const CreateContext = createContext<CreateContextType | undefined>(
  undefined
);

export function useCreateContext() {
  const context = useContext(CreateContext);

  if (!context) {
    throw new Error(
      "useCreateContext must be used within a CreateContext.Provider"
    );
  }

  return context;
}

export const CreateProvider = ({ children }: any) => {
  const [form, setForm] = useState<CreateForm>({
    actionService: '',
    action: '',
    actionParams: {},
    reactionService: '',
    reaction: '',
    reactionParams: {},
  });

  return (
    <CreateContext.Provider value={{ form, setForm }}>
      {children}
    </CreateContext.Provider>
  );
};
