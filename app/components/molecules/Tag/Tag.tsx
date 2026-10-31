'use client';

import React from 'react';
import { Tag as AntDTag, TagProps as AntDTagProps } from 'antd';
import type { CheckableTagProps as AntDCheckableTagProps } from 'antd/es/tag';

export type TagProps = AntDTagProps;
export type CheckableTagProps = AntDCheckableTagProps;

export const CheckableTag: React.FC<CheckableTagProps> = ({ ...props }) => {
    return <AntDTag.CheckableTag {...props} />;
};

export interface TagComponent extends React.FC<TagProps> {
    CheckableTag: typeof CheckableTag;
}

export const Tag: TagComponent = ({ ...props }) => {
    return <AntDTag {...props} />;
};

Tag.CheckableTag = CheckableTag;

