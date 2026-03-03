import { FC, ReactNode, useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./Styles.module.scss";
import MinimizedIcon from '../../assets/minimized.svg'


const CallWidgetPortal: FC<{ toggleMinimize: (e: React.MouseEvent | React.TouchEvent) => void, children: ReactNode }> = ({ toggleMinimize, children }) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const widgetRef = useRef<HTMLDivElement>(null);
    const offset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const getBoundedPosition = useCallback((clientX: number, clientY: number) => {
        if (!widgetRef.current) return { x: 0, y: 0 };

        const rect = widgetRef.current.getBoundingClientRect();
        const padding = 10;

        let newX = clientX - offset.current.x;
        let newY = clientY - offset.current.y;

        newX = Math.max(padding, Math.min(newX, window.innerWidth - rect.width - padding));
        newY = Math.max(padding, Math.min(newY, window.innerHeight - rect.height - padding));

        return { x: newX, y: newY };
    }, []);

    const handleStart = (clientX: number, clientY: number, target: EventTarget) => {
        if ((target as HTMLElement).closest('button') || (target as HTMLElement).closest(`.${styles.customWidget__expandButton}`)) {
            return;
        }

        setIsDragging(true);
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            offset.current = {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };
        }
    };

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;
        const boundedPos = getBoundedPosition(clientX, clientY);
        setPosition(boundedPos);
    }, [isDragging, getBoundedPosition]);

    const handleEnd = () => setIsDragging(false);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

        if (isDragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", handleEnd);
            window.addEventListener("touchmove", onTouchMove, { passive: false });
            window.addEventListener("touchend", handleEnd);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", handleEnd);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", handleEnd);
        };
    }, [isDragging, handleMove]);

    const dynamicStyle: React.CSSProperties = position ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        transform: 'none'
    } : {};

    const widget = (
        <div 
            ref={widgetRef}
            className={styles.customWidget} 
            style={dynamicStyle}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY, e.target)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target)}
        >
            {children}
            <div 
                onClick={(e) => toggleMinimize(e)} 
                className={styles.customWidget__expandButton}
                role="button"
            >
                <MinimizedIcon />
            </div>
        </div>
    );

    return mounted ? createPortal(widget, document.body) : null;
};

export default CallWidgetPortal