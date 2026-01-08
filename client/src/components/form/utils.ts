import z, { type ZodTypeAny } from "zod";
import type { FormFieldItem } from "./types";

export const generateFormFields = (fields: FormFieldItem[]) => {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of fields) {
    if (field.hidden) continue;
    shape[field.name] = generateFormField(field);
  }

  return z.object(shape);
};

const generateFormField = (field: FormFieldItem): ZodTypeAny => {
  switch (field.type) {
    case "text":
    case "password":
    case "area":
      return z.string().optional();

    case "number":
      return z.number().optional();

    case "select":
    case "radio":
      return z.any().optional();

    case "date":
    case "time":
      return z.string().optional();

    case "upload":
      return z.any().optional();

    default:
      return z.any().optional();
  }
};
