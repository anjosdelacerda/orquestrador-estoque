import { useQuery } from "@tanstack/react-query";
import "./App.css";

interface StatusResponse {
  status: string;
  backend: string;
  database: string;
  timestamp: string;
}

const fetchStatus = async (): Promise<StatusResponse> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

function App() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["status"],
    queryFn: fetchStatus,
    refetchInterval: 15000,
  });

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <span className="brand-icon">📦</span>
          <h1>Orquestrador de Estoque</h1>
          <p className="subtitle">Lyncas — Infraestrutura Docker</p>
        </div>

        <div
          className={`status-panel ${isLoading ? "loading" : isError ? "error" : "success"}`}
        >
          {isLoading && (
            <div className="status-body">
              <div className="spinner" />
              <p>Conectando ao backend...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="status-body">
              <span className="status-icon">❌</span>
              <p className="status-title">Falha na conexão</p>
              <p className="status-detail">{(error as Error).message}</p>
            </div>
          )}

          {data && (
            <div className="status-body">
              <span className="status-icon">✅</span>
              <p className="status-title success-text">
                Docker executado com sucesso! Container do Frontend Conectado ao
                Backend, Banco de Dados Inicializado. Pronto para iniciar a
                codificação do checkout.
              </p>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Backend</span>
                  <span className="info-value">{data.backend}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Database</span>
                  <span className="info-value">{data.database}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Timestamp</span>
                  <span className="info-value">
                    {new Date(data.timestamp).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="footer">
          API: <code>{import.meta.env.VITE_API_URL}/api/status</code>
        </p>
      </div>
    </div>
  );
}

export default App;
