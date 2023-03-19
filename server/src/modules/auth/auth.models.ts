import z from "zod";

export const userRegisterModel = z.object({
  body: z.object({}),
});

export type UserRegisterModel = z.infer<typeof userRegisterModel>["body"];
