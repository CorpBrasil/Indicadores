import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import useAuth from "../../hooks/useAuth";

import {
  onSnapshot,
  collection,
  query,
  orderBy
} from "firebase/firestore";

import "../Schedule/_style.scss";

const Finance = ({ userRef }) => {
  const data = new Date();
  const { year } = useParams();
  const { user } = useAuth();
  const month = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const [schedule, setSchedule] = useState();
  const [scheduleNew, setScheduleNew] = useState();
  const [members, setMembers] = useState();
  const [tecs, setTecs] = useState();
  const [sales, setSales] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(data.getMonth() + 1).padStart(2, "0")
  );
  const membersCollectionRef = collection(dataBase, "Membros");

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
    }
    // console.log(tecs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[members, monthSelect, schedule, scheduleNew])

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

   console.log(schedule);

  return (
    <div className="container-schedule">
      <Header user={user} userRef={userRef}></Header>
      <div className="title-schedule">
        <h2>Agenda {year} </h2>
        <h2>Relátorio Mensal - {month[parseFloat(monthSelect)]} </h2>
      </div>
      <div className="content-schedule-visit">
        <div className="box-schedule-visit">
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
          {tecs && tecs.length > 0 &&
          <div className="container-table">
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
                      <td>{schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec).length}</td>
                      <td>
                      {(schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec).length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}
                      </td>
                    </tr>
                    ))}
                    <tr className="bg-total">
                      <td>{schedule.filter((ref) => ref.tecnico === tec).length}</td>
                      <td>{(schedule.filter((ref) => ref.tecnico === tec).length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
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
                      {(schedule.filter((ref) => ref.consultora === vend && ref.tecnico === tec).length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}
                      </td>
                    </tr>
                    ))}
                    <tr className="bg-total">
                      <td>Total</td>
                      <td>{schedule.filter((ref) => ref.tecnico === tec).length}</td>
                      <td>{(schedule.filter((ref) => ref.tecnico === tec).length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
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
                      {(schedule.filter((ref) => ref.consultora === vend && ref.tecnico !== 'Nenhum').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}
                      </td>
                    </tr>
                    ))}
                    <tr className="bg-total">
                      <td>{schedule.filter((ref) => ref.tecnico).length}</td>
                      <td>{(schedule.filter((ref) => ref.tecnico && ref.tecnico !== 'Nenhum').length * 20).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                    </tr>
                  </tbody>
                </table>
                </div>        
            <div>
            </div>
            <table className="table-finance table-center last">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Cidade</th>
                  <th>Cliente</th>
                  <th>Horário Marcado</th>
                  <th>Consultora</th>
                  <th>Técnico</th>
                  <th>Veículo</th>
                </tr>
              </thead>
              <tbody>
                {schedule &&
                  schedule.map((info, index) => (
                      <tr
                        className="table"
                        key={index}>
                        <td className="bold">
                          {info.dia.substring(info.dia.length - 2)}
                        </td>
                        <td>{info.cidade}</td>
                        <td>{info.cliente}</td>
                        <td className="bold bg-important">
                          {info.horario}
                        </td>
                        <td
                          style={info.cor && {
                            backgroundColor: info.cor,
                            borderBottom: `1px solid ${info.cor}`,
                            borderRight: `1px solid ${info.cor}`,
                            borderLeft: `1px solid ${info.cor}`,
                            color: "#fff",
                            textShadow: '#5a5a5a -1px 0px 5px',
                          }}
                        >
                          {info.consultora}
                        </td>
                        <td>{info.tecnico}</td>
                        <td>{info.veiculo}</td>
                      </tr>
                  ))}
              </tbody>
            </table>
            <div className="print">
            <button className="btn-print" onClick={() => window.print()}>Imprimir / Salvar PDF</button>
          </div>
          </div>
          }
        </div>
      </div>
    </div>
  );
};

export default Finance;
