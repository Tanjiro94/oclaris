class AppError extends Error {
    statusCode: number;
    code: string | null;
    errors: Record<string, string> | null;

    constructor(message: string, statusCode: number, options?: { code?: string, errors?: Record<string, string> }) {
        super(message);
        this.statusCode = statusCode;
        if(options?.code) {
            this.code = options.code;
        } else {
            this.code = null;
        }
        if(options?.errors) {
            this.errors = options.errors;
        } else {
            this.errors = null;
        }
    }
}

export default AppError;