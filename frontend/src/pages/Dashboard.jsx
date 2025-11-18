import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/buttons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setButtons(response.data);
    } catch (error) {
      console.error('Error fetching buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este botão?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/buttons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchButtons();
    } catch (error) {
      alert('Erro ao excluir botão');
    }
  };

  const copyScript = (buttonId) => {
    const scriptUrl = `${window.location.origin}/api/script/${buttonId}`;
    const scriptCode = `<script src="${scriptUrl}"></script>`;
    
    navigator.clipboard.writeText(scriptCode).then(() => {
      alert('Código copiado! Cole no seu site.');
    });
  };

  if (loading) {
    return <div className="dashboard-loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1>ChatButtons</h1>
            <div className="header-actions">
              <span className="user-name">Olá, {user?.name}</span>
              <button onClick={logout} className="btn btn-secondary">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-actions">
            <h2>Meus Botões</h2>
            <Link to="/buttons/new" className="btn btn-primary">
              + Criar novo botão
            </Link>
          </div>

          {buttons.length === 0 ? (
            <div className="empty-state">
              <p>Você ainda não criou nenhum botão.</p>
              <Link to="/buttons/new" className="btn btn-primary">
                Criar primeiro botão
              </Link>
            </div>
          ) : (
            <div className="buttons-grid">
              {buttons.map((button) => (
                <div key={button.id} className="button-card">
                  <div className="button-header">
                    <h3>{button.name}</h3>
                    <div className="button-badges">
                      <span className="badge badge-type">{button.link_type === 'whatsapp' ? 'WhatsApp' : 'URL'}</span>
                      <span className="badge badge-position">{button.position}</span>
                    </div>
                  </div>
                  
                  <div className="button-info">
                    <p><strong>Link:</strong> {button.link_url}</p>
                    <p><strong>Posição:</strong> {
                      button.position === 'bottom-right' ? 'Inferior Direito' :
                      button.position === 'bottom-left' ? 'Inferior Esquerdo' :
                      button.position === 'top-right' ? 'Superior Direito' :
                      'Superior Esquerdo'
                    }</p>
                  </div>

                  <div className="button-actions">
                    <button
                      onClick={() => copyScript(button.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Copiar código
                    </button>
                    <Link
                      to={`/buttons/${button.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(button.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

