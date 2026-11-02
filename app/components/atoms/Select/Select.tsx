'use client';

import React from 'react';
import { Select as AntDSelect, SelectProps as AntDSelectProps } from 'antd';
import type { DefaultOptionType, BaseOptionType } from 'antd/es/select';

export type SelectProps<
    ValueType = unknown,
    OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> = AntDSelectProps<ValueType, OptionType>;

export const Select = <
    ValueType = unknown,
    OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>({
    ...props
}: SelectProps<ValueType, OptionType>) => {
    return <AntDSelect {...props} />;
};

export type { DefaultOptionType, BaseOptionType } from 'antd/es/select';
