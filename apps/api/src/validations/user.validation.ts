import { z } from "zod";

const skillsSchema = z.object({
  languages: z.array(z.string()).min(1, "At least one skill is required"),
  interests: z.string().min(10, "Please provide more details about yourself"),
});

export const createUserSkillsSchema = skillsSchema;
export const updateUserSkillsSchema = skillsSchema;
