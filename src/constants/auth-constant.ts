import { LoginForm } from "@/validations/auth-validation";
import { error } from "console";
import { email } from "zod";

export const INITIAL_LOGIN_FORM: LoginForm = {
  email: "",
  password: "",
};

export const INITIAL_STATE_LOGIN_FORM = {
  status: "idle",
  errors: {
    email: [],
    password: [],
    _form: [],
  },
};
