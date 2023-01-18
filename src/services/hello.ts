import { Hello } from "../models/business/hello";

export const HelloService = async (): Promise<Hello> => {
  return {
    message: "Hello World!",
  };
};
