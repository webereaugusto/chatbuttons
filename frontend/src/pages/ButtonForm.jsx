import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ButtonForm.css';

const ButtonForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    link_type: 'url',
    link_url: '',
    whatsapp_ddd: '',
    whatsapp_number: '',
    position: 'bottom-right'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchButton();
    }
  }, [id]);

  const fetchButton = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/buttons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const button = response.data;
      setFormData({
        name: button.name,
        link_type: button.link_type,
        link_url: button.link_url || '',
        whatsapp_ddd: button.whatsapp_ddd || '',
        whatsapp_number: button.whatsapp_number || '',
        position: button.position
      });
    } catch (error) {
      alert('Erro ao carregar botão');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `/api/buttons/${id}` : '/api/buttons';
      const method = isEdit ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar botão');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-header">
          <h1>{isEdit ? 'Editar Botão' : 'Criar Novo Botão'}</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Voltar
          </button>
        </div>

        <div className="form-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome do Botão *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Curso Presencial EVP"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Link *</label>
              <select
                name="link_type"
                value={formData.link_type}
                onChange={handleChange}
                required
              >
                <option value="url">Inserir URL pronta</option>
                <option value="whatsapp">Criar link de WhatsApp</option>
              </select>
            </div>

            {formData.link_type === 'url' ? (
              <div className="form-group">
                <label>URL *</label>
                <input
                  type="url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleChange}
                  required
                  placeholder="https://exemplo.com"
                />
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>DDD *</label>
                    <input
                      type="text"
                      name="whatsapp_ddd"
                      value={formData.whatsapp_ddd}
                      onChange={handleChange}
                      required
                      placeholder="11"
                      maxLength="2"
                      pattern="[0-9]{2}"
                    />
                    <small>Ex: 11, 21, 85</small>
                  </div>

                  <div className="form-group">
                    <label>Número *</label>
                    <input
                      type="text"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                      required
                      placeholder="987654321"
                      pattern="[0-9]{8,9}"
                    />
                    <small>Ex: 987654321 (8 ou 9 dígitos)</small>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Posição do Botão na Página *</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="bottom-right">Inferior Direito</option>
                <option value="bottom-left">Inferior Esquerdo</option>
                <option value="top-right">Superior Direito</option>
                <option value="top-left">Superior Esquerdo</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Botão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ButtonForm;

