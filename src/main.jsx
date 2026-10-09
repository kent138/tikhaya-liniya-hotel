import React from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import App from './App';
import './styles.css';
class ErrorBoundary extends React.Component {state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<main className="error-page"><h1>Небольшая пауза</h1><p>Не удалось открыть страницу. Ваши сохранённые бронирования остались в браузере.</p><button onClick={()=>location.reload()}>Обновить страницу</button></main>:this.props.children;}}
const root=document.getElementById('root');
const app=<ErrorBoundary><App/></ErrorBoundary>;
if(root.hasChildNodes())hydrateRoot(root,app);else createRoot(root).render(app);
