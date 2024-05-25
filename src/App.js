import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Pacientes from "./compoent/Pacientes";
import Alimentos from "./compoent/Alimentos";
import Medicamentos from "./compoent/Medicamentos";
import Diario from "./compoent/Diario";
import Funcionarios from "./compoent/Funcionarios";
import Usuarios from "./compoent/Usuarios";

import Login from "./compoent/Login";

function App() {

  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} exact />
        <Route path="/pacientes" component={Pacientes} exact />
        <Route path="/alimentos" component={Alimentos} exact />
        <Route path="/medicamentos" component={Medicamentos} exact />
        <Route path="/diario" component={Diario} exact />
        <Route path="/funcionarios" component={Funcionarios} exact />
        <Route path="/usuarios" component={Usuarios} exact />
        <Redirect from="/" to="/login" />
      </Switch>
    </Router>
  );
}

export default App;
