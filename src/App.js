import { BrowserRouter, Routes, Route } from "react-router-dom"; // Cria rotas de páginas
import { useEffect, useState } from 'react'
import Login from './pages/Login/Index';
import Schedules from './pages/Schedules/Index';
import PanelAdmin from './pages/PanelAdmin/Index';
// import Alert from './pages/Alert/Index';
import useAuth from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import Schedule from './pages/Schedule/Index';
// import Finance from './pages/Finance/Index';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { dataBase } from "./firebase/database";
import { Users } from "./data/Data";
import { useNavigatorOnline } from '@oieduardorabelo/use-navigator-online';
import Prospecction from "./pages/Prospection/Index";
import Commercial from "./pages/Management_commercial/Index";
import Report from "./pages/Report/Index";
import Estimate from "./pages/Estimate/Index";

function App() {
  const { user } = useAuth();
  const [members, setMembers] = useState();
  const [userRef, setUserRef] = useState();
  const [leads, setLeads] = useState();
  const [orcamento, setOrcamento] = useState();
  const [activity, setActivity] = useState();
  const [visits, setVisits] = useState();
  const [tecs, setTecs] = useState();
  const [sellers, setSellers] = useState();
  const [listLeads, setListLeads] = useState();
  const [reports, setReports] = useState();
  const [reportsRef, setReportsRef] = useState();
  const [check, setCheck] = useState(false);
  const membersCollectionRef = collection(dataBase, "Membros");
  const orcamentoCollectionRef = collection(dataBase, "Orcamento");
  const activityCollectionRef = collection(dataBase, "Atividades_Total");
  const listCollectionRef = collection(dataBase, "Lista_Leads");
  const leadsCollectionRef = collection(dataBase, "Leads");
  const relatorioCollectionRef = collection(dataBase, "Relatorio");
  const VisitasCollectionRef = collection(dataBase,"Visitas_2023");
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
          onSnapshot(query(leadsCollectionRef, orderBy("createAt", 'desc')), (lead) => {
            // Atualiza os dados em tempo real
          setLeads(lead.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          });
          onSnapshot(query(orcamentoCollectionRef, orderBy("createAt", 'desc')), (lead) => {
            // Atualiza os dados em tempo real
          setOrcamento(lead.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
          onSnapshot(query(VisitasCollectionRef, orderBy("dataRef", 'desc')), (list) => {
            // Atualiza os dados em tempo real
          setVisits(list.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
          setSellers(members.filter((member) => member.cargo === "Indicador"));
        }
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members]
  );

  useEffect(() => {
        if (reportsRef) {
          if(userRef && userRef.cargo === 'Indicador') {
            setReports(reportsRef.filter((act) => act.consultora_uid === user.id))
          } else if(userRef && userRef.cargo !== 'Indicador') {
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
            <Route exact path="/" element={<Schedules userRef={userRef} check={check} reports={reports} />} />
              {user && userRef && (user.email === Users[0].email) &&
            <Route exact path="/admin" element={<PanelAdmin user={user} userRef={userRef} alerts={orcamento} check={check} reports={reports} />} />
            }
            {/* {user && userRef && (user.email === Users[0].email || user.email === Users[1].email || userRef.cargo === "Técnico" || userRef.cargo === "Administrador") &&
              <Route exact path="/financeiro/:year" element={<Finance userRef={userRef} alerts={userAlerts} sellers={sellers} reports={reports} />} />
            } */}
            {/* <Route exact path="/orcamento" element={<Alert user={user} userRef={userRef} orcamento={orcamento} check={check} reports={reports} />} /> */}
            <Route exact path="/prospeccao" element={<Prospecction user={user} userRef={userRef} leads={leads} visits={visits} listLeads={listLeads} members={members} sellers={sellers} check={check} reports={reports} />} />
            {userRef && (userRef.cargo !== 'Indicador' && userRef.cargo !== 'Técnico') && 
              <><Route exact path="/relatorio" element={<Report user={user} userRef={userRef} check={check} reports={reports} />} />
              <Route exact path="/orcamento" element={<Estimate user={user} userRef={userRef} orcamento={orcamento} visits={visits} members={members} sellers={sellers} check={check} />} /></> 
            }
            {userRef && userRef.cargo !== 'Indicador' && 
              <Route path="/agenda/:year" element={<Schedule userRef={userRef} members={members} visits={visits} tecs={tecs} sellers={sellers} check={check} reports={reports} />} />
            }
            {userRef && userRef.cargo === 'Gestor' && 
              <Route exact path="/gestao-comercial" element={<Commercial user={user} userRef={userRef} leads={leads} activity={activity} listLeads={listLeads} members={members} sellers={sellers} check={check} reports={reports}/>} />
            }
            <Route path="*" element={<Schedules userRef={userRef} check={check} reports={reports} />} />
          </Route>
          <Route exact path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
