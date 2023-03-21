import { z } from 'zod';
export const configSchema = z.object({
    matrix: z.array(z.object({
        version: z.array(z.string()),
        os_test: z.array(z.string()),
        test_case: z.array(z.string()),
    })),
});
export const inputPullRequestNumberSchema = z
    .string()
    .transform(numberString => +numberString);
//# sourceMappingURL=schema.js.map