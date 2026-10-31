'use client';

import React from 'react';
import { Empty as AntDEmpty, EmptyProps as AntDEmptyProps } from 'antd';

export type EmptyProps = AntDEmptyProps;

export interface EmptyComponent extends React.FC<EmptyProps> {
    PRESENTED_IMAGE_DEFAULT: React.ReactNode;
    PRESENTED_IMAGE_SIMPLE: React.ReactNode;
}

export const Empty: EmptyComponent = ({ ...props }) => {
    return <AntDEmpty {...props} />;
};

Empty.PRESENTED_IMAGE_DEFAULT = AntDEmpty.PRESENTED_IMAGE_DEFAULT;
Empty.PRESENTED_IMAGE_SIMPLE = AntDEmpty.PRESENTED_IMAGE_SIMPLE;

