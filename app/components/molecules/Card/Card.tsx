'use client';

import React from 'react';
import { Card as AntDCard, CardProps as AntDCardProps } from 'antd';
import type { CardMetaProps as AntDCardMetaProps } from 'antd/es/card';

export type CardProps = AntDCardProps;
export type CardMetaProps = AntDCardMetaProps;

export const CardMeta: React.FC<CardMetaProps> = ({ ...props }) => {
    return <AntDCard.Meta {...props} />;
};

export interface CardComponent extends React.FC<CardProps> {
    Meta: typeof CardMeta;
}

export const Card: CardComponent = ({ ...props }) => {
    return <AntDCard {...props} />;
};

Card.Meta = CardMeta;

