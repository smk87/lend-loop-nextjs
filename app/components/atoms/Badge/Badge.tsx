'use client';

import React from 'react';
import { Badge as AntDBadge, BadgeProps as AntDBadgeProps } from 'antd';

export type BadgeProps = AntDBadgeProps;

export const Badge: React.FC<BadgeProps> = ({ ...props }) => {
    return <AntDBadge {...props} />;
};

