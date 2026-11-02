'use client';

import React from 'react';
import {
    Input as AntDInput,
    InputProps as AntDInputProps,
    InputRef,
} from 'antd';
import type { SearchProps as AntDSearchProps, TextAreaProps as AntDTextAreaProps, PasswordProps as AntDPasswordProps } from 'antd/es/input';

export type InputProps = AntDInputProps;
export type SearchProps = AntDSearchProps;
export type TextAreaProps = AntDTextAreaProps;
export type PasswordProps = AntDPasswordProps;
export type { InputRef };

export const Search: React.FC<SearchProps> = ({ ...props }) => {
    return <AntDInput.Search {...props} />;
};

export const TextArea: React.FC<TextAreaProps> = ({ ...props }) => {
    return <AntDInput.TextArea {...props} />;
};

export const Password: React.FC<PasswordProps> = ({ ...props }) => {
    return <AntDInput.Password {...props} />;
};

export interface InputComponent extends React.ForwardRefExoticComponent<InputProps & React.RefAttributes<InputRef>> {
    Search: typeof Search;
    TextArea: typeof TextArea;
    Password: typeof Password;
}

const BaseInput = React.forwardRef<InputRef, InputProps>(({ ...props }, ref) => {
    return <AntDInput ref={ref} {...props} />;
});
BaseInput.displayName = 'Input';

export const Input = BaseInput as unknown as InputComponent;
Input.Search = Search;
Input.TextArea = TextArea;
Input.Password = Password;

