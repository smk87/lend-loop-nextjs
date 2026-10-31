'use client';

import React from 'react';
import { Tooltip as AntDTooltip, TooltipProps as AntDTooltipProps } from 'antd';

export type TooltipProps = AntDTooltipProps;

export const Tooltip: React.FC<TooltipProps> = ({ ...props }) => {
    return <AntDTooltip {...props} />;
};

