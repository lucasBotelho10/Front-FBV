import React, { useState, useEffect } from 'react';
import './App.css';
import './Navbar.css';
import { Link, useHistory } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { ImCross } from "react-icons/im";

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [adicionarUsuario, setAdicionarUsuario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', senha: '', funcao: '' });
  const [mobile, setMobile] = useState(false);
  const [funcaoUsuario, setFuncaoUsuario] = useState('');
  const history = useHistory();

  useEffect(() => {
    const funcao = localStorage.getItem('funcaoUsuario');
    console.log('Função do usuário:', funcao); // Adicione este log
    if (funcao) {
      setFuncaoUsuario(funcao.toLowerCase());
    } else {
      console.error('Função do usuário não encontrada no localStorage');
    }


  }, []);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    }
    fetchUsuarios();
  }, []);

  const handleAdicionarUsuario = () => {
    setAdicionarUsuario(true);
  };

  const handleSalvarUsuario = async () => {
    try {
      let data;
      if (editandoId !== null) {
        await fetch(`http://localhost:8080/api/usuarios/${editandoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoUsuario),
        });
        setUsuarios(prevUsuarios =>
          prevUsuarios.map(usuario => (usuario.id === editandoId ? novoUsuario : usuario))
        );
        setEditandoId(null);
      } else {
        const response = await fetch('http://localhost:8080/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoUsuario),
        });
        console.log('Response:', response); // Adicione esta linha
        data = await response.json();
        console.log('Data:', data); // Adicione esta linha
        setUsuarios(prevUsuarios => [...prevUsuarios, data]);
      }
      setNovoUsuario({ nome: '', senha: '', funcao: '' });
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };


  const handleExcluirUsuario = async id => {
    try {
      await fetch(`http://localhost:8080/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario.id !== id));
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const handleEditarUsuario = usuario => {
    setEditandoId(usuario.id);
    setNovoUsuario({ ...usuario });
  };

  const handleChange = (field, value) => {
    setNovoUsuario(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };




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
          <Link to='/diario' className={`diario ${funcaoUsuario === 'familiar' ? 'hidden' : ''}`}>
            <li>Diario</li>
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
      <div className="App table-wrapper">
        <h1>Tabela de Usuários</h1>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Senha</th>
              <th>Função</th>
              <th className={` ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`} >Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios
              .map(usuario => (
                <tr key={usuario.id}>
                  <td>{editandoId === usuario.id ? <input type="text" value={novoUsuario.nome} onChange={e => handleChange('nome', e.target.value)} /> : usuario.nome}</td>
                  <td>{editandoId === usuario.id ? <input type="text" value={novoUsuario.senha} onChange={e => handleChange('senha', e.target.value)} /> : '**********'}</td>
                  <td>{editandoId === usuario.id ? <select value={novoUsuario.funcao} onChange={e => handleChange('funcao', e.target.value)}>
                    <option>Escolha a função</option>
                    <option value="Medico">Medico</option>
                    <option value="Enfermeiro">Enfermeiro</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Usuario">Usuário</option>
                  </select> : usuario.funcao}</td>
                  <td className={`acoes ${(funcaoUsuario === 'enfermeiro' || funcaoUsuario === 'familiar') ? 'hidden' : ''}`}>
                    {editandoId === usuario.id ? <button className="salvar" onClick={handleSalvarUsuario}>Salvar</button> : <>
                      <button className="editar" onClick={() => handleEditarUsuario(usuario)}>Editar</button>
                      <button className="excluir" onClick={() => handleExcluirUsuario(usuario.id)}>Excluir</button>
                    </>}
                  </td>
                </tr>
              ))}

            {adicionarUsuario && (
              <tr>
                <td><input type="text" value={novoUsuario.nome} onChange={e => handleChange('nome', e.target.value)} /></td>
                <td><input type="text" value={novoUsuario.senha} onChange={e => handleChange('senha', e.target.value)} /></td>
                <td>
                  <select value={novoUsuario.funcao} onChange={e => handleChange('funcao', e.target.value)}>
                    <option>Escolha a função</option>
                    <option value="Medico">Medico</option>
                    <option value="Enfermeiro">Enfermeiro</option>
                    <option value="Familiar">Familiar</option>
                  </select>
                </td>
                <td className="acoes"><button className="salvar" onClick={handleSalvarUsuario}>Salvar</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <button className="adicionar" onClick={handleAdicionarUsuario}>Adicionar Usuário</button>
      </div>
    </>
  );
}

export default App;
