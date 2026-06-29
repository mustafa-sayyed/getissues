import { z } from "zod";

export const saveUserSkillsSchema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  skillDetails: z.string().min(10, "Please provide more details about yourself"),
});
