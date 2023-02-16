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
} from "firebase/firestore";

import "./_style.scss";

// import CreateVisit from "../../components/Modal/Create/Index";
import EditVisit from "../../components/Box/Edit/Index";
import CreateVisit from "../../components/Box/Create/Index"
import CreateVisitGroup from "../../components/Box/Group/Index"

const Schedule = () => {
  const data = new Date();
  const { year } = useParams();
  const { user } = useAuth();

  const boxVisitRef = useRef();
  const [schedule, setSchedule] = useState();
  const [members, setMembers] = useState();
  const [userRef, setUserRef] = useState();
  const [tecs, setTecs] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(data.getMonth() + 1).padStart(2, "0")
  );
  const [editVisit, setEditVisit] = useState({ check: false });
  const [createVisit, setCreateVisit] = useState(false);
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
            schedule.docs.map((doc) => (
              { ...doc.data(), id: doc.id }
              ))
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
    if(schedule) {
      setSchedule(schedule.sort(function(a, b) {
        if(a.data === b.data) {
          if(a.saidaEmpresa < b.saidaEmpresa) return -1;
          if(a.saidaEmpresa > b.saidaEmpresa) return 1;
        }
        return 0;
      }))
      console.log(dayVisits)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[schedule])

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
    boxVisitRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'start' });
  }

  const returnSchedule = () => {
    setBox();
    setDayVisits(undefined);
  };

  const filterSchedule = (data, tec) => {
    if(data) {
      setDayVisits(
          schedule.filter(
            (dia) => dia.data === data && dia.tecnico === tec
          )
          );
    } else {
      setDayVisits(undefined);
      console.log(dayVisits)
      console.log(data)
    }
  }

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
          await deleteDoc(
            doc(dataBase, "Agendas", year, monthSelect, visit.id)
            );
            if(visit.idRef) {
              await updateDoc(doc(dataBase, "Agendas", year, monthSelect, visit.idRef), {
                visitaConjunta: false
              })
            }
          setCreateVisit(false);
          setEditVisit({check:false});
          setCreateVisitGroup({check:false});
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
    const visitRef = doc(dataBase, "Agendas", year, monthSelect, ref.id);

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
          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Visita em <b>${ref.cidade}</b> foi confirmada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200",
          });
          await updateDoc(visitRef, {
            //Atualizar dados sem sobrescrever os existentes
            confirmar: true,
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
        }
      });
    }
  };

  const changeBox = (type) => {
    setBox(type)
  }

  // const createLunch = async (ref) => {
  //   const dateNow = moment();
  //   const saidaRef = moment(dateNow).format("kk:mm");
  //   const diaRef = moment(dateNow).format("YYYY MM DD");
  //   const chegadaRef = moment(dateNow).add(60, "m").format("kk:mm");

  //   await addDoc(scheduleRef, {
  //     dia: diaRef,
  //     saidaEmpresa: saidaRef,
  //     chegadaCliente: "",
  //     visita: "",
  //     saidaDoCliente: "",
  //     chegadaEmpresa: chegadaRef,
  //     consultora: "Almoço Téc.",
  //     tecnico: userRef.nome,
  //     tecnicoUID: user.id,
  //     cidade: "",
  //     tempoRota: "",
  //     data: "",
  //     uid: user.id,
  //     cor: "#111111",
  //     confirmar: false,
  //   });
  // };

  console.log(userRef);

  return (
    <div className="container-schedule">
      <Header user={user}></Header>
      <div className="title-schedule">
        <h2>Visita Técnica - Agenda {year} </h2>
      </div>
      <div className="content-schedule-visit">
        <div className="box-schedule-visit">
        <div ref={boxVisitRef}>
        {(box === 'create' && <CreateVisit
            returnSchedule={returnSchedule}
            filterSchedule={filterSchedule}
            scheduleRef={scheduleRef}
            membersRef={members}
            tecs={tecs}
            userRef={userRef}
            schedule={schedule}
            monthNumber={monthNumber}
          />)// Chama o componente 'Create'
        || (box === "edit" &&
            <EditVisit
            returnSchedule={returnSchedule}
            filterSchedule={filterSchedule}
            tecs={tecs}
            scheduleRef={editVisit.ref}
            visitRef={editVisit.info}
            membersRef={members}
            schedule={schedule}
            monthNumber={monthNumber}
            year={year}
          />) // Chama o componente 'Edit'
        || (box === "group" &&
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
          />) // Chama o componente 'Group'
        }

          {/* {(schedule && createVisit && editVisit.check === false) ? (    
        <CreateVisit
          returnSchedule={returnSchedule}
          filterSchedule={filterSchedule}
          scheduleRef={scheduleRef}
          membersRef={members}
          tecs={tecs}
          userRef={userRef}
          schedule={schedule}
          monthNumber={monthNumber}
        ></CreateVisit>) : (
          <></>
        )}
        {createVisitGroup.check &&
        (<CreateVisitGroup
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
        ></CreateVisitGroup>
        )}

      {editVisit.check && (
        <EditVisit
          returnSchedule={returnSchedule}
          filterSchedule={filterSchedule}
          tecs={tecs}
          scheduleRef={editVisit.ref}
          visitRef={editVisit.info}
          membersRef={members}
          schedule={schedule}
          monthNumber={monthNumber}
          year={year}
        ></EditVisit>
      )} */}
          </div>
          {(userRef && userRef.cargo === "Vendedor(a)" && !box) ||
          user.email === "admin@infinitenergy.com.br" ? (
            <div className="box-schedule-visit__add">
              <button className="visit" onClick={ () => {changeBox("create"); return handleBoxVisitRef()}}>
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
          {dayVisits === undefined && 
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
          }
          <div className="container-table">
          {dayVisits && dayVisits.length > 0 && <table className="table-visit">
              <thead>
                <tr>
                  <th>V.C</th>
                  <th>Dia</th>
                  <th>Cidade</th>
                  <th>Hórario de Saida</th>
                  <th>Chegada no Cliente</th>
                  <th>Tempo de Visita</th>
                  <th>Saída no Cliente</th>
                  <th>Chegada na Empresa</th>
                  <th>Consultora</th>
                  <th>Técnico</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                  {dayVisits.map((info) => (
                    <>
                      <tr
                        className={info.confirmar ? "table-confirm" : "table"}
                        key={info.id}
                      >
                        <td>
                          <button
                                className="btn-add"
                                onClick={ () => {setBox("group"); setCreateVisitGroup({info: info, ref: doc(
                                  dataBase,
                                  "Agendas",
                                  year,
                                  monthSelect,
                                  info.id
                                )}); return handleBoxVisitRef()}}
                              ></button>
                        </td>
                        <td className="bold">
                          {moment(new Date(info.dia)).format("D")}
                        </td>
                        <td>{info.cidade}</td>
                        <td className="bold bg-important">
                          {info.saidaEmpresa}
                        </td>
                        <td>{info.chegadaCliente}</td>
                        <td>{info.visita}</td>
                        <td>{info.saidaDoCliente}</td>
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

                        <td>
                          {info.confirmar === false &&
                          (info.uid === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                              <button
                                className="btn-edit"
                                onClick={() =>
                                  {setBox("edit");
                                    setEditVisit({
                                    info: info,
                                    ref: doc(
                                      dataBase,
                                      "Agendas",
                                      year,
                                      monthSelect,
                                      info.id
                                    )
                                  })
                                  return handleBoxVisitRef()}
                                }
                              ></button>
                              <button
                                className="btn-delete"
                                onClick={() => deleteVisit(info)}
                              ></button>
                            </>
                          ) : (
                            <></>
                          )}

                          {info.confirmar === false &&
                          (info.tecnicoUID === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                              <button
                                className="btn-confirm"
                                onClick={() => confirmVisit(info, "confirm")}
                              ></button>
                            </>
                          ) : (
                            <></>
                          )}

                          {info.confirmar === true &&
                          (info.tecnicoUID === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                              <button
                                className="btn-cancel"
                                onClick={() => confirmVisit(info, "cancel")}
                              ></button>
                            </>
                          ) : (
                            <></>
                          )}
                        </td>
                      </tr>
                    </>
                  ))}
              </tbody>
            </table>}
            <table className="table-visit">
              <thead>
                <tr>
                  <th>V.C</th>
                  <th>Dia</th>
                  <th>Cidade</th>
                  <th>Hórario de Saida</th>
                  <th>Chegada no Cliente</th>
                  <th>Tempo de Visita</th>
                  <th>Saída no Cliente</th>
                  <th>Chegada na Empresa</th>
                  <th>Consultora</th>
                  <th>Técnico</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {schedule &&
                  schedule.map((info) => (
                    <>
                      <tr
                        className={
                          info.confirmar ? "table-confirm" : "table" &&
                          info.visitaConjunta ? "border-top" : "table" &&
                          info.idRef ? "border-bottom" : "table"
                        }
                        key={info.id}
                      >
                          {info.visitaConjunta ? 
                          <td></td> : 
                          <td><button
                                className="btn-add"
                                onClick={ () => {setBox("group"); setCreateVisitGroup({check: true, info: info, ref: doc(
                                  dataBase,
                                  "Agendas",
                                  year,
                                  monthSelect,
                                  info.id
                                )}); return handleBoxVisitRef()}}
                              ></button></td>
                          }
                        <td className="bold">
                          {moment(new Date(info.dia)).format("D")}
                        </td>
                        <td>{info.cidade}</td>
                        <td className="bold bg-important">
                          {info.saidaEmpresa}
                        </td>
                        <td>{info.chegadaCliente}</td>
                        <td>{info.visita}</td>
                        <td>{info.saidaDoCliente}</td>
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

                        <td>
                          {info.confirmar === false &&
                          (info.uid === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                              <button
                                className="btn-edit"
                                onClick={() =>
                                  {setBox("edit");
                                    setEditVisit({
                                    info: info,
                                    ref: doc(
                                      dataBase,
                                      "Agendas",
                                      year,
                                      monthSelect,
                                      info.id
                                    ),
                                  })
                                return handleBoxVisitRef()}
                                }
                              ></button>
                              <button
                                className="btn-delete"
                                onClick={() => deleteVisit(info)}
                              ></button>
                            </>
                          ) : (
                            <></>
                          )}

                          {info.confirmar === false &&
                          (info.tecnicoUID === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                              <button
                                className="btn-confirm"
                                onClick={() => confirmVisit(info, "confirm")}
                              ></button>
                            </>
                          ) : (
                            <></>
                          )}

                          {info.confirmar === true &&
                          (info.tecnicoUID === user.id ||
                            user.email === "admin@infinitenergy.com.br") ? (
                            <>
                              <button
                                className="btn-cancel"
                                onClick={() => confirmVisit(info, "cancel")}
                              ></button>
                            </>
                          ) : (
                            <></>
                          )}
                        </td>
                      </tr>
                    </>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
