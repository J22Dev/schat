import z from "zod";

export const userRegisterModel = z.object({
  body: z.object({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    userName: z.string().min(6).max(20),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/g,
        "One Upper, One Lower, One Special, One Number, 8 - 16 Characters"
      ),
  }),
});

export type UserRegisterModel = z.infer<typeof userRegisterModel>["body"];

export const userLoginModel = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/g,
        "One Upper, One Lower, One Special, One Number, 8 - 16 Characters"
      ),
  }),
});

export type UserLoginModel = z.infer<typeof userLoginModel>["body"];
