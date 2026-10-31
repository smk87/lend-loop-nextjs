'use client';

import React from 'react';
import { Divider as AntDDivider, DividerProps as AntDDividerProps } from 'antd';

export type DividerProps = AntDDividerProps;

export const Divider: React.FC<DividerProps> = ({ ...props }) => {
    return <AntDDivider {...props} />;
};

