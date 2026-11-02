'use client';

import { ConfigProvider } from 'antd';
import { PropsWithChildren } from 'react';
import { defaultThemeConfig } from './theme';

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    return (
        <ConfigProvider theme={defaultThemeConfig}>{children}</ConfigProvider>
    );
};

export * from './theme';
