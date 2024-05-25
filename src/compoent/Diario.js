import React, { useState, useEffect } from 'react';
import './App.css';
import './Navbar.css';
import { Link, useHistory } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Diario() {
  const [diarios, setDiarios] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [adicionarDiario, setAdicionarDiario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novoDiario, setNovoDiario] = useState({ nomePaciente: '', funcionario: '', funcaoFuncionario: '', diario: '', data: '', horario: '' });
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
    async function fetchDiarios() {
      try {
        const response = await fetch('http://localhost:8080/api/diario');
        const data = await response.json();
        setDiarios(data);
      } catch (error) {
        console.error('Erro ao buscar diários:', error);
      }
    }
    fetchDiarios();
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

  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const response = await fetch('http://localhost:8080/api/funcionarios');
        const data = await response.json();
        setFuncionarios(data);
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
      }
    }
    fetchFuncionarios();
  }, []);

  const handleChangeFuncionario = (value) => {
    const funcionarioSelecionado = funcionarios.find(funcionario => funcionario.nome === value);
    setNovoDiario(prevState => ({
      ...prevState,
      funcionario: value,
      funcaoFuncionario: funcionarioSelecionado ? funcionarioSelecionado.funcao : '',
    }));
  };

  const handleAdicionarDiario = () => {
    setAdicionarDiario(true);
  };

  const handleChange = (field, value) => {
    if (field === 'nomePaciente') {
      const pacienteSelecionado = pacientes.find(paciente => paciente.nome === value);
      if (pacienteSelecionado) {
        setNovoDiario(prevState => ({
          ...prevState,
          idPaciente: pacienteSelecionado.id,
          [field]: value,
        }));
      }
    } else {
      setNovoDiario(prevState => ({
        ...prevState,
        [field]: value,
      }));
    }
  };
  
  const { format } = require('date-fns');

  const gerarPDF = () => {
    const doc = new jsPDF();
    const columnHeaders = ['Nome Paciente', 'Funcionario', 'Funcao Funcionario','Diario','Data' ,'Horario'];
    const rows = diariosFiltrados.map(diarios => [
      diarios.nomePaciente, 
      diarios.funcionario, 
      diarios.funcaoFuncionario, 
      diarios.diario, 
      format(new Date(diarios.data), 'dd/MM/yyyy'), // Formata a data para DD/MM/AAAA
      diarios.horario
    ]);
  
    doc.autoTable({
      head: [columnHeaders],
      body: rows,
    });
  
    doc.save('pacientes.pdf');
  };
  
  
  const handleSalvarDiario = async () => {
    try {
      console.log('Salvando diário:', novoDiario); // Log para verificar os dados sendo enviados
      setAdicionarDiario(false);
      if (editandoId !== null) {
        await fetch(`http://localhost:8080/api/diario/${editandoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoDiario),
        });
        setDiarios(prevDiarios =>
          prevDiarios.map(diario => (diario.id === editandoId ? novoDiario : diario))
        );
        setEditandoId(null);
      showPopup('Diário editado com sucesso!');
      } else {
        const response = await fetch('http://localhost:8080/api/diario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoDiario),
        });
        if (!response.ok) {
          throw new Error('Erro ao salvar diário');
        }
        const data = await response.json();
        setDiarios(prevDiarios => [...prevDiarios, data]);
      showPopup('Diário adicionado com sucesso!');

      }
      setNovoDiario({ nomePaciente: '', funcionario: '', funcaoFuncionario: '', diario: '', data: '', horario: '' });
    } catch (error) {
      console.error('Erro ao salvar diário:', error);
    }
  };
  
  const handleExcluirDiario = async id => {
    try {
      await fetch(`http://localhost:8080/api/diario/${id}`, {
        method: 'DELETE',
      });
      setDiarios(prevDiarios => prevDiarios.filter(diario => diario.id !== id));
      showPopup('Diário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir diário:', error);
    }
  };
  
  const handleEditarDiario = diario => {
    setEditandoId(diario.id);
    setNovoDiario({ ...diario, data: diario.data.split('T')[0], horario: diario.horario });
  };
  
  const handlePesquisa = e => {
    setTermoPesquisa(e.target.value);
  };
  
  const diariosFiltrados = diarios.filter(diario =>
    diario.nomePaciente && diario.nomePaciente.toLowerCase().includes(termoPesquisa.toLowerCase())
  );
  
  const handleLogout = () => {
    localStorage.clear();
    history.push('/login');
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
            <li>Diário</li>
          </Link>
          <Link to='/funcionarios' className={`funcionarios ${(funcaoUsuario === 'medico' || funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
            <li>Funcionarios</li>
          </Link>
          <Link to='/usuarios' className={`usuarios ${(funcaoUsuario === 'medico' || funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
            <li>Usuários</li>
          </Link>
          <li onClick={handleLogout} className='logout'>Logout</li>
        </ul>
        <button className='mobile-menu-icon' onClick={() => setMobile(!mobile)}>
          {mobile ? <ImCross /> : <FaBars />}
        </button>
      </nav>
      <div className="App table-wrapper">
        <h1>Diário Hospitalar</h1>
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
              <th>Nome Paciente</th>
              <th>Nome Funcionário</th>
              <th>Função do Funcionário</th>
              <th>Resumo</th>
              <th>Data</th>
              <th>Horário</th>
              <th className={` ${funcaoUsuario === 'familiar' ? 'hidden' : ''}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {diariosFiltrados.map(diario => (
              <tr key={diario.id}>
                <td>
                  {editandoId === diario.id ? (
                    <select
                      value={novoDiario.nomePaciente}
                      onChange={e => handleChange('nomePaciente', e.target.value)}
                    >
                      <option value="">Selecione o Paciente</option>
                      {pacientes.map(paciente => (
                        <option key={paciente.id} value={paciente.nome}>
                          {paciente.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    
                    diario.nomePaciente
                  )}
                </td>
                <td>
                  {editandoId === diario.id ? (
                    <select
                      value={novoDiario.funcionario}
                      onChange={e => handleChange('funcionario', e.target.value)}
                    >
                      <option value="">Selecione o Funcionário</option>
                      {funcionarios.map(funcionario => (
                        <option key={funcionario.id} value={funcionario.nome}>
                          {funcionario.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    diario.funcionario
                  )}
                </td>
                <td>
                  {editandoId === diario.id ? (
                    <input
                      type="text"
                      value={novoDiario.funcaoFuncionario}
                      onChange={e => handleChange('funcaoFuncionario', e.target.value)}
                      readOnly
                      className="grayed-out"
                    />
                  ) : (
                    diario.funcaoFuncionario
                  )}
                </td>
                <td>
                  {editandoId === diario.id ? (
                    <input
                      type="text"
                      value={novoDiario.diario}
                      onChange={e => handleChange('diario', e.target.value)}
                    />
                  ) : (
                    diario.diario
                  )}
                </td>
                <td>
                  {editandoId === diario.id ? (
                    <input
                      type="date"
                      value={novoDiario.data}
                      onChange={e => handleChange('data', e.target.value)}
                    />
                  ) : (
                    new Date(diario.data).toLocaleDateString('pt-BR')
                  )}
                </td>
                <td>
                  {editandoId === diario.id ? (
                    <input
                      type="time"
                      value={novoDiario.horario}
                      onChange={e => handleChange('horario', e.target.value)}
                    />
                  ) : (
                    diario.horario
                  )}
                </td>
                <td className={`acoes ${funcaoUsuario === 'familiar' ? 'hidden' : ''}`}>
                  {editandoId === diario.id ? (
                    <button className="salvar" onClick={handleSalvarDiario}>
                      Salvar
                    </button>
                  ) : (
                    <>
                      <button className="editar" onClick={() => handleEditarDiario(diario)}>
                        Editar
                      </button>
                      <button className="excluir" onClick={() => handleExcluirDiario(diario.id)}>
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {adicionarDiario && (
              <tr>
                <td>
                  <select
                    value={novoDiario.nomePaciente}
                    onChange={e => handleChange('nomePaciente', e.target.value)}
                  >
                    <option value="">Selecione o Paciente</option>
                    {pacientes.map(paciente => (
                      <option key={paciente.id} value={paciente.nome}>
                        {paciente.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={novoDiario.funcionario}
                    onChange={e => handleChangeFuncionario(e.target.value)}
                  >
                    <option value="">Selecione o Funcionário</option>
                    {funcionarios.map(funcionario => (
                      <option key={funcionario.id} value={funcionario.nome}>
                        {funcionario.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={novoDiario.funcaoFuncionario}
                    onChange={e => handleChange('funcaoFuncionario', e.target.value)}
                    readOnly
                    className="grayed-out"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={novoDiario.diario}
                    onChange={e => handleChange('diario', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={novoDiario.data}
                    onChange={e => handleChange('data', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={novoDiario.horario}
                    onChange={e => handleChange('horario', e.target.value)}
                  />
                </td>
                <td className="acoes">
                  <button className="salvar" onClick={handleSalvarDiario}>
                    Salvar
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div class="botoes">
          <button className={`adicionar ${funcaoUsuario === 'familiar' ? 'hidden' : ''}`} onClick={handleAdicionarDiario}>
            Adicionar Diário
          </button>
          <button className="pdf" onClick={gerarPDF}>
            Gerar PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default Diario;
