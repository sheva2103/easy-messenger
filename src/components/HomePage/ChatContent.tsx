import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
import ListMessages from "./ListMessage";
import { setChat } from "../../store/slices/setChatIDSlice";
import ChatMenu from "./ChatMenu";
import MessageInputField from "./MessageInputField";
import Preloader from '../../assets/preloader.svg'
import { Chat } from "../../types/types";
import { SHOW_CHANNEL_INFO, SHOW_USER_INFO } from "../../constants/constants";
import ShowNameChat from "./ShowNameChat";
import { closeBar } from "../../store/slices/appSlice";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import CallIcon from '../../assets/telephone-fill.svg'
import { openModalCalls } from "../../store/slices/callsSlice";

const SubscribersComponent: FC = () => {

    const subscribers = useAppSelector(state => state.app.selectedChannel?.listOfSubscribers)
    const { t } = useTypedTranslation()

    return (
        <span className={styles.subscribers}>
            {t('subscribers')}:  <span style={{ fontWeight: 500 }}>{subscribers?.length || 0}</span>
        </span>
    );
}

const OnlineStatusComponent: FC = () => {
    const status = useAppSelector(state => state.app.onlineStatusSelectedUser)
    const isSelectedMessages = useAppSelector(state => state.app.selectedMessages)
    const { t } = useTypedTranslation()

    if (isSelectedMessages?.length) return null

    if (status?.isOnline) return (
        <span className={styles.subscribers}>
            <span style={{ fontWeight: 500 }}>{t('online')}</span>
        </span>
    )

    return (
        <span className={styles.subscribers}>
            {t('wasOnline')}:  <span style={{ fontWeight: 500 }}>{status?.formatted}</span>
        </span>
    )
}

const CallButton: FC<{ isChannel: boolean, callerUid: string }> = ({ isChannel, callerUid }) => {

    const isShowCheckbox = useAppSelector(state => state.app.showCheckbox)
    const isOpen = useAppSelector(state => state.calls.isOpen)
    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const caller = useAppSelector(state => state.app.currentUser)
    const callee = useAppSelector(state => state.app.selectedChat)

    const dispatch = useAppDispatch()
    const startCall = () => {
        dispatch(openModalCalls({
            mode: null,
            callerUid,
            roomId: null,
            callInfo: { caller, callee }
        }))
    }

    if (isOpen || isShowCheckbox || isChannel || isFavorites) return null

    return (
        <div className={styles.contentHeader__callButton}>
            <div className={styles.item}>
                <button onClick={startCall}>
                    <CallIcon fontSize={'1rem'} />
                </button>
            </div>
        </div>
    )
}


const HeaderChat: FC<{ selectedChat: Chat }> = ({ selectedChat }) => {

    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const dispatch = useAppDispatch()
    const { t } = useTypedTranslation()
    const closeChat = () => {
        dispatch(setChat(null))
    }
    const isChannel = !!selectedChat?.channel
    const menuIsOpen = useAppSelector(state => !!state.app.menu.menuChild)
    const handleClick = () => {
        if (isChannel) dispatch(closeBar(SHOW_CHANNEL_INFO))
        else if (isFavorites) return
        else dispatch(closeBar(SHOW_USER_INFO))
    }

    useEffect(() => {
        window.history.pushState({ page: "custom" }, "", "");
        const listener = (event: PopStateEvent) => {            
            if(!menuIsOpen) {
                closeChat()
                window.history.pushState({ page: "custom" }, "", "");
            }
        };
        window.addEventListener("popstate", listener);
        return () => window.removeEventListener("popstate", listener)
    }, [menuIsOpen]); //временный костыль. ПЕРЕПИСАТЬ !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1

    return (
        <header>
            <div className={styles.closeIcon} onClick={closeChat}>
                <ArrowLeftIcon cursor={'pointer'} />
            </div>
            <div className={styles.contentHeader}>
                <div className={styles.contentHeader__selectedChat}>
                    <span onClick={handleClick} style={{ cursor: 'pointer' }}>
                        {!isFavorites ?
                            <ShowNameChat /> 
                        :
                            t('favorites')}
                    </span>
                    {selectedChat?.channel ?
                        <SubscribersComponent />
                        :
                        isFavorites ? null : <OnlineStatusComponent />
                    }
                </div>
                {/* {!isChannel && <CallRoomComponent />} */}
                <CallButton isChannel={isChannel} callerUid={selectedChat.uid} />
                <ChatMenu selectedChat={selectedChat} />
            </div>
        </header>
    )
}


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const { t } = useTypedTranslation()

    if (!selectedChat) {
        return (
            <div className={classNames(styles.contentContainer, { [styles.notSelected]: !selectedChat })}>
                <span>{t('selectChat')}...</span>
            </div>
        )
    }

    console.log('chat content render')


    return (
        <div className={classNames(styles.contentContainer, { [styles.showContent]: selectedChat })}>
            <div className={styles.header}>
                <HeaderChat selectedChat={selectedChat} />
            </div>
            <div className={styles.chatWindow}>
                <main>
                    <ListMessages />
                    <MessageInputField selectedChat={selectedChat} />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;