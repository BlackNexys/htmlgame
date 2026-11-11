export type AssemblyParameter =
    | {type: 'number'; default: number; min: number; max: number; step?: number}
    | {type: 'boolean'; default: boolean}
    | {type: 'choice'; default: string; options: readonly string[]};
export type ParameterSchema = Record<string, AssemblyParameter>;
export type ParameterValues = Record<string, number | boolean | string>;
export type ValuesOf<S extends ParameterSchema> = {[K in keyof S]: S[K]['type'] extends 'number' ? number : S[K]['type'] extends 'boolean' ? boolean : string};

export function resolveParameters(schema: ParameterSchema, input: ParameterValues = {}): ParameterValues {
    for (const key of Object.keys(input)) if (!Object.hasOwn(schema, key)) throw Error(`Unknown assembly parameter ${key}`);
    const result: ParameterValues = {};
    for (const [key, field] of Object.entries(schema)) {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(key)) throw Error(`Invalid parameter name ${key}`);
        const value = Object.hasOwn(input, key) ? input[key] : field.default;
        if (field.type === 'number') {
            const step = field.step ?? 1;
            if (![field.min, field.max, step].every(Number.isFinite) || step <= 0 || field.min > field.max ||
                typeof value !== 'number' || !Number.isFinite(value) || value < field.min || value > field.max ||
                Math.abs((value - field.min) / step - Math.round((value - field.min) / step)) > 1e-8) throw Error(`Parameter ${key} must be between ${field.min} and ${field.max}, step ${step}`);
        } else if (field.type === 'boolean') {
            if (typeof value !== 'boolean') throw Error(`Parameter ${key} must be boolean`);
        } else if (field.type === 'choice') {
            if (!Array.isArray(field.options) || !field.options.length || typeof value !== 'string' || !field.options.includes(value)) throw Error(`Parameter ${key} must be one of its choices`);
        } else throw Error(`Unknown parameter type for ${key}`);
        result[key] = value;
    }
    return result;
}
