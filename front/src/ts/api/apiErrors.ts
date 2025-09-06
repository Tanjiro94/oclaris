export type apiErrors = {
    message: string;
    code?: string;
    errors?: Record<string, string>;
}