'use client';

import React from 'react';
import { Spin as AntDSpin, SpinProps as AntDSpinProps } from 'antd';

export type SpinProps = AntDSpinProps;

export const Spin: React.FC<SpinProps> = ({ ...props }) => {
    return <AntDSpin {...props} />;
};

