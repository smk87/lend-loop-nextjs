'use client';

import React from 'react';
import { Select as AntDSelect, SelectProps as AntDSelectProps } from 'antd';

export type SelectProps<ValueType = any, OptionType extends Record<string, any> = Record<string, any>> = AntDSelectProps<ValueType, OptionType>;

export const Select = <ValueType = any, OptionType extends Record<string, any> = Record<string, any>>({
    ...props
}: SelectProps<ValueType, OptionType>) => {
    return <AntDSelect {...props} />;
};

export type { DefaultOptionType, BaseOptionType } from 'antd/es/select';

