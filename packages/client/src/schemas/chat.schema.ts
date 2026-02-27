import { z } from "zod";

export const promptSchema = z.string()
  // eslint-disable-next-line no-control-regex
  .transform((val) => val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
  .pipe(
    z.string()
      .min(2, "Message must be at least 2 characters.")
      .max(1000, "Message cannot exceed 1000 characters.")
  );
