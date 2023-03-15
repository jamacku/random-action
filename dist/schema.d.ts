import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    matrix: z.ZodObject<{
        version: z.ZodArray<z.ZodString, "many">;
        os_test: z.ZodArray<z.ZodString, "many">;
        test_case: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        version: string[];
        os_test: string[];
        test_case: string[];
    }, {
        version: string[];
        os_test: string[];
        test_case: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    matrix: {
        version: string[];
        os_test: string[];
        test_case: string[];
    };
}, {
    matrix: {
        version: string[];
        os_test: string[];
        test_case: string[];
    };
}>;
export declare const inputPullRequestNumberSchema: z.ZodEffects<z.ZodString, number, string>;
