import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { FC, useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { closeModalCalls, openModalCalls, setStatusMod } from "../../store/slices/callsSlice";
import styles from './Styles.module.scss'
import DialogComponent from "../Settings/DialogComponent";
import CallRoom from "./CallRoom";
import { messagesAPI } from "../../API/api";
import { CallEndStatus } from "../../types/types";

const CallsListenerComponent: FC = () => {

    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(state => state.calls.isOpen)
    const myUid = useAppSelector(state => state.app.currentUser.uid)
    const callerUid = useAppSelector(state => state.calls.callerUid)
    const messageInfo = useAppSelector(state => state.calls.callInfo)
    const [isMinimized, setIsMinimized] = useState(false)

    const close = (click?: boolean) => {
        setIsMinimized(false)
        dispatch(closeModalCalls(click))
    }

    const endCallFunc = (callDuration: string | null, status: CallEndStatus | null) => {
        if(messageInfo) {
            setTimeout(() => {
                messagesAPI.sendCallInfoMessage({...messageInfo, callDuration, status})
            }, 2000)
        }
        close()
    }

    const startCallFunc = (mode: "incoming" | "outgoing") => {
        dispatch(setStatusMod(mode))
    }

    const toggleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMinimized(prev => !prev)
    }

    useEffect(() => {
        const callRef = doc(db, 'calls', myUid);
        return onSnapshot(callRef, snapshot => {

            if (!snapshot.exists()) { 
                close()
                return;
            }

            const data = snapshot.data();
            if (data?.status === 'incoming') {
                console.log(data)
                dispatch(openModalCalls({
                    mode: 'incoming',
                    callerUid: data.from,
                    roomId: data.roomId,
                }))
            }
        });
    }, [myUid]);

    return ( 
        <div className={styles.container}>
            <DialogComponent isOpen={isOpen} onClose={() => close(true)} isMinimized={isMinimized} >
                <CallRoom 
                    myUid={myUid}
                    calleeUid={callerUid} 
                    endCallFunc={endCallFunc} 
                    startCallFunc={startCallFunc}
                    toggleMinimize={toggleMinimize}
                    isMinimized={isMinimized}
                />
            </DialogComponent>
        </div>
    )
}

export default CallsListenerComponent;