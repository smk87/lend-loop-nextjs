'use client';

import React from 'react';
import { Popconfirm as AntDPopconfirm, PopconfirmProps as AntDPopconfirmProps } from 'antd';

export type PopconfirmProps = AntDPopconfirmProps;

export const Popconfirm: React.FC<PopconfirmProps> = ({ ...props }) => {
    return <AntDPopconfirm {...props} />;
};

