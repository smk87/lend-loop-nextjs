'use client';

import { Button as AntDButton, ButtonProps as AntDButtonProps } from 'antd';

export type ButtonProps = AntDButtonProps;

export const Button: React.FC<ButtonProps> = ({ ...props }) => {
    return <AntDButton {...props} />;
};
