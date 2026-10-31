'use client';

import { ConfigProvider, ThemeConfig } from 'antd';
import { PropsWithChildren } from 'react';

const defaultThemeConfig: ThemeConfig = {
    // Override tokens to modify theme
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    return (
        <ConfigProvider theme={defaultThemeConfig}>{children}</ConfigProvider>
    );
};
