'use client';

import { ConfigProvider, ThemeConfig } from 'antd';
import { PropsWithChildren } from 'react';

const defaultThemeConfig: ThemeConfig = {
    token: {
        colorPrimary: '#059669', // Emerald primary
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorInfo: '#059669',
        borderRadius: 8,
        fontFamily:
            'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        colorTextBase: '#1f2937', // Softened dark slate
        colorBgBase: '#ffffff',
    },
    components: {
        Layout: {
            headerBg: '#001529',
            headerColor: '#ffffff',
            headerPadding: '0 24px',
            headerHeight: 64,
        },
        Button: {
            borderRadius: 8,
            controlHeight: 38,
            fontWeight: 500,
        },
        Card: {
            borderRadiusLG: 12,
        },
        Input: {
            borderRadius: 8,
            controlHeight: 38,
        },
        Select: {
            borderRadius: 8,
            controlHeight: 38,
        },
        Modal: {
            borderRadiusLG: 12,
        },
        Tag: {
            borderRadiusSM: 6,
        },
        Menu: {
            darkItemBg: '#001529',
            darkItemSelectedBg: 'rgba(5, 150, 105, 0.25)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
            darkItemColor: 'rgba(255, 255, 255, 0.85)',
            darkItemSelectedColor: '#34d399',
            darkItemHoverColor: '#ffffff',
            horizontalItemBorderRadius: 6,
            fontSize: 14,
        },
    },
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    return (
        <ConfigProvider theme={defaultThemeConfig}>{children}</ConfigProvider>
    );
};
