import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

/**
 * LendLoop Design System Tokens
 * Single source of truth for the warm emerald & slate aesthetic.
 */
export const themeTokens = {
    colorPrimary: '#059669', // Emerald 600
    colorPrimaryHover: '#10b981', // Emerald 500
    colorPrimaryActive: '#047857', // Emerald 700
    colorPrimaryBg: '#ecfdf5', // Emerald 50
    colorPrimaryBorder: '#a7f3d0', // Emerald 200

    colorSuccess: '#10b981',
    colorSuccessBg: '#ecfdf5',
    colorWarning: '#f59e0b',
    colorWarningBg: '#fffbeb',
    colorError: '#ef4444',
    colorErrorBg: '#fef2f2',
    colorInfo: '#059669',
    colorInfoBg: '#ecfdf5',

    colorTextBase: '#1f2937', // Slate 800
    colorText: '#1f2937',
    colorTextHeading: '#111827', // Slate 900
    colorTextSecondary: '#4b5563', // Slate 600
    colorTextTertiary: '#9ca3af', // Slate 400
    colorTextQuaternary: '#d1d5db', // Slate 300

    colorBgBase: '#ffffff',
    colorBgLayout: '#f8fafc', // Slate 50
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',

    colorBorder: '#e5e7eb', // Slate 200
    colorBorderSecondary: '#f3f4f6', // Slate 100

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    fontFamily:
        'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Dark header / navigation surface
    headerBg: '#001529',
    headerBorder: '#1e293b',
    darkSurface: '#052e26',
};

export const defaultThemeConfig: ThemeConfig = {
    cssVar: { prefix: 'ant', key: 'app' },
    hashed: false,
    token: {
        colorPrimary: themeTokens.colorPrimary,
        colorPrimaryHover: themeTokens.colorPrimaryHover,
        colorPrimaryActive: themeTokens.colorPrimaryActive,
        colorPrimaryBg: themeTokens.colorPrimaryBg,
        colorPrimaryBorder: themeTokens.colorPrimaryBorder,

        colorSuccess: themeTokens.colorSuccess,
        colorWarning: themeTokens.colorWarning,
        colorError: themeTokens.colorError,
        colorInfo: themeTokens.colorInfo,

        colorTextBase: themeTokens.colorTextBase,
        colorText: themeTokens.colorText,
        colorTextHeading: themeTokens.colorTextHeading,
        colorTextSecondary: themeTokens.colorTextSecondary,
        colorTextTertiary: themeTokens.colorTextTertiary,
        colorTextQuaternary: themeTokens.colorTextQuaternary,

        colorBgBase: themeTokens.colorBgBase,
        colorBgLayout: themeTokens.colorBgLayout,
        colorBgContainer: themeTokens.colorBgContainer,
        colorBgElevated: themeTokens.colorBgElevated,

        colorBorder: themeTokens.colorBorder,
        colorBorderSecondary: themeTokens.colorBorderSecondary,

        borderRadius: themeTokens.borderRadius,
        borderRadiusLG: themeTokens.borderRadiusLG,
        borderRadiusSM: themeTokens.borderRadiusSM,
        fontFamily: themeTokens.fontFamily,

        // Custom design system surface & layout tokens
        headerBg: themeTokens.headerBg,
        headerBorder: themeTokens.headerBorder,
        darkSurface: themeTokens.darkSurface,
    } as unknown as ThemeConfig['token'],
    components: {
        Layout: {
            headerBg: themeTokens.headerBg,
            headerColor: '#ffffff',
            headerPadding: '0 24px',
            headerHeight: 64,
            bodyBg: themeTokens.colorBgLayout,
        },
        Button: {
            borderRadius: themeTokens.borderRadius,
            controlHeight: 38,
            fontWeight: 500,
            colorPrimary: themeTokens.colorPrimary,
            colorPrimaryHover: themeTokens.colorPrimaryHover,
            colorPrimaryActive: themeTokens.colorPrimaryActive,
        },
        Card: {
            borderRadiusLG: themeTokens.borderRadiusLG,
            colorBorderSecondary: themeTokens.colorBorder,
        },
        Input: {
            borderRadius: themeTokens.borderRadius,
            controlHeight: 38,
        },
        Select: {
            borderRadius: themeTokens.borderRadius,
            controlHeight: 38,
        },
        Modal: {
            borderRadiusLG: themeTokens.borderRadiusLG,
        },
        Tag: {
            borderRadiusSM: themeTokens.borderRadiusSM,
        },
        Alert: {
            borderRadiusLG: themeTokens.borderRadius,
        },
        Typography: {
            colorTextHeading: themeTokens.colorTextHeading,
            colorText: themeTokens.colorText,
            colorTextDescription: themeTokens.colorTextSecondary,
        },
        Menu: {
            darkItemBg: themeTokens.headerBg,
            darkItemSelectedBg: 'rgba(5, 150, 105, 0.25)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
            darkItemColor: 'rgba(255, 255, 255, 0.85)',
            darkItemSelectedColor: '#34d399',
            darkItemHoverColor: '#ffffff',
            horizontalItemBorderRadius: 6,
            fontSize: 14,
        },
        Tabs: {
            colorPrimary: themeTokens.colorPrimary,
            itemSelectedColor: themeTokens.colorPrimary,
            itemHoverColor: themeTokens.colorPrimaryHover,
        },
        Table: {
            headerBg: themeTokens.colorBgLayout,
            headerColor: themeTokens.colorTextSecondary,
            borderRadiusLG: themeTokens.borderRadiusLG,
        },
        DatePicker: {
            borderRadius: themeTokens.borderRadius,
            controlHeight: 38,
        },
        Popconfirm: {
            borderRadiusLG: themeTokens.borderRadiusLG,
        },
    },
};

/**
 * Client hook to access active Ant Design tokens inside components
 */
export const useThemeToken = () => {
    const { token } = theme.useToken();
    return token;
};
