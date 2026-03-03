import { useState, useEffect, FC } from 'react';
import ringtone from '../../assets/ringtone.mp3'
import calling from '../../assets/calling.mp3'
import { useWebRTCCall } from '../../hooks/useWebRTCCall';
import { profileAPI } from '../../API/api';
import styles from './Styles.module.scss'
import { CallEndStatus } from '../../types/types';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import MicMute from '../../assets/mic-mute-fill.svg'
import MicOn from '../../assets/mic-fill.svg'
import VolumeOn from '../../assets/volume-down-fill.svg'
import VolumeMute from '../../assets/volume-mute-fill.svg'
import MinimizedIcon from '../../assets/minimized.svg'
import CallWidgetPortal from './CallWidget';



const ShowCallerName: FC<{ id: string }> = ({ id }) => {
    const [name, setName] = useState('')

    useEffect(() => {
        if (id) {
            profileAPI.getCurrentInfo(id)
                .then(data => setName(data.displayName))
                .catch(err => {
                    console.log(err)
                    setName('Неизвестно')
                })
        }
    }, [id])

    return (
        <div className={styles.name}>
            <p>{name}</p>
        </div>
    )
}

export const CallRoom = ({ myUid, calleeUid, endCallFunc, startCallFunc, toggleMinimize, isMinimized }: {
    myUid: string,
    calleeUid: string,
    endCallFunc?: (callDuration: string, status: CallEndStatus) => void,
    startCallFunc: (mode: "incoming" | "outgoing") => void
    toggleMinimize: (e: React.MouseEvent) => void
    isMinimized: boolean
}) => {
    const { callState, errorMessage, callDuration, callerUid,
        startCall, acceptCall, rejectCall, endCall, formatDuration,
        remoteAudioRef, ringtoneRef, incomingRef,
        isMicMuted, isSpeakerMuted, toggleMic, toggleSpeaker } = useWebRTCCall(myUid, calleeUid, startCallFunc, endCallFunc)

    const { t } = useTypedTranslation()

    const connectedButtons = (
        <>
            {callState === 'connected' &&
                <div className={styles.buttons__settings} onClick={toggleSpeaker}>
                    {isSpeakerMuted ? <VolumeMute fontSize={'1.7rem'} /> : <VolumeOn fontSize={'1.7rem'} />}
                </div>
            }
            <button onClick={endCall} style={{ backgroundColor: 'hsl(0, 98%, 64%)' }}>{t('call.reject')}</button>
            {callState === 'connected' &&
                <div className={styles.buttons__settings} onClick={toggleMic}>
                    {isMicMuted ? <MicMute fontSize={'1.3rem'} /> : <MicOn fontSize={'1.3rem'} />}
                </div>
            }
        </>
    )

    return (
        <div className={styles.wrapper} style={{ display: 'flex', flexDirection: 'column' }}>
            {callState === 'connected' &&
                <div className={styles.minimized}>
                    <MinimizedIcon
                        fontSize={'1.2rem'}
                        role='button'
                        onClick={toggleMinimize}
                    />
                </div>
            }
            <h4 className={styles.callState}>
                {
                    callState === 'idle' ? t('call.idle') :
                        callState === 'calling' ? t('call.calling') :
                            callState === 'incoming' ? t('call.incoming') :
                                callState === 'connected' ? t('call.connected') :
                                    callState === 'error' ? 'Ошибка' : t('call.error')
                }
            </h4>

            {errorMessage &&
                <p style={{ color: 'hsl(0, 98%, 64%)', textAlign: 'center' }}>
                    {errorMessage === 'errorMicro' ?
                        t(`call.errorMicro`)
                        :
                        errorMessage
                    }
                </p>}

            <ShowCallerName id={callerUid ? callerUid : calleeUid} />

            {callState === 'connected' && (
                <div className={styles.duration}>
                    <p>{formatDuration(callDuration)}</p>
                </div>
            )}

            <audio ref={remoteAudioRef} autoPlay playsInline />
            <audio ref={ringtoneRef} src={calling} loop />
            <audio ref={incomingRef} src={ringtone} loop />



            <div className={styles.buttons}>
                {callState === 'idle' && (
                    <button onClick={startCall} style={{ marginTop: 10 }}>{t('call.call')}</button>
                )}

                {callState === 'incoming' && (
                    <>
                        <button onClick={acceptCall} >{t('call.accept')}</button>
                        <button onClick={rejectCall} style={{ backgroundColor: 'hsl(0, 98%, 64%)' }}>{t('call.reject')}</button>
                    </>
                )}

                {(callState === 'connected' || callState === 'calling') && (
                    connectedButtons
                )}
            </div>
            {isMinimized && <CallWidgetPortal toggleMinimize={toggleMinimize}>
                {connectedButtons}
            </CallWidgetPortal>}
        </div>
    );
};


export default CallRoom

