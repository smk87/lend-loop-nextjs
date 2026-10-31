'use client';

import React from 'react';
import { Switch as AntDSwitch, SwitchProps as AntDSwitchProps } from 'antd';

export type SwitchProps = AntDSwitchProps;

export const Switch: React.FC<SwitchProps> = ({ ...props }) => {
    return <AntDSwitch {...props} />;
};

