import { BrowserRouter, Routes, Route } from "react-router-dom"; // Cria rotas de páginas
import Login from './pages/Login/Index';
import Schedules from './pages/Schedules/Index';
import PanelAdmin from './pages/PanelAdmin/Index';
import useAuth from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Schedule from './pages/Schedule/Index';
import Finance from './pages/Finance/Index';

function App() {
  const { user } = useAuth();
  console.log(user)

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact element={<PrivateRoute />}>
            <Route exact path="/" element={<Schedules />} />
            {user && user.email === "admin@infinitenergy.com.br" &&
            <Route exact path="/admin" element={<PanelAdmin user={user} />} />
       }
          {user && user.email === "admin@infinitenergy.com.br" &&
            <Route exact path="/financeiro/:year" element={<Finance />} />
       }
            <Route path="/agenda/:year" element={<Schedule/>} />
          </Route>
          <Route exact path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
      {/* { user ?  <div>Logado!</div> : <Login></Login> } */}
    </div>
  );
}

export default App;
