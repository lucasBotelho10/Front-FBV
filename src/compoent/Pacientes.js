import React, { useState, useEffect } from 'react';
import './App.css';
import './Navbar.css';
import { Link, useHistory } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function App() {
  const [pacientes, setPacientes] = useState([]);
  const [adicionarPaciente, setAdicionarPaciente] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novoPaciente, setNovoPaciente] = useState({ nome: '', idade: '', dieta: '', condicao: '', observacao: '' });
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [mobile, setMobile] = useState(false);
  const [funcaoUsuario, setFuncaoUsuario] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const funcao = localStorage.getItem('funcaoUsuario')?.toLowerCase();
    setFuncaoUsuario(funcao);
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

  const handleAdicionarPaciente = () => {
    setAdicionarPaciente(true);
  };

  const handleSalvarPaciente = async () => {
    try {
      setAdicionarPaciente(false);
      if (editandoId !== null) {
        await fetch(`http://localhost:8080/api/pacientes/${editandoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...novoPaciente,
            dieta: novoPaciente.dieta.charAt(0).toUpperCase() + novoPaciente.dieta.slice(1)
          }),
        });
        setPacientes(prevPacientes =>
          prevPacientes.map(paciente => (paciente.id === editandoId ? novoPaciente : paciente))
        );
        setEditandoId(null);
        showPopup('Paciente editado com sucesso!');
      } else {
        const response = await fetch('http://localhost:8080/api/pacientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...novoPaciente,
            dieta: novoPaciente.dieta.charAt(0).toUpperCase() + novoPaciente.dieta.slice(1)
          }),
        });
        const data = await response.json();
        setPacientes(prevPacientes => [...prevPacientes, data]);
        showPopup('Paciente adicionado com sucesso!');
      }
      setNovoPaciente({ nome: '', idade: '', dieta: '', condicao: '', observacao: '' });
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    }
  };

  const handleExcluirPaciente = async id => {
    try {
      await fetch(`http://localhost:8080/api/pacientes/${id}`, {
        method: 'DELETE',
      });
      setPacientes(prevPacientes => prevPacientes.filter(paciente => paciente.id !== id));
      showPopup('Paciente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
    }
  };

  const handleEditarPaciente = paciente => {
    setEditandoId(paciente.id);
    setNovoPaciente({ ...paciente });
  };

  const handleChange = (field, value) => {
    setNovoPaciente(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePesquisa = e => {
    setTermoPesquisa(e.target.value);
  };

  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.clear();
    history.push('/login');
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    const columnHeaders = ['Nome', 'Idade', 'Dieta', 'Condição', 'Observação'];
    const rows = pacientesFiltrados.map(paciente => [paciente.nome, paciente.idade, paciente.dieta, paciente.condicao, paciente.observacao]);

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
          <li onClick={handleLogout} className='logout'>Logout</li>
        </ul>
        <button className='mobile-menu-icon' onClick={() => setMobile(!mobile)}>
          {mobile ? <ImCross /> : <FaBars />}
        </button>
      </nav>
      <div className="App table-wrapper">
        <h1>Tabela de Pacientes</h1>
        <input
          className="pesquisar"
          type="text"
          placeholder="Pesquisar por nome do paciente..."
          value={termoPesquisa}
          onChange={handlePesquisa}
        />
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Idade</th>
              <th>Dieta</th>
              <th>Condição</th>
              <th>Observação</th>
              <th className={`${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map(paciente => (
              <tr key={paciente.id}>
                <td>
                  {editandoId === paciente.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoPaciente.nome}
                      onChange={e => handleChange('nome', e.target.value)}
                    />
                  ) : (
                    paciente.nome
                  )}
                </td>
                <td>
                  {editandoId === paciente.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoPaciente.idade}
                      onChange={e => handleChange('idade', e.target.value)}
                    />
                  ) : (
                    paciente.idade
                  )}
                </td>
                <td>
                  {editandoId === paciente.id ? (
                    <select
                      className='campoTabela'
                      value={novoPaciente.dieta}
                      onChange={e => handleChange('dieta', e.target.value)}
                    >
                      <option value="">Selecione o tipo de dieta</option>
                      <option value="Pastosa">Pastosa</option>
                      <option value="Liquida">Líquida</option>
                      <option value="Normal">Normal</option>
                      <option value="Geral">Geral</option>
                      <option value="Restrita">Restrita</option>
                    </select>
                  ) : (
                    paciente.dieta
                  )}
                </td>
                <td>
                  {editandoId === paciente.id ? (
                    <input
                      type="text"
                      className='campoTabela'
                      value={novoPaciente.condicao}
                      onChange={e => handleChange('condicao', e.target.value)}
                    />
                  ) : (
                    paciente.condicao
                  )}
                </td>
                <td>
                  {editandoId === paciente.id ? (
                    <input
                      className='campoTabela'
                      type="text"
                      value={novoPaciente.observacao}
                      onChange={e => handleChange('observacao', e.target.value)}
                    />
                  ) : (
                    paciente.observacao
                  )}
                </td>
                <td className={`acoes ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
                  {editandoId === paciente.id ? (
                    <button className="salvar" onClick={handleSalvarPaciente}>
                      Salvar
                    </button>
                  ) : (
                    <>
                      <button className="editar" onClick={() => handleEditarPaciente(paciente)}>
                        Editar
                      </button>
                      <button className="excluir" onClick={() => handleExcluirPaciente(paciente.id)}>
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {adicionarPaciente && (
              <tr>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoPaciente.nome}
                    onChange={e => handleChange('nome', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoPaciente.idade}
                    onChange={e => handleChange('idade', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className='campoTabela'
                    value={novoPaciente.dieta}
                    onChange={e => handleChange('dieta', e.target.value)}
                  >
                    <option value="">Selecione o tipo de dieta</option>
                    <option value="Pastosa">Pastosa</option>
                    <option value="Liquida">Líquida</option>
                    <option value="Normal">Normal</option>
                    <option value="Geral">Geral</option>
                    <option value="Restrita">Restrita</option>
                  </select>
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoPaciente.condicao}
                    onChange={e => handleChange('condicao', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className='campoTabela'
                    type="text"
                    value={novoPaciente.observacao}
                    onChange={e => handleChange('observacao', e.target.value)}
                  />
                </td>
                <td className="acoes">
                  <button className="salvar" onClick={handleSalvarPaciente}>
                    Salvar
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="botoes">
          {funcaoUsuario !== 'enfermeiro' && funcaoUsuario !== 'familiar' && (
            <button className="adicionar" onClick={handleAdicionarPaciente}>
              Adicionar Paciente
            </button>
          )}
          <button className="pdf" onClick={gerarPDF}>
            Gerar PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
