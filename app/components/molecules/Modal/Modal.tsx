'use client';

import React from 'react';
import { Modal as AntDModal, ModalProps as AntDModalProps } from 'antd';

export type ModalProps = AntDModalProps;

export interface ModalComponent extends React.FC<ModalProps> {
    info: typeof AntDModal.info;
    success: typeof AntDModal.success;
    error: typeof AntDModal.error;
    warning: typeof AntDModal.warning;
    confirm: typeof AntDModal.confirm;
    destroyAll: typeof AntDModal.destroyAll;
}

export const Modal: ModalComponent = ({ ...props }) => {
    return <AntDModal {...props} />;
};

Modal.info = AntDModal.info;
Modal.success = AntDModal.success;
Modal.error = AntDModal.error;
Modal.warning = AntDModal.warning;
Modal.confirm = AntDModal.confirm;
Modal.destroyAll = AntDModal.destroyAll;

