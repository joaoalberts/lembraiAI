import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Frame } from './components/Frame';
import { Configuracoes, Mapa } from './screens/EmBreve';
import { Lembretes } from './screens/Lembretes';
import { NovoLembrete } from './screens/NovoLembrete';
import { Onboarding } from './screens/Onboarding';
import { Sucesso } from './screens/Sucesso';
import { StoreProvider } from './state/store';

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Frame>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/lembretes" element={<Lembretes />} />
            <Route path="/novo" element={<NovoLembrete />} />
            <Route path="/sucesso" element={<Sucesso />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/config" element={<Configuracoes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Frame>
      </StoreProvider>
    </BrowserRouter>
  );
}
