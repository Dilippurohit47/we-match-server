import { email, z } from "zod"; 

export const UserSignupSchema = z.object({
  email: z.string().email(),

  password: z.string().min(8),

  fullName: z.string().min(2),

  age: z.coerce.number().min(18).max(100),

  gender: z.enum(["Male", "Female", "Other"]),

  profession: z.string().min(2),

  city: z.string().min(2),

  country: z.string().min(2),

  landmark: z.string().optional(),

  oneLiner: z.string().max(120),

  bio: z.string().max(500),

  portfolio: z.string().url().optional(),

  skills: z
    .string()
    .transform((val) => val.split(" ").filter(Boolean)),

  subjects: z
    .string()
    .transform((val) => val.split(" ").filter(Boolean)),

  lookingFor: z.string(),

  meetupPreference: z.enum(["online", "offline", "both"]),

  maxDistance: z.number().min(1).max(100),

  minAge: z.number().min(18),

  maxAge: z.number().max(100),
  latitude:z.number(),
  longitude:z.number(),
});

export const UserSignInSchema = z.object({
    email: z.string().email(),
  password: z.string().min(8),
})

export type UserSignupInput = z.infer<typeof UserSignupSchema>;
export type UserSignInSchema = z.infer<typeof UserSignInSchema>
