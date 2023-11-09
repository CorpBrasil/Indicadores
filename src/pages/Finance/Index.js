import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import useAuth from "../../hooks/useAuth";
import Dashboard from "../../components/Dashboard/Visit_and_Prospection/Index";
import Filter from "../../components/Filter/Index";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import RestaurantIcon from '@mui/icons-material/Restaurant'; // Almoço
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda

import { ReactComponent as ScheduleIcon } from "../../images/icons/Schedule1.svg";

import {
  onSnapshot,
  collection,
  query,
  orderBy
} from "firebase/firestore";

import "../Schedule/_style.scss";
import "../../components/Dashboard/Visit_and_Prospection/_styles.scss";

const Finance = ({ userRef, alerts, sellers }) => {
  const data = new Date();
  const { year } = useParams();
  const { user } = useAuth();
  const month = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const [schedule, setSchedule] = useState();
  const [scheduleFull, setScheduleFull] = useState();
  const [scheduleNew, setScheduleNew] = useState();
  const [members, setMembers] = useState();
  const [tecs, setTecs] = useState();
  const [sales, setSales] = useState();
  const [total, setTotal] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(data.getMonth() + 1).padStart(2, "0")
  );
  const membersCollectionRef = collection(dataBase, "Membros");
  const [sellersOrder, setSellersOrder] = useState();

  useEffect(
    () => {
      const schedulesCollectionRef = collection(
        dataBase,
        "Financeiro",
        year,
        monthSelect
      );
      const fetchData = async () => {
        const q = query(schedulesCollectionRef, orderBy("dia"));
        onSnapshot(await q, (schedule) => {
          // Atualiza os dados em tempo real
          setSchedule(
            schedule.docs.map((doc) => (
              { ...doc.data(), id: doc.id }
              ))
          ); // puxa a coleção 'Agendas' para o state
          setScheduleFull(
            schedule.docs.map((doc) => (
              { ...doc.data(), id: doc.id }
              ))
          ); // puxa a coleção 'Agendas' para o state
        });
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthSelect]
  );

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

  useEffect(() => {
    if(sellers) {
      setSellersOrder(sellers.sort((a,b) => {
        if(a.nome< b.nome) return -1;
        if(a.nome > b.nome) return 1;
        return 0;
      }))
    }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sellers]
  );

useEffect(() => {
    if(schedule && monthSelect && members) {
      setScheduleNew(schedule.sort(function(a, b) { // Força a renderizaram da tabela ordenada
        if(a.data === b.data) {
          if(a.horario < b.horario) return -1;
          if(a.horario > b.horario) return 1;
        }
        return 0;
      }))
      let docs = [];
      members.map((ref) => {
        if(ref.cargo === 'Técnico' && schedule.find(name => name.tecnico === ref.nome)) {
          docs.push(ref.nome)
        }
        return setTecs(docs.sort());
      })
      tecs && tecs.map((tec, index) => (
        setTotal(schedule.filter((ref) => ref.tecnico && ref.tecnico !== 'Nenhum' && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20)
      ))
    }
    // console.log(tecs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[members, monthSelect, schedule, scheduleNew])

  console.log(total)

  useEffect(
    () => {
      const fetchData = async () => {
        if (members) {
          let docs = [];
        members.map((ref) => {
        if(ref.cargo === 'Vendedor(a)') {
          docs.push(ref.nome)
        }
        return setSales(docs.sort());
      })
          // setSales(members.filter((member) => member.cargo === "Vendedor(a)"));
        }
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members]
  );

  const changeFilter = (data) => {
    setSchedule(data);
  }

  return (
    <div className="container-schedule">
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className="title-schedule">
        <ScheduleIcon />
        <h2>Agenda {year} </h2>
        <h2>Relátorio Mensal - {month[parseFloat(monthSelect)]} </h2>
            <div className="schedule-month">
            <select
              value={monthSelect}
              className="schedule-month__select"
              name="month"
              onChange={(e) => setMonthSelect(e.target.value)}
            >
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>
      </div>
      <div className="content-schedule-visit">
        <Dashboard schedule={schedule} monthSelect={monthSelect} type={'financeiro'} total={total} />
        <div className="box-schedule-visit">
          <div className="container-table">
          {tecs && tecs.length > 0 &&
            <div className="container-info">
            {tecs && tecs.map((tec, index) => {
              if(index > 0) { return (
                <table key={index} className="table-finance">
                  <thead>
                    <tr>
                      <th colSpan={3}>{tec}</th>
                    </tr>
                    <tr>
                      <th>Visitas</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule && sales && sales.map((vend, index) => (
                      <tr className="table" key={index}>
                      <td>{schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia').length}</td>
                      <td>
                      {(schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}
                      </td>
                    </tr>
                    ))}
                    <tr className="bg-total">
                      <td>{schedule.filter((ref) => ref.tecnico === tec && ref.tecnico !== "Bruna" && ref.tecnico !== "Lia").length}</td>
                      <td>{(schedule.filter((ref) => ref.tecnico === tec && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                    </tr>
                  </tbody>
                </table>
              ) }
              else { return (
                <table key={index} className="table-finance">
                  <thead>
                    <tr>
                      <th rowSpan={2}>Vendedor(a)</th>
                      <th colSpan={3}>{tec}</th>
                    </tr>
                    <tr>
                      <th>Visitas</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule && sales && sales.map((vend, index) => (
                      <tr className="table" key={index}>
                      <td className="bold">
                        {vend}
                      </td>
                      <td>{schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec).length}</td>
                      <td>
                      {(schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}
                      </td>
                    </tr>
                    ))}
                    <tr className="bg-total">
                      <td>Total</td>
                      <td>{schedule.filter((ref) => ref.tecnico === tec).length}</td>
                      <td>{(schedule.filter((ref) => ref.tecnico === tec && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                    </tr>
                  </tbody>
                </table>
            )}
          })}
            <table className="table-finance end">
                  <thead>
                    <tr>
                      <th colSpan={3}>Total</th>
                    </tr>
                    <tr>
                      <th>Visitas</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule && sales && sales.map((vend, index) => (
                      <tr className="table" key={index}>
                      <td>{schedule.filter((ref) => ref.consultora === vend).length}</td>
                      <td>
                      {(schedule.filter((ref) => ref.consultora === vend && ref.tecnico !== 'Nenhum' && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}
                      </td>
                    </tr>
                    ))}
                    <tr className="bg-total">
                      <td>{schedule.filter((ref) => ref.tecnico).length}</td>
                      <td>{(schedule.filter((ref) => ref.tecnico && ref.tecnico !== 'Nenhum' && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                    </tr>
                  </tbody>
                </table>
                </div>
            }        
            <div className="desktop filter-finance">
              <Filter tableData={schedule} dataFull={scheduleFull} sellers={sellersOrder} changeFilter={changeFilter} type={'visit'} />
            </div>
            <TableContainer className="table-visit table-center" component={Paper} sx={{ maxWidth: '1000px' }}>
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow className="table-visits_header">
                  <TableCell align="center">Visita</TableCell>
                  <TableCell align="center">Dia</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                  <TableCell align="center" padding="none">Cliente</TableCell>
                  <TableCell align="center">Horário Marcado</TableCell>
                  <TableCell align="center">Consultora</TableCell>
                  <TableCell align="center">Técnico / Motorista</TableCell>
                  <TableCell align="center">Veiculo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule && schedule.map((visita) => (
                  <TableRow
                    hover
                    key={visita.id}
                    className={`list-visit`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {visita.categoria === "lunch" && <TableCell style={{ filter: 'contrast', padding: '0.2rem' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></TableCell>}
                    {visita.categoria === "comercial" && <TableCell style={{ padding: '0.2rem' }} className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></TableCell>}
                    {visita.categoria === "comercial_tecnica" && <TableCell style={{ padding: '0.2rem' }} className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></TableCell>}
                    {visita.categoria === "pos_venda" && <TableCell style={{ padding: '0.2rem' }} className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></TableCell>}
                    <TableCell className="td-finance" sx={{ width: 30 }} align="center" scope="row">
                      {visita.dia.substring(8, 10)}
                    </TableCell>
                    <TableCell className="td-finance" align="center">{visita.cidade}</TableCell>
                    <TableCell className="td-finance" align="center">{visita.cliente}</TableCell>
                    <TableCell className="td-finance"
                     aria-label={visita.saida && `Saida: ${visita.saida} - Chegada: ${visita.chegada}`}
                     data-cooltipz-dir="top"
                    align="center"
                    >{visita.horario}</TableCell>
                    <TableCell className="td-finance"
                    sx={{ backgroundColor: `${visita.cor}`, color: '#fff', fontWeight: 'bold' }} 
                    align="center" scope="row">
                      {visita.consultora}
                    </TableCell>
                    <TableCell className="td-finance" align="center">{visita.tecnico}</TableCell>
                    <TableCell className="td-finance" align="center">{visita.veiculo}</TableCell>
                  </TableRow>
                ))}
                {schedule && schedule.length < 1 &&
                  <TableRow>
                    <TableCell colSpan={15}>
                      <p className="margin1" style={{ textAlign: 'center', margin: '1rem', fontSize: '1.2rem' }}>Nenhuma Visita Encontrada</p>
                    </TableCell>
                  </TableRow>
                } 
              </TableBody>
            </Table>
          </TableContainer>
            <div className="print">
            <button className="btn-print" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
