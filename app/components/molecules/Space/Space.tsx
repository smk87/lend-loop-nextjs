'use client';

import React from 'react';
import { Space as AntDSpace, SpaceProps as AntDSpaceProps } from 'antd';

export type SpaceProps = AntDSpaceProps;

export const Space: React.FC<SpaceProps> = (props) => {
    return <AntDSpace {...props} />;
};
