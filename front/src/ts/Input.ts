export type type = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'primary' | 'secondary';

export type InputProps = {
    modelValue?: string;

    label?: string;
    placeholder?: string;
    size?: InputSize;
    type?: type;
    typeInput?: InputType;
    disabled?: boolean;
    loading?: boolean;
    id?: string;
    name?: string;
    className?: string;
    styleAttr?: string;
    autoComplete?: string;
    error?: boolean;

    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    onKeyUp?: (event: KeyboardEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    onKeyPress?: (event: KeyboardEvent) => void;
    onKeyup?: (event: KeyboardEvent) => void;
    onInput?: (event: Event) => void;
}