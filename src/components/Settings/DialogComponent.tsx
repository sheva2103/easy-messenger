import { Dialog } from "@mui/material";
import { cloneElement, FC, ReactElement, ReactNode } from "react";
import styles from './Settings.module.scss'
import CloseMenuIcon from '../../assets/closeDesktop.svg'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import stylesContacts from '../Contacts/Contacts.module.scss'

type Props = {
    children: ReactElement
    isOpen: boolean,
    onClose: (value: boolean) => void,
    isMinimized?: boolean
}

type ConfirmProps = {
    confirmFunc: () => void,
    handleClose?: () => void,
    text: string
}

const dialogStyle = styles.listStyle

export const ConfirmComponent: FC<ConfirmProps> = ({confirmFunc, handleClose, text}) => {
    const {t} = useTypedTranslation()
    return (
        <div className={styles.confirm}>
            <div className={styles.text}>
                <span>{text}</span>
            </div>
            <div className={styles.buttons}>
                <button onClick={confirmFunc}>{t("yes")}</button>
                <button onClick={handleClose}>{t("no")}</button>
            </div>
        </div>
    )
}

export const NotFoundChat: FC<{confirmFunc: () => void, user?: boolean, channel?: boolean}> = ({confirmFunc, user}) => {
    const {t} = useTypedTranslation()
    const typeChat = () => {
        if(user) return t('notFoundUser')
        return t('notFoundChannel')
    }
    return (
        <div className={styles.confirm}>
            <div className={styles.text}>
                <span>{typeChat()}</span>
            </div>
            <div className={styles.buttons}>
                <button onClick={confirmFunc}>{t("yes")}</button>
            </div>
        </div>
    )
}

export const LayoutDialogList: FC<{children: ReactElement}> = ({children}) => {

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: '4px', height: '100%' }}>
            <ul className={stylesContacts.list} style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', marginBottom: '4px' }}>
                {children}
            </ul>
        </div>
    )
}

const DialogComponent: FC<Props> = ({children, onClose, isOpen, isMinimized}) => {

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClose(false);
    };

    return (  
        <Dialog onClose={handleClose} open={isOpen} classes={{paper: dialogStyle}} sx={{display: isMinimized ? 'none' : 'block'}}>
            <div className={styles.close}><CloseMenuIcon cursor={'pointer'} fontSize={'1.3rem'} onClick={handleClose}/></div>
            {cloneElement(children, { handleClose })}
        </Dialog>
    );
}

export default DialogComponent;