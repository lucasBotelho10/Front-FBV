import React, { useState, useEffect } from 'react';
import './App.css';
import './Navbar.css';
import { Link, useHistory } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function App() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [adicionarMedicamento, setAdicionarMedicamento] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novoMedicamento, setNovoMedicamento] = useState({ nome: '', tipo: '', medicamento: '', dosagem: '', horario: '', observacao: '' });
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [mobile, setMobile] = useState(false);
  const [funcaoUsuario, setFuncaoUsuario] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const history = useHistory();


  useEffect(() => {
    // Recupera a função do usuário do localStorage e a converte para minúsculas
    const funcao = localStorage.getItem('funcaoUsuario')?.toLowerCase();
    setFuncaoUsuario(funcao);
  }, []);

  useEffect(() => {
    async function fetchMedicamentos() {
      try {
        const response = await fetch('http://localhost:8080/api/medicamentos');
        const data = await response.json();
        setMedicamentos(data);
      } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
      }
    }
    fetchMedicamentos();
  }, []);

  useEffect(() => {
    async function fetchPacientes() {
      try {
        const response = await fetch('http://localhost:8080/api/pacientes');
        const data = await response.json();
        setPacientes(data);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
      }
    }
    fetchPacientes();
  }, []);

  const handleAdicionarMedicamento = () => {
    setAdicionarMedicamento(true);
  };

  const handleSalvarMedicamento = async () => {
    try {
      setAdicionarMedicamento(false);
      if (editandoId !== null) {
        await fetch(`http://localhost:8080/api/medicamentos/${editandoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoMedicamento),
        });
        setMedicamentos(prevMedicamentos =>
          prevMedicamentos.map(medicamento => (medicamento.id === editandoId ? novoMedicamento : medicamento))
        );
        setEditandoId(null);
        showPopup('Medicamento editado com sucesso!');
      } else {
        const response = await fetch('http://localhost:8080/api/medicamentos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoMedicamento),
        });
        const data = await response.json();
        setMedicamentos(prevMedicamentos => [...prevMedicamentos, data]);
        showPopup('Medicamento adicionado com sucesso!');
      }
      setNovoMedicamento({ nome: '', tipo: '', medicamento: '', dosagem: '', horario: '', observacao: '' });
    } catch (error) {
      console.error('Erro ao salvar medicamento:', error);
    }
  };

  const handleExcluirMedicamento = async id => {
    try {
      await fetch(`http://localhost:8080/api/medicamentos/${id}`, {
        method: 'DELETE',
      });
      setMedicamentos(prevMedicamentos => prevMedicamentos.filter(medicamento => medicamento.id !== id));
      showPopup('Medicamento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir medicamento:', error);
    }
  };

  const handleEditarMedicamento = medicamento => {
    setEditandoId(medicamento.id);
    setNovoMedicamento({ ...medicamento });
  };

  const handleChange = (field, value) => {
    setNovoMedicamento(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePesquisa = e => {
    setTermoPesquisa(e.target.value);
  };

  const medicamentosFiltrados = medicamentos.filter(medicamento =>
    medicamento.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  );
  const handleLogout = () => {
    // Limpa o localStorage e redireciona para a tela de login
    localStorage.clear();
    history.push('/login');
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    const columnHeaders = ['Nome', 'Medicamento', 'Tipo', 'Dosagem', 'Horario', 'Observação'];
    const rows = medicamentosFiltrados.map(medicamentos => [medicamentos.nome, medicamentos.medicamento, medicamentos.tipo, medicamentos.dosagem, medicamentos.horario, medicamentos.observacao]);

    doc.autoTable({
      head: [columnHeaders],
      body: rows,
    });

    doc.save('pacientes.pdf');
  };

  const showPopup = (message) => {
    setPopupMessage(message);
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 3000);
  };
  return (
    <>
      <div className={`popup ${popupVisible ? 'show' : ''}`}>
        {popupMessage}
      </div>
      <nav className='navbar'>
        <h3 className='logo'>SpecialCare</h3>
        <ul className={mobile ? "nav-links-mobile" : "nav-links"} onClick={() => setMobile(false)}>
          <Link to='/pacientes' className='pacientes'>
            <li>Pacientes</li>
          </Link>
          <Link to='/alimentos' className='alimentos'>
            <li>Alimentos</li>
          </Link>
          <Link to='/medicamentos' className='medicamentos'>
            <li>Medicamentos</li>
          </Link>
          <Link to='/diario' >
            <li>Diario</li>
          </Link>
          <Link to='/funcionarios' className={`funcionarios ${(funcaoUsuario === 'medico' || funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
            <li>Funcionarios</li>
          </Link>
          <Link to='/usuarios' className={`usuarios ${(funcaoUsuario === 'medico' || funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
            <li>Usuarios</li>
          </Link>
          <li onClick={handleLogout} className='logout'>Logout</li> {/* Adiciona um botão de logout */}
        </ul>
        <button className='mobile-menu-icon' onClick={() => setMobile(!mobile)}>
          {mobile ? <ImCross /> : <FaBars />}
        </button>
      </nav>
      <div className="App table-wrapper">
        <h1>Tabela de Medicamentos</h1>
        <input
          className='pesquisar'
          type="text"
          placeholder="Pesquisar por nome do paciente..."
          value={termoPesquisa}
          onChange={handlePesquisa}
        />
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Medicamento</th>
              <th>Tipo</th>
              <th>Dosagem</th>
              <th>Horário</th>
              <th>Observação</th>
              <th className={` ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicamentosFiltrados.map(medicamento => (
              <tr key={medicamento.id}>
                <td>
                  {editandoId === medicamento.id ? (
                    <select
                      value={novoMedicamento.nome}
                      onChange={e => handleChange('nome', e.target.value)}
                    >
                      <option value="">Selecione o paciente</option>
                      {pacientes.map(paciente => (
                        <option key={paciente.id} value={paciente.nome}>{paciente.nome}</option>
                      ))}
                    </select>
                  ) : (
                    medicamento.nome
                  )}
                </td>
                <td>
                  {editandoId === medicamento.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoMedicamento.medicamento}
                      onChange={e => handleChange('medicamento', e.target.value)}
                    />
                  ) : (
                    medicamento.medicamento
                  )}
                </td>
                <td>
                  {editandoId === medicamento.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoMedicamento.tipo}
                      onChange={e => handleChange('tipo', e.target.value)}
                    />
                  ) : (
                    medicamento.tipo
                  )}
                </td>
                <td>
                  {editandoId === medicamento.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoMedicamento.dosagem}
                      onChange={e => handleChange('dosagem', e.target.value)}
                    />
                  ) : (
                    medicamento.dosagem
                  )}
                </td>
                <td>
                  {editandoId === medicamento.id ? (
                    <input
                      className='campoTabela'
                      type="time"
                      value={novoMedicamento.horario}
                      onChange={e => handleChange('horario', e.target.value)}
                    />
                  ) : (
                    medicamento.horario
                  )}
                </td>
                <td>
                  {editandoId === medicamento.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoMedicamento.observacao}
                      onChange={e => handleChange('observacao', e.target.value)}
                    />
                  ) : (
                    medicamento.observacao
                  )}
                </td>
                <td className={`acoes ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
                  {editandoId === medicamento.id ? (
                    <button className="salvar" onClick={handleSalvarMedicamento}>
                      Salvar
                    </button>
                  ) : (
                    <>
                      <button className="editar" onClick={() => handleEditarMedicamento(medicamento)}>
                        Editar
                      </button>
                      <button className="excluir" onClick={() => handleExcluirMedicamento(medicamento.id)}>
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {adicionarMedicamento && (
              <tr>
                <td>
                  <select
                    className='campoTabela'
                    value={novoMedicamento.nome}
                    onChange={e => handleChange('nome', e.target.value)}
                  >
                    <option value="">Selecione o paciente</option>
                    {pacientes.map(paciente => (
                      <option key={paciente.id} value={paciente.nome}>{paciente.nome}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoMedicamento.medicamento}
                    onChange={e => handleChange('medicamento', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoMedicamento.tipo}
                    onChange={e => handleChange('tipo', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoMedicamento.dosagem}
                    onChange={e => handleChange('dosagem', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="time"
                    value={novoMedicamento.horario}
                    onChange={e => handleChange('horario', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoMedicamento.observacao}
                    onChange={e => handleChange('observacao', e.target.value)}
                  />
                </td>
                <td className="acoes">
                  <button className="salvar" onClick={handleSalvarMedicamento}>
                    Salvar
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div class="botoes">
          <button className={`adicionar ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`} onClick={handleAdicionarMedicamento}>
            Adicionar Medicamento
          </button>
          <button className="pdf" onClick={gerarPDF}>
            Gerar PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
