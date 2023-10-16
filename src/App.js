import { BrowserRouter, Routes, Route } from "react-router-dom"; // Cria rotas de páginas
import { useEffect, useState } from 'react'
import Login from './pages/Login/Index';
import Schedules from './pages/Schedules/Index';
import PanelAdmin from './pages/PanelAdmin/Index';
import Alert from './pages/Alert/Index';
import useAuth from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Schedule from './pages/Schedule/Index';
import Finance from './pages/Finance/Index';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { dataBase } from "./firebase/database";
import { Users } from "./data/Data";
import { useNavigatorOnline } from '@oieduardorabelo/use-navigator-online';
import Prospecction from "./pages/Prospection/Index";
import Commercial from "./pages/Management_commercial/Index";
import Report from "./pages/Report/Index";

function App() {
  const { user } = useAuth();
  const [members, setMembers] = useState();
  const [userRef, setUserRef] = useState();
  const [userAlerts, setUserAlerts] = useState();
  const [leads, setLeads] = useState();
  const [activity, setActivity] = useState();
  const [tecs, setTecs] = useState();
  const [sellers, setSellers] = useState();
  const [listLeads, setListLeads] = useState();
  const [reports, setReports] = useState();
  const [reportsRef, setReportsRef] = useState();
  const [check, setCheck] = useState(false);
  const membersCollectionRef = collection(dataBase, "Membros");
  const leadsCollectionRef = collection(dataBase, "Leads");
  const activityCollectionRef = collection(dataBase, "Atividades_Total");
  const listCollectionRef = collection(dataBase, "Lista_Leads");
  const relatorioCollectionRef = collection(dataBase, "Relatorio");
  let { status } = useNavigatorOnline();

  useEffect(() => {
    if(status === 'online') {
      setCheck(false);
    } else {
      setCheck(true);
    }
  }, [status]);

  useEffect(
    () => {
      const fetchData = async () => {
        onSnapshot(membersCollectionRef, (member) => {
          // Atualiza os dados em tempo real
          setMembers(member.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
        onSnapshot(query(collection(dataBase, "Membros/" + user.id + "/Avisos"), orderBy("data")), (member) => {
          // Atualiza os dados em tempo real
          setUserAlerts(member.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
          onSnapshot(query(leadsCollectionRef, orderBy("createAt", 'desc')), (lead) => {
            // Atualiza os dados em tempo real
          setLeads(lead.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          });
          onSnapshot(query(activityCollectionRef, orderBy("createAt", 'desc')), (activity) => {
            // Atualiza os dados em tempo real
          setActivity(activity.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          });
          onSnapshot(query(listCollectionRef, orderBy("createAt", 'desc')), (list) => {
            // Atualiza os dados em tempo real
          setListLeads(list.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          });
          onSnapshot(query(relatorioCollectionRef, orderBy("createAt", 'desc')), (list) => {
            // Atualiza os dados em tempo real
          setReportsRef(list.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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

  useEffect(() => {
        if (reportsRef) {
          if(userRef && userRef.cargo === 'Vendedor(a)') {
            setReports(reportsRef.filter((act) => act.consultora_uid === user.id))
          } else if(userRef && userRef.cargo !== 'Vendedor(a)') {
            setReports(reportsRef);
          }
        }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportsRef, userRef]
  );

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact element={<PrivateRoute />}>
            <Route exact path="/" element={<Schedules userRef={userRef} alerts={userAlerts} check={check} reports={reports} />} />
              {user && userRef && (user.email === Users[0].email) &&
            <Route exact path="/admin" element={<PanelAdmin user={user} userRef={userRef} alerts={userAlerts} check={check} reports={reports} />} />
            }
            {user && userRef && (user.email === Users[0].email || user.email === Users[1].email || userRef.cargo === "Técnico" || userRef.cargo === "Administrador") &&
              <Route exact path="/financeiro/:year" element={<Finance userRef={userRef} alerts={userAlerts} sellers={sellers} reports={reports} />} />
            }
            <Route exact path="/leads" element={<Alert user={user} userRef={userRef} alerts={userAlerts} check={check} reports={reports} />} />
            <Route exact path="/relatorio" element={<Report user={user} userRef={userRef} alerts={userAlerts} check={check} reports={reports} />} />
            <Route exact path="/prospeccao" element={<Prospecction user={user} userRef={userRef} leads={leads} activity={activity} listLeads={listLeads} members={members} sellers={sellers} check={check} reports={reports} alerts={userAlerts} />} />
            <Route exact path="/gestao-comercial" element={<Commercial user={user} userRef={userRef} leads={leads} activity={activity} listLeads={listLeads} members={members} sellers={sellers} check={check} reports={reports}/>} />
            <Route path="/agenda/:year" element={<Schedule userRef={userRef} members={members} tecs={tecs} sellers={sellers} alerts={userAlerts} check={check} reports={reports} />} />
            <Route path="*" element={<Schedules userRef={userRef} alerts={userAlerts} check={check} reports={reports} />} />
          </Route>
          <Route exact path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
