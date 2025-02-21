import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast as BsToast } from "bootstrap";
import { removeMessage } from "../redux/toastSlice";

export default function Toast(){
    const messages = useSelector((state)=>state.toast.messages);
    
    const toastRefs = useRef({});

    const dispatch = useDispatch();

    const TOAST_DURATION = 2000;

    useEffect(()=>{
        // 當 messages 改變時，讓新加進來的 Toast 顯示
        messages.forEach((message)=>{
            const toastElement = toastRefs.current[message.id];
            if (toastElement){
                const toastInstance = new BsToast(toastElement);
                toastInstance.show();
                
                // Toast 訊息 x 秒後自動關閉
                setTimeout(()=>{
                    dispatch(removeMessage(message.id))
                },TOAST_DURATION);
            }
        })
    },[messages])

    // 手動關閉 Toast 訊息
    const handleDismiss = (message_id) => {
        dispatch(removeMessage(message_id))
    }

    return(
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
            {messages.map((message)=>{
                    return(
                        <div 
                            key={message.id}
                            ref={ (el)=> toastRefs.current[message.id] = el } 
                            className="toast" 
                            role="alert" 
                            aria-live="assertive" 
                            aria-atomic="true"
                        >
                            <div className={`toast-header ${message.status === 'success' ? 'bg-success': 'bg-danger'} text-white`}>
                                <strong className="me-auto">{ message.status === 'success' ? '成功': '失敗'}</strong>
                                <button
                                    onClick={ () => handleDismiss(message.id)}
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="toast-body">{message.text}</div>
                        </div>
                    )        
                })}
        </div>          
    )
}