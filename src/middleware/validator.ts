import { Context } from "hono";
import type { z, ZodError } from "zod";

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError; data: T };

export function validate<T>(result: Result<T>, c: Context) {
  if (!result.success) {
    const issue = result.error.issues[0];
    const inputName = issue.path[0] as string;
    let requiredType: string | undefined;
    if ("expected" in issue) {
      requiredType = (issue as any).expected; 
    }

    return c.json({
      message: `Input ${inputName} only allows type of ${requiredType}`,
    });
  }
}
