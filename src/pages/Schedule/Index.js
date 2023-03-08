import { useEffect, useState, useRef } from "react";
import moment from "moment";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import useAuth from "../../hooks/useAuth";

import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

import 'cooltipz-css';
import "./_style.scss";

// import CreateVisit from "../../components/Modal/Create/Index";
import EditVisit from "../../components/Box/Edit/Index";
import CreateVisit from "../../components/Box/Create/Index";
import CreateVisitGroup from "../../components/Box/Group/Index";

const Schedule = () => {
  const data = new Date();
  const { year } = useParams();
  const { user } = useAuth();

  const boxVisitRef = useRef();
  const [schedule, setSchedule] = useState();
  const [scheduleNew, setScheduleNew] = useState();
  const [members, setMembers] = useState();
  const [userRef, setUserRef] = useState();
  const [tecs, setTecs] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(data.getMonth() + 1).padStart(2, "0")
  );
  const [editVisit, setEditVisit] = useState({ check: false });
  const [box, setBox] = useState();
  const [createVisitGroup, setCreateVisitGroup] = useState({ check: false });
  const [dayVisits, setDayVisits] = useState(undefined);
  const [scheduleRef, setScheduleRef] = useState();
  const membersCollectionRef = collection(dataBase, "Membros");
  const [monthNumber, setMonthNumber] = useState();

  useEffect(
    () => {
      const schedulesCollectionRef = collection(
        dataBase,
        "Agendas",
        year,
        monthSelect
      );
      const fetchData = async () => {
        const q = query(schedulesCollectionRef, orderBy("dia"));
        onSnapshot(await q, (schedule) => {
          // Atualiza os dados em tempo real
          setSchedule(
            schedule.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          ); // puxa a coleção 'Chats' para o state
          setScheduleRef(schedulesCollectionRef);
          //setDayVisits(schedule.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
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
    setDayVisits(dayVisits);
  }, [dayVisits]);

  useEffect(() => {
    if (schedule && monthSelect) {
      setScheduleNew(
        schedule.sort(function (a, b) {
          // Força a renderizaram da tabela ordenada
          if (a.data === b.data) {
            if (a.saidaEmpresa < b.saidaEmpresa) return -1;
            if (a.saidaEmpresa > b.saidaEmpresa) return 1;
          }
          return 0;
        })
      );
    }
    console.log(scheduleNew);
  }, [monthSelect, schedule, scheduleNew]);

  useEffect(
    () => {
      const fetchData = async () => {
        if (members) {
          setUserRef(members.find((doc) => doc.uid === user.id));
          setTecs(members.filter((member) => member.cargo === "Técnico"));
        }
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members]
  );

  console.log(monthSelect);

  useEffect(() => {
    const findMonth = () => {
      const ano = year.toString();
      const dia = moment(ano + "-" + monthSelect, "YYYY-MM")
        .daysInMonth()
        .toString();
      setMonthNumber({
        min: ano + "-" + monthSelect + "-01",
        max: ano + "-" + monthSelect + "-" + dia,
      });
    };

    findMonth();
  }, [monthSelect, year]);

  const handleBoxVisitRef = () => {
    boxVisitRef.current.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "start",
    });
  };

  const returnSchedule = () => {
    setBox();
    setDayVisits(undefined);
  };

  const filterSchedule = (data, tec) => {
    if (data) {
      setDayVisits(
        schedule.filter((dia) => dia.data === data && dia.tecnico === tec)
      );
    } else {
      setDayVisits(undefined);
      console.log(dayVisits);
      console.log(data);
    }
  };

  console.log(schedule);

  const deleteVisit = async (visit) => {
    try {
      Swal.fire({
        title: "Infinit Energy Brasil",
        html: `Você deseja deletar essa <b>Visita</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const visitsAntes = schedule.filter(ref => (ref.data === visit.data && ref.chegadaEmpresa === visit.saidaEmpresa  && ref.consultora !== 'Almoço Téc.'));
          const visitsDepois = schedule.filter(ref => (ref.data === visit.data && ref.saidaEmpresa === visit.chegadaEmpresa && ref.consultora !== 'Almoço Téc.'));
          console.log(visitsAntes, visitsDepois);
          if(visitsAntes) {
            visitsAntes.map(async (ref) => {
              if(ref.cidade === visit.cidade) {
                if(ref.idRef) {
                  await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.idRef),
                              {
                                chegadaEmpresa: ref.chegadaEmpresaRef,
                                groupRef: "",
                                group: "",
                                visitaConjunta: false,
                                tipo: "Visita"
                              })
                }
                await deleteDoc(
                  doc(dataBase, "Agendas", year, monthSelect, ref.id)
                );
              } else {
                await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.id),
                            {
                              chegadaEmpresa: moment(ref.chegadaEmpresa, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'),
                              groupRef: "",
                              group: "",
                              visitaConjunta: false,
                              tipo: "Visita"
                            })
              }
                console.log(ref.chegadaEmpresa ,moment(ref.chegadaEmpresa, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'))
          })
          }
          if (visitsDepois) {
            visitsDepois.map(async (ref) => {
             const visitNext =  schedule.filter(next => (next.data === ref.data && next.saidaEmpresa === ref.chegadaEmpresa && ref.consultora !== 'Almoço Téc.'));
              if(ref.cidade === visit.cidade) {
                if(visitNext) {
                  await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.idRef),
                              {
                                saidaEmpresa: ref.saidaEmpresaRef,
                                groupRef: "",
                                group: "",
                                visitaConjunta: false,
                                tipo: "Visita"
                              })
                }
               await deleteDoc(
                doc(dataBase, "Agendas", year, monthSelect, ref.id)
              );
              } else {
                console.log('cidade diferente')

                await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.id),
                          {
                            saidaEmpresa: moment(ref.chegadaCliente, "hh:mm").subtract(ref.tempoRota, 'seconds').format('kk:mm'),
                            groupRef: "",
                            group: "",
                            visitaConjunta: false,
                            tipo: "Visita"
                          })
              }
              
              console.log(ref.saidaEmpresa ,moment(ref.chegadaCliente, "hh:mm").subtract(ref.tempoRota, 'seconds').format('kk:mm'))
            })

          }
          console.log(visitsAntes, visitsDepois)
          await deleteDoc(
            doc(dataBase, "Agendas", year, monthSelect, visit.id)
          );
          setBox();
          setDayVisits(undefined);
          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Visita em <b>${visit.cidade}</b> foi deletada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200",
          });
        }
      });
    } catch {}
  };

  const confirmVisit = async (ref, type) => {
    console.log(type, ref);
    const tecRef = tecs.find((tec) => tec.uid === ref.tecnicoUID);
    console.log(tecRef);
    const visitRef = doc(dataBase, "Agendas", year, monthSelect, ref.id);
    const financeCol = collection(dataBase, "Financeiro", year, monthSelect);
    const financeRef = doc(financeCol, ref.id);

    if (type === "confirm") {
      Swal.fire({
        title: "Infinit Energy Brasil",
        html: `Você deseja confirmar essa <b>Visita</b>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateDoc(visitRef, {
            //Atualizar dados sem sobrescrever os existentes
            confirmar: true,
          });
          await setDoc(financeRef, {
            data: ref.data,
            dia: ref.dia,
            cidade: ref.cidade,
            cliente: ref.cliente,
            horario: ref.chegadaCliente,
            consultora: ref.consultora,
            cor: ref.cor,
            tecnico: ref.tecnico,
            tecnicoUID: ref.tecnicoUID,
            carro: tecRef.carro,
          });
          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Visita em <b>${ref.cidade}</b> foi confirmada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200",
          });
        }
      });
    } else {
      Swal.fire({
        title: "Infinit Energy Brasil",
        html: `Você deseja cancelar essa <b>visita</b>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Visita em <b>${ref.cidade}</b> foi cancelada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200",
          });
          await updateDoc(visitRef, {
            //Atualizar dados sem sobrescrever os existentes
            confirmar: false,
          });
          await deleteDoc(financeRef);
        }
      });
    }
  };

  const changeBox = (type) => {
    setBox(type);
  };

  const createVisitGroupChoice = (ref) => {
    Swal.fire({
      title: "Infinit Energy Brasil",
      html: `Você deseja criar a visita conjunta <b>antes</b> ou <b>depois</b> da visita escolhida? </br></br>
      <b>Atenção: Verifique se já existe alguma visita criada proxima a visita escolhida.</b>`,
      icon: "question",
      showDenyButton: true,
      showCloseButton: true,
      confirmButtonColor: "#F39200",
      confirmButtonText: "Antes",
      denyButtonText: `Depois`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        setTimeout(() => {
          setCreateVisitGroup({
            check: true,
            type: "antes",
            info: ref,
            ref: doc(dataBase, "Agendas", year, monthSelect, ref.id),
          });
          setBox("group");
          return handleBoxVisitRef();
        }, 400);
      } else if (result.isDenied) {
        setTimeout(() => {
          setCreateVisitGroup({
            check: true,
            type: "depois",
            info: ref,
            ref: doc(dataBase, "Agendas", year, monthSelect, ref.id),
          });
          setBox("group");
          return handleBoxVisitRef();
        }, 400);
      }
    });
  };

  // ToolTips


  return (
    <div className="container-schedule">
      <Header user={user}></Header>
      <div className="title-schedule">
        <h2>Visita Técnica - Agenda {year} </h2>
      </div>
      <div className="content-schedule-visit">
        <div className="box-schedule-visit">
          <div ref={boxVisitRef}>
            {
              (box === "create" && (
                <CreateVisit
                  returnSchedule={returnSchedule}
                  filterSchedule={filterSchedule}
                  scheduleRef={scheduleRef}
                  membersRef={members}
                  tecs={tecs}
                  userRef={userRef}
                  schedule={schedule}
                  monthNumber={monthNumber}
                />
              )) || // Chama o componente 'Create'
                (box === "edit" && (
                  <EditVisit
                    returnSchedule={returnSchedule}
                    filterSchedule={filterSchedule}
                    tecs={tecs}
                    scheduleRef={scheduleRef}
                    scheduleRefUID={editVisit.ref}
                    visitRef={editVisit.info}
                    membersRef={members}
                    schedule={schedule}
                    monthNumber={monthNumber}
                    monthSelect={monthSelect}
                    year={year}
                  />
                )) || // Chama o componente 'Edit'
                (box === "group" && (
                  <CreateVisitGroup
                    returnSchedule={returnSchedule}
                    filterSchedule={filterSchedule}
                    tecs={tecs}
                    userRef={userRef}
                    scheduleRef={scheduleRef}
                    scheduleVisitRef={createVisitGroup.ref}
                    visitRef={createVisitGroup.info}
                    membersRef={members}
                    schedule={schedule}
                    monthNumber={monthNumber}
                    year={year}
                    type={createVisitGroup.type}
                  />
                )) // Chama o componente 'Group'
            }
          </div>
          {(userRef && userRef.cargo === "Vendedor(a)" && !box) ||
          user.email === "admin@infinitenergy.com.br" ? (
            <div className="box-schedule-visit__add">
              <button
                className="visit"
                onClick={() => {
                  changeBox("create");
                  return handleBoxVisitRef();
                }}
              >
                <span className="icon-visit"></span>Criar uma Visita
              </button>
            </div>
          ) : (
            <></>
          )}
          {/* {(userRef && userRef.cargo === "Técnico") ||
          user.email === "admin@infinitenergy.com.br" ? (
            <div className="box-schedule-visit__add">
              <button className="lunch" onClick={() => createLunch(userRef)}>
                <span className="icon-visit"></span>Confirmar Almoço
              </button>
            </div>
          ) : (
            <></>
          )} */}
          {dayVisits === undefined && (
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
          )}
          <div className="container-table">
            {dayVisits && dayVisits.length > 0 && (
              <table className="table-visit">
                <thead>
                  <tr>
                    <th>V.C</th>
                    <th>Dia</th>
                    <th>Cidade</th>
                    <th>Cliente</th>
                    <th>Hórario de Saida</th>
                    <th>Chegada no Cliente</th>
                    <th>Tempo de Visita</th>
                    <th>Saída no Cliente</th>
                    <th>Chegada na Empresa</th>
                    <th>Consultora</th>
                    <th>Técnico</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {dayVisits.map((info, index) => (
                    <tr
                      className={info.confirmar ? "table-confirm" : "table"}
                      key={index}
                    >
                      {info.consultora === "Almoço Téc." && (
                        <td className="lunch"></td>
                      )}
                      {info.visitaConjunta &&
                        info.groupRef === "antes" &&
                        info.confirmar === false && (
                          <td className="group-top"></td>
                        )}
                      {info.visitaConjunta &&
                        info.groupRef === "depois" &&
                        info.confirmar === false && (
                          <td className="group-bottom"></td>
                        )}
                      {!info.visitaConjunta &&
                        info.consultora !== "Almoço Téc." &&
                        info.confirmar === false && <td></td>}
                      {info.confirmar === true && <td></td>}
                      <td className="bold">
                        {moment(new Date(info.dia)).format("D")}
                      </td>
                      <td className="no-wrap">{info.cidade}</td>
                      <td>{info.cliente}</td>
                      <td className="bold bg-important">{info.saidaEmpresa}</td>
                      {info.consultora !== "Almoço Téc." ?
                        <td></td> : <td>{info.chegadaCliente}</td>
                      }
                      <td>{info.visita}</td>
                      <td
                        className={
                          info.consultora !== "Almoço Téc."
                            ? "bg-important-2"
                            : null
                        }
                      >
                        {info.saidaDoCliente}
                      </td>
                      <td className="bold bg-important">
                        {info.chegadaEmpresa}
                      </td>
                      <td
                        style={
                          info.cor && {
                            backgroundColor: info.cor,
                            border: `1px solid ${info.cor}`,
                            borderTop: "none",
                            color: "#fff",
                          }
                        }
                      >
                        {info.consultora}
                      </td>
                      <td>{info.tecnico}</td>
                      <td className="observation">{info.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {schedule && schedule.length > 0 && (
              <table className="table-visit">
                <thead>
                  <tr>
                    <th className="icons"></th>
                    <th>V.C</th>
                    <th>Dia</th>
                    <th>Cidade</th>
                    <th>Cliente</th>
                    <th>Hórario de Saida</th>
                    <th>Chegada no Cliente</th>
                    <th>Tempo de Visita</th>
                    <th>Saída no Cliente</th>
                    <th>Chegada na Empresa</th>
                    <th>Consultora</th>
                    <th>Técnico</th>
                    <th>Observação</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule &&
                    schedule.map((info, index) => (
                      <tr
                        className={info.confirmar ? "table-confirm" : "table"}
                        key={index}
                      >
                        {(info.tipo === "Visita" &&
                        (<td className="visit-icon cursor-help" aria-label="Visita" 
                        data-cooltipz-dir="right"></td>)) ||
                        (info.tipo === "Visita Conjunta" &&
                        (<td className="group-icon cursor-help" aria-label="Visita Conjunta" 
                        data-cooltipz-dir="right"></td>)) || 
                        (info.tipo === "Almoço" &&
                        (<td className="lunch-icon cursor-help" aria-label="Almoço" 
                        data-cooltipz-dir="right"></td>))}
                        {info.confirmar === false ? (
                          <td aria-label="Criar Visita Conjunta" 
                          data-cooltipz-dir="right">
                            <button
                              className="btn-add"
                              onClick={() => createVisitGroupChoice(info)}
                            >
                            </button>
                          </td>
                        ) : (
                          <></>
                        )}
                        {info.confirmar === true && <td></td>}
                        <td className="bold">
                          {moment(new Date(info.dia)).format("D")}
                        </td>
                        <td className="no-wrap">{info.cidade}</td>
                        <td>{info.cliente}</td>
                        <td className="bold bg-important">
                          {info.saidaEmpresa}
                        </td>
                        {info.consultora === "Almoço Téc." ?
                        <td></td> : <td>{info.chegadaCliente}</td>
                        }
                        <td>{info.visita}</td>
                        {info.consultora === "Almoço Téc." ?
                        <td></td> : <td className={
                          info.consultora !== "Almoço Téc."
                            ? "bg-important-2"
                            : null
                        }>{info.saidaDoCliente}</td>
                        }
                        <td className="bold bg-important">
                          {info.chegadaEmpresa}
                        </td>
                        <td
                          style={
                            info.cor && {
                              backgroundColor: info.cor,
                              borderBottom: `1px solid ${info.cor}`,
                              borderRight: `1px solid ${info.cor}`,
                              borderLeft: `1px solid ${info.cor}`,
                              color: "#fff",
                            }
                          }
                        >
                          {info.consultora}
                        </td>
                        <td>{info.tecnico}</td>
                        <td className="observation">{info.observacao}</td>
                        <td className="action">
                          
                          {(info.confirmar === false &&
                            info.uid === user.id) ||
                          user.email === "admin@infinitenergy.com.br" ||
                            info.consultora === "Almoço Téc." ? (
                            <>
                            <div aria-label="Editar Visita" 
                              data-cooltipz-dir="left">
                              <button
                                className="btn-edit"
                                id="edit-visit"
                                onClick={() => {
                                  setBox("edit");
                                  setEditVisit({
                                    info: info,
                                    ref: doc(
                                      dataBase,
                                      "Agendas",
                                      year,
                                      monthSelect,
                                      info.id
                                    ),
                                  });
                                  return handleBoxVisitRef();
                                }}
                              ></button>
                              </div>
                              <div aria-label="Excluir Visita" 
                              data-cooltipz-dir="left">
                              <button
                                className="btn-delete"
                                id="edit-visit"
                                onClick={() => deleteVisit(info)}
                              ></button>
                              </div>
                            </>
                          ) : (
                            <></>
                          )}

                          {info.confirmar === false &&
                          info.consultora !== "Almoço Téc." &&
                          (info.tecnicoUID === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                            <div aria-label="Confirmar Visita" 
                              data-cooltipz-dir="left">
                              <button
                                className="btn-confirm"
                                onClick={() => confirmVisit(info, "confirm")}
                              ></button>
                              </div>
                            </>
                          ) : (
                            <></>
                          )}

                          {info.confirmar === true &&
                          (info.tecnicoUID === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                            <div aria-label="Cancelar Visita" 
                              data-cooltipz-dir="left">
                              <button
                                className="btn-cancel"
                                onClick={() => confirmVisit(info, "cancel")}
                              ></button>
                              </div>
                            </>
                          ) : (
                            <></>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
