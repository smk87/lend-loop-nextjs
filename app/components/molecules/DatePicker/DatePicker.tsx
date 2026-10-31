'use client';

import React from 'react';
import { DatePicker as AntDDatePicker, DatePickerProps as AntDDatePickerProps } from 'antd';
import type { RangePickerProps as AntDRangePickerProps } from 'antd/es/date-picker';

export type DatePickerProps = AntDDatePickerProps;
export type RangePickerProps = AntDRangePickerProps;

export const RangePicker: React.FC<RangePickerProps> = ({ ...props }) => {
    return <AntDDatePicker.RangePicker {...props} />;
};

export interface DatePickerComponent extends React.FC<DatePickerProps> {
    RangePicker: typeof RangePicker;
}

export const DatePicker: DatePickerComponent = ({ ...props }) => {
    return <AntDDatePicker {...props} />;
};

DatePicker.RangePicker = RangePicker;

