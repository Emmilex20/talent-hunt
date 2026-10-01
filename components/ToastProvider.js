"use client";
import{createContext,useCallback,useContext,useState}from"react";
const ToastContext=createContext(null);
export function ToastProvider({children}){const[toasts,setToasts]=useState([]);const toast=useCallback((message,type="success")=>{const id=Date.now()+Math.random();setToasts(x=>[...x,{id,message,type}]);setTimeout(()=>setToasts(x=>x.filter(t=>t.id!==id)),4500)},[]);return <ToastContext.Provider value={toast}>{children}<div className="toastStack" aria-live="polite">{toasts.map(t=><div key={t.id} className={`appToast ${t.type}`}><span className="toastIcon">{t.type==="error"?"!":"✓"}</span><div><strong>{t.type==="error"?"Something needs attention":"Done"}</strong><p>{t.message}</p></div><button onClick={()=>setToasts(x=>x.filter(v=>v.id!==t.id))} aria-label="Dismiss notification">×</button></div>)}</div></ToastContext.Provider>}
export function useToast(){return useContext(ToastContext)}
