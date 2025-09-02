export type TypeClass = 'primary' | 'secondary' | 'tertiary' | 'accent';
export type Size = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

type ContentWithText ={ text: string, icon?: string }
type ContentWithoutText ={ text?: string, icon: string }
type Content = ContentWithText | ContentWithoutText;

export type ButtonProps = Content & {
    typeClass: TypeClass;
    size?: Size;
    type?: ButtonType;
    disabled?: boolean;
    loading?: boolean;
    id?: string;
    name?: string;
    className?: string;
    styleAttr?: string;
    showIcon?: boolean;
    showText?: boolean;
    action?: () => unknown | Promise<unknown>;
}


