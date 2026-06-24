import "dotenv/config";
import { task } from "@renderinc/sdk/workflows";
interface User {
  [id: number]: {
    id: number;
    name: string;
  };
}
export const users: User = {
  1: { id: 1, name: "Alice" },
  2: { id: 2, name: "Bob" },
  3: { id: 3, name: "Jhon" },
  4: { id: 4, name: "Jane" },
};

export const calculateSquare = task(
  { name: "calculateSquare" },
  function calculateSquare(a: number): number {
    return a * a;
  },
);

export const capitalize = task(
  { name: "capitalize" },
  function capitalize(str: string): string {
    return str.toUpperCase();
  },
);

export const add = task({ name: "add" }, function add(a: number, b: number): number {
  return a + b;
});

export const getUserById = task(
  { name: "getUserById" },
  function getUserById(id: number): { id: number; name: string } | null {
    return users[id] || null;
  },
);

export const addUser = task(
  { name: "addUser" },
  function addUser(id: number, name: string): { id: number; name: string } {
    const newUser = { id, name };
    users[id] = newUser;
    return newUser;
  },
);

export const giveScoreToUser = task(
  { name: "giveScoreToUser" },
  function giveScoreToUser(
    id: number,
    score: number,
  ): { id: number; name: string; score: number } | null {
    const user = users[id];
    if (user) {
      return { ...user, score };
    }
    return null;
  },
);


