import { BrowserRouter, Routes, Route } from "react-router-dom"; // Cria rotas de páginas
import { useEffect, useState } from 'react'
import Login from './pages/Login/Index';
import Schedules from './pages/Schedules/Index';
import PanelAdmin from './pages/PanelAdmin/Index';
import useAuth from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Schedule from './pages/Schedule/Index';
import Finance from './pages/Finance/Index';
import { collection, onSnapshot } from "firebase/firestore";

import { dataBase } from "./firebase/database";
import { Users } from "./data/Data";

function App() {
  const { user } = useAuth();
  const [members, setMembers] = useState();
  const [userRef, setUserRef] = useState();
  const [tecs, setTecs] = useState();
  const [sellers, setSellers] = useState();
  const membersCollectionRef = collection(dataBase, "Membros");
  // console.log(user)

  useEffect(
    () => {
      const fetchData = async () => {
        onSnapshot(membersCollectionRef, (member) => {
          // Atualiza os dados em tempo real
          setMembers(member.docs.map((doc) => ({ ...doc.data(), id: doc.id }))); // puxa a coleção 'Chats' para o state
        });
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () => {
      const fetchData = async () => {
        if (members) {
          setUserRef(members.find((doc) => doc.uid === user.id));
          setTecs(members.filter((member) => member.cargo === "Técnico"));
          setSellers(members.filter((member) => member.cargo === "Vendedor(a)"));
        }
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members]
  );

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact element={<PrivateRoute />}>
            <Route exact path="/" element={<Schedules userRef={userRef} />} />
            {user && userRef && (user.email === Users[0].email || userRef.cargo === "Administrador") &&
            <Route exact path="/admin" element={<PanelAdmin user={user} userRef={userRef} />} />
       }
          {user && userRef && (user.email === Users[0].email || user.email === Users[1].email || userRef.cargo === "Técnico" || userRef.cargo === "Administrador") &&
            <Route exact path="/financeiro/:year" element={<Finance userRef={userRef} />} />
       }
            <Route path="/agenda/:year" element={<Schedule userRef={userRef} members={members} tecs={tecs} sellers={sellers} />} />
            <Route path="*" element={<Schedules userRef={userRef} />} />
          </Route>
          <Route exact path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
