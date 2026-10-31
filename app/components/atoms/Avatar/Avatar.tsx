'use client';

import React from 'react';
import { Avatar as AntDAvatar, AvatarProps as AntDAvatarProps } from 'antd';
import type { GroupProps as AntDGroupProps } from 'antd/es/avatar';

export type AvatarProps = AntDAvatarProps;
export type AvatarGroupProps = AntDGroupProps;

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ ...props }) => {
    return <AntDAvatar.Group {...props} />;
};

export interface AvatarComponent extends React.FC<AvatarProps> {
    Group: typeof AvatarGroup;
}

export const Avatar: AvatarComponent = ({ ...props }) => {
    return <AntDAvatar {...props} />;
};

Avatar.Group = AvatarGroup;

