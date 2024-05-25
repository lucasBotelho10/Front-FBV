import React, { useState, useEffect } from 'react';
import './App.css';
import './Navbar.css';
import { Link, useHistory } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";

function Funcionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [adicionarFuncionario, setAdicionarFuncionario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novoFuncionario, setNovoFuncionario] = useState({ nome: '', cpf: '', funcao: '' });
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [mobile, setMobile] = useState(false);
  const [funcaoUsuario, setFuncaoUsuario] = useState('');
  const history = useHistory();
  
  useEffect(() => {
    // Recupera a função do usuário do localStorage e a converte para minúsculas
    const funcao = localStorage.getItem('funcaoUsuario')?.toLowerCase();
    setFuncaoUsuario(funcao);
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

  const handleAdicionarFuncionario = () => {
    setAdicionarFuncionario(true);
  };

  const handleSalvarFuncionario = async () => {
    try {
      setAdicionarFuncionario(false);
      if (editandoId !== null) {
        await fetch(`http://localhost:8080/api/funcionarios/${editandoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoFuncionario),
        });
        setFuncionarios(prevFuncionarios =>
          prevFuncionarios.map(funcionario => (funcionario.id === editandoId ? novoFuncionario : funcionario))
        );
        setEditandoId(null);
      } else {
        const response = await fetch('http://localhost:8080/api/funcionarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoFuncionario),
        });
        const data = await response.json();
        setFuncionarios(prevFuncionarios => [...prevFuncionarios, data]);
      }
      setNovoFuncionario({ nome: '', cpf: '', funcao: '' });
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
    }
  };

  const handleExcluirFuncionario = async id => {
    try {
      await fetch(`http://localhost:8080/api/funcionarios/${id}`, {
        method: 'DELETE',
      });
      setFuncionarios(prevFuncionarios => prevFuncionarios.filter(funcionario => funcionario.id !== id));
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
    }
  };

  const handleEditarFuncionario = funcionario => {
    setEditandoId(funcionario.id);
    setNovoFuncionario({ ...funcionario });
  };

  const handleChange = (field, value) => {
    setNovoFuncionario(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handlePesquisa = e => {
    setTermoPesquisa(e.target.value);
  };

  const funcionariosFiltrados = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  const handleLogout = () => {
    // Limpa o localStorage e redireciona para a tela de login
    localStorage.clear();
    history.push('/login');
  };

  return (
    <>
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
          <Link to='/funcionarios' lassName={`funcionarios ${(funcaoUsuario === 'medico' || funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
            <li>Funcionarios</li>
          </Link>
          <Link to='/usuarios' className={`usuarios ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
            <li>Usuarios</li>
          </Link>
          <li onClick={handleLogout} className='logout'>Logout</li> {/* Adiciona um botão de logout */}
        </ul>
        <button className='mobile-menu-icon' onClick={() => setMobile(!mobile)}>
          {mobile ? <ImCross /> : <FaBars />}
        </button>
      </nav>
    <div className="App tabble-wrapper">
      <h1>Tabela Funcionários</h1>
      <input
        className='pesquisar'
        type="text"
        placeholder="Pesquisar por nome do alimento..."
        value={termoPesquisa}
        onChange={handlePesquisa}
      />
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Função</th>
            <th className={` ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionariosFiltrados.map(funcionario => (
            <tr key={funcionario.id}>
              <td>
                {editandoId === funcionario.id ? (
                  <input
                    type="text"
                    value={novoFuncionario.nome}
                    onChange={e => handleChange('nome', e.target.value)}
                  />
                ) : (
                  funcionario.nome
                )}
              </td>
              <td>
                {editandoId === funcionario.id ? (
                  <input
                    type="text"
                    value={novoFuncionario.cpf}
                    onChange={e => handleChange('cpf', e.target.value)}
                  />
                ) : (
                  funcionario.cpf
                )}
              </td>
              <td>
                {editandoId === funcionario.id ? (
                  <select
                    value={novoFuncionario.funcao}
                    onChange={e => handleChange('funcao', e.target.value)}
                  >
                    <option value="">Selecione a Função</option>
                    <option value="Medico">Médico</option>
                    <option value="Enfermeiro">Enfermeiro</option>
                    <option value="Familia">Familia</option>
                  </select>
                ) : (
                  funcionario.funcao
                )}
              </td>
              <td className={`acoes ${(funcaoUsuario === 'Enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
                {editandoId === funcionario.id ? (
                  <button className="salvar" onClick={handleSalvarFuncionario}>
                    Salvar
                  </button>
                ) : (
                  <>
                    <button className="editar" onClick={() => handleEditarFuncionario(funcionario)}>
                      Editar
                    </button>
                    <button className="excluir" onClick={() => handleExcluirFuncionario(funcionario.id)}>
                      Excluir
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {adicionarFuncionario && (
            <tr>
              <td>
                <input
                  type="text"
                  value={novoFuncionario.nome}
                  onChange={e => handleChange('nome', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={novoFuncionario.cpf}
                  onChange={e => handleChange('cpf', e.target.value)}
                />
              </td>
              <td>
                <select
                  value={novoFuncionario.funcao}
                  onChange={e => handleChange('funcao', e.target.value)}
                >
                  <option value="">Selecione a Função</option>
                  <option value="Medico">Médico</option>
                  <option value="Enfermeiro">Enfermeiro</option>
                  <option value="Familia">Familia</option>
                </select>
              </td>
              <td className="acoes">
                <button className="salvar" onClick={handleSalvarFuncionario}>
                  Salvar
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button className={`adicionar ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`} onClick={handleAdicionarFuncionario}>
        Adicionar Funcionário
      </button>
    </div>
    </>
  );
}

export default Funcionario;
