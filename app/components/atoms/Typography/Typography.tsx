'use client';

import React from 'react';
import {
    Typography as AntDTypography,
    TypographyProps as AntDTypographyProps,
} from 'antd';
import type { TitleProps as AntDTitleProps } from 'antd/es/typography/Title';
import type { TextProps as AntDTextProps } from 'antd/es/typography/Text';
import type { ParagraphProps as AntDParagraphProps } from 'antd/es/typography/Paragraph';
import type { LinkProps as AntDLinkProps } from 'antd/es/typography/Link';

export type TypographyProps = AntDTypographyProps;
export type TitleProps = AntDTitleProps;
export type TextProps = AntDTextProps;
export type ParagraphProps = AntDParagraphProps;
export type LinkProps = AntDLinkProps;

export const Title: React.FC<TitleProps> = ({ ...props }) => {
    return <AntDTypography.Title {...props} />;
};

export const Text: React.FC<TextProps> = ({ ...props }) => {
    return <AntDTypography.Text {...props} />;
};

export const Paragraph: React.FC<ParagraphProps> = ({ ...props }) => {
    return <AntDTypography.Paragraph {...props} />;
};

export const Link: React.FC<LinkProps> = ({ ...props }) => {
    return <AntDTypography.Link {...props} />;
};

export interface TypographyComponent extends React.FC<TypographyProps> {
    Title: typeof Title;
    Text: typeof Text;
    Paragraph: typeof Paragraph;
    Link: typeof Link;
}

export const Typography: TypographyComponent = ({ ...props }) => {
    return <AntDTypography {...props} />;
};

Typography.Title = Title;
Typography.Text = Text;
Typography.Paragraph = Paragraph;
Typography.Link = Link;

