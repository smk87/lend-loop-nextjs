'use client';

import React from 'react';
import { Flex as AntDFlex, FlexProps as AntDFlexProps } from 'antd';

export type FlexProps = AntDFlexProps;

export const Flex: React.FC<FlexProps> = (props) => {
    return <AntDFlex {...props} />;
};
