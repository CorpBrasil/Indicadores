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

import EditVisit from "../../components/Box/Edit/Index";
import CreateVisit from "../../components/Box/Create/Index";
import CreateVisitGroup from "../../components/Box/Group/Index";
import { Company, Users } from "../../data/Data";

const Schedule = ({userRef, members, tecs}) => {
  const data = new Date();
  const checked = JSON.parse(localStorage.getItem("foco"));
  const [focoCheck, setFocoCheck] = useState(false);
  const { year } = useParams();
  const { user } = useAuth();

  const boxVisitRef = useRef();
  const [schedule, setSchedule] = useState();
  const [scheduleNew, setScheduleNew] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(data.getMonth() + 1).padStart(2, "0")
  );
  const [editVisit, setEditVisit] = useState({ check: false });
  const [box, setBox] = useState();
  const [createVisitGroup, setCreateVisitGroup] = useState({ check: false });
  const [dayVisits, setDayVisits] = useState(undefined);
  const [scheduleRef, setScheduleRef] = useState();
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

  // useEffect(
  //   () => {
  //     const fetchData = async () => {
  //       onSnapshot(membersCollectionRef, (member) => {
  //         // Atualiza os dados em tempo real
  //         setMembers(member.docs.map((doc) => ({ ...doc.data(), id: doc.id }))); // puxa a coleção 'Chats' para o state
  //       });
  //     };
  //     fetchData();
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // );

  useEffect(() => {
    setDayVisits(dayVisits);
  }, [dayVisits]);

  useEffect(() => {
    if (checked === true) { // Altera o valor da input 'toggle'
      setFocoCheck(true)
    };
  }, [checked]);

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

  // useEffect(
  //   () => {
  //     const fetchData = async () => {
  //       if (members) {
  //         setTecs(members.filter((member) => member.cargo === "Técnico"));
  //       }
  //     };
  //     fetchData();
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [members]
  // );

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

  const visitsFind = (type, visit) => {
    if (type === 'antes')  return schedule.filter(ref => (ref.data === visit.data && ref.chegadaEmpresa === visit.saidaEmpresa))
    if (type === 'depois') return schedule.filter(ref => (ref.data === visit.data && ref.saidaEmpresa === visit.chegadaEmpresa))
  }

  const deleteVisit = async (visit) => {
    try {
      Swal.fire({
        title: Company,
        html: `Você deseja deletar essa <b>Visita</b>?`,
        icon: "warning",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const visitsAntes = visitsFind('antes', visit);
          const visitsDepois = visitsFind('depois', visit);
          if(visitsAntes.length > 0) {
            visitsAntes.map(async (ref) => {
              const visitBefore =  schedule.filter(before => (before.data === ref.data && before.chegadaEmpresa === ref.saidaEmpresa && ref.consultora !== 'Almoço Téc.' && before.tipo === "Visita Conjunta"));
              if(ref.cidade === visit.cidade) {
                if(visitBefore) {
                  visitBefore.map(async (ref) => {
                    await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.id),
                                {
                                  chegadaEmpresa: moment(ref.saidaDoCliente, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'),
                                  groupRef: "",
                                  group: "",
                                  visitaConjunta: false,
                                  tipo: "Visita"
                                })
                              })
                  }
                await deleteDoc(
                  doc(dataBase, "Agendas", year, monthSelect, ref.id)
                );
              } else {
                await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.id),
                            {
                              chegadaEmpresa: moment(ref.saidaDoCliente, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'),
                              groupRef: "",
                              group: "",
                              visitaConjunta: false,
                              tipo: "Visita"
                            })
              }
                console.log(ref.chegadaEmpresa ,moment(ref.chegadaEmpresa, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'))
          })
          }
          if (visitsDepois.length > 0) {
            visitsDepois.map(async (ref) => {
             const visitNext =  schedule.filter(next => (next.data === ref.data && next.saidaEmpresa === ref.chegadaEmpresa && ref.consultora !== 'Almoço Téc.' && next.tipo === "Visita Conjunta"));
              if(ref.cidade === visit.cidade) {
                if(visitNext) {
                  visitNext.map(async (ref) => {
                    await updateDoc(doc(dataBase, "Agendas", year, monthSelect, ref.id),
                                {
                                  saidaEmpresa: moment(ref.chegadaCliente, "hh:mm").subtract(ref.tempoRota, 'seconds').format('kk:mm'),
                                  groupRef: "",
                                  group: "",
                                  visitaConjunta: false,
                                  tipo: "Visita"
                                })
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
            title: Company,
            html: `A Visita em <b>${visit.cidade}</b> foi deletada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            showCloseButton: true,
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
        title: Company,
        html: `Você deseja confirmar essa <b>Visita</b>?`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
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
            veiculo: ref.veiculo,
          });
          Swal.fire({
            title: Company,
            html: `A Visita em <b>${ref.cidade}</b> foi confirmada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          });
        }
      });
    } else {
      Swal.fire({
        title: Company,
        html: `Você deseja cancelar essa <b>visita</b>?`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: Company,
            html: `A Visita em <b>${ref.cidade}</b> foi cancelada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            showCloseButton: true,
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
      title: Company,
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
        let msg;
        const antes = visitsFind('antes', ref);
        if(antes.length > 0) {
          if(antes[0].tipo === 'Almoço') {
            msg = 'um <b>Almoço</b> criado';
          } else {
            msg = 'uma <b>Visita</b> criada';
          }
          Swal.fire({
            title: Company,
            html: `Já existe ${msg} acima dessa visita.<br/>` +
            `<b>Exclua</b> ou <b>Altere</b> ${antes[0].tipo === 'Almoço' ? 'o <b>Almoço</b>' : 'a <b>Visita</b>'} para poder criar uma <b>Visita Conjunta</b>`,
            icon: "warning",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          });
        } else {
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
        }
      } else if (result.isDenied) {
        let msg;
        const depois = visitsFind('depois', ref);
        if(depois.length > 0) {
          if(depois[0].tipo === 'Almoço') {
            msg = 'um <b>Almoço</b> criado';
          } else {
            msg = 'uma <b>Visita</b> criada';
          }
          Swal.fire({
            title: Company,
            html: `Já existe ${msg} abaixo dessa visita.<br/>` +
            `<b>Exclua</b> ou <b>Altere</b> ${depois[0].tipo === 'Almoço' ? 'o <b>Almoço</b>' : 'a <b>Visita</b>'} para poder criar uma <b>Visita Conjunta</b>`,
            icon: "warning",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          });
        } else {
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
      }
    });
  };

  const changeFoco = () => {
    setFocoCheck(!focoCheck); // Altera o estado do FocoCheck
    localStorage.setItem("foco", !focoCheck);
  }


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
              (box === "create lunch" && (
                <CreateVisit
                  returnSchedule={returnSchedule}
                  filterSchedule={filterSchedule}
                  scheduleRef={scheduleRef}
                  membersRef={members}
                  tecs={tecs}
                  userRef={userRef}
                  schedule={schedule}
                  monthNumber={monthNumber}
                  type={'lunch'}
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
          user.email === Users[0].email ? (
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
          {(userRef && userRef.cargo === "Vendedor(a)" && !box) ||
          user.email === Users[0].email ? (
            <div className="box-schedule-visit__add">
              <button
                className="lunch"
                onClick={() => {
                  changeBox("create lunch");
                  return handleBoxVisitRef();
                }}
              >
                <span className="icon-lunch"></span>Criar Almoço
              </button>
            </div>
          ) : (
            <></>
          )}
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
            {schedule && schedule.length > 0 &&
            <div className="toggle-box">
                <p>Modo foco</p>
                <input type="checkbox" id="toggle" className="toggle toggle--shadow" checked={focoCheck} onChange={() => changeFoco()} />
              <label htmlFor="toggle"></label>
            </div>
            }
            {dayVisits && dayVisits.length > 0 && (
              <><div>
                <h2>Visitas do Dia {moment(new Date(dayVisits[0].dia)).format("D")}</h2>
              </div>
              <table className={focoCheck ? "table-visit table-foco" : "table-visit"}>
                  <thead>
                    <tr>
                      <th className="icons"></th>
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
                        className="table"
                        key={index}
                      >
                        {(info.confirmar === false && info.tipo === "Visita" &&
                        (<td className="visit-icon cursor-help" aria-label="Visita" 
                        data-cooltipz-dir="right"></td>)) ||
                        (info.confirmar === false && info.tipo === "Visita Conjunta" &&
                        (<td className="group-icon cursor-help" aria-label="Visita Conjunta" 
                        data-cooltipz-dir="right"></td>)) || 
                        (info.confirmar === false && info.tipo === "Almoço" &&
                        (<td className="lunch-icon cursor-help" aria-label="Almoço" 
                        data-cooltipz-dir="right"></td>)) || 
                        (info.confirmar === true &&
                        (<td className="confirm-icon cursor-help" aria-label="Visita Confirmada" 
                        data-cooltipz-dir="right"></td>))}
                        <td className="bold">
                          {moment(new Date(info.dia)).format("D")}
                        </td>
                        <td className="no-wrap">{info.cidade}</td>
                        <td>{info.cliente}</td>
                        {info.tipo === "Almoço" ?
                          <td></td> : <td className="bold bg-important">{info.saidaEmpresa}</td>}
                        <td>{info.chegadaCliente}</td>
                        <td>{info.visita}</td>
                        <td
                          className={"bg-important-2"}
                        >
                          {info.saidaDoCliente}
                        </td>
                        {info.tipo === "Almoço" ?
                          <td></td> : <td className="bold bg-important">
                          {info.chegadaEmpresa}
                        </td>}
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
                        <td className="observation">{info.observacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></>
            )}
            {schedule && schedule.length > 0 && (
              <table className={focoCheck ? "table-visit table-foco" : "table-visit"}>
                <thead>
                  <tr>
                    <th className="icons"></th>
                    {userRef && userRef.cargo === "Técnico" ? <th></th> : <th>V.C</th>}
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
                    {userRef && userRef.cargo === "Técnico" ? <></> : <th>Ação</th>}
                  </tr>
                </thead>
                <tbody>
                  {schedule &&
                    schedule.map((info, index) => (
                      <tr
                        className={"table"}
                        key={index}
                      >
                        {(info.confirmar === false && info.tipo === "Visita" &&
                        (<td className="visit-icon cursor-help" aria-label="Visita" 
                        data-cooltipz-dir="right"></td>)) ||
                        (info.confirmar === false && info.tipo === "Visita Conjunta" &&
                        (<td className="group-icon cursor-help" aria-label="Visita Conjunta" 
                        data-cooltipz-dir="right"></td>)) || 
                        (info.confirmar === false && info.tipo === "Almoço" &&
                        (<td className="lunch-icon cursor-help" aria-label="Almoço" 
                        data-cooltipz-dir="right"></td>)) || 
                        (info.confirmar === true &&
                        (<td className="confirm-icon cursor-help" aria-label="Visita Confirmada" 
                        data-cooltipz-dir="right"></td>))}
                        {info.confirmar === true || (userRef && userRef.cargo === "Técnico")  ? <td></td> : (
                          <td aria-label="Criar Visita Conjunta" 
                          data-cooltipz-dir="right">
                            <button
                              className="btn-add"
                              onClick={() => createVisitGroupChoice(info)}
                            >
                            </button>
                          </td>
                        )}
                        <td className="bold">
                          {moment(new Date(info.dia)).format("D")}
                        </td>
                        <td className="no-wrap">{info.cidade}</td>
                        <td className="no-wrap">{info.cliente}</td>
                        {/* <td className="bold bg-important">
                          {info.saidaEmpresa}
                        </td>
                        {info.tipo === "Almoço" ?
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
                        </td> */}
                        {info.tipo === "Almoço" ?
                          <td></td> : <td className="bold bg-important">{info.saidaEmpresa}</td>}
                        <td>{info.chegadaCliente}</td>
                        <td>{info.visita}</td>
                        <td
                          className={"bg-important-2"}
                        >
                          {info.saidaDoCliente}
                        </td>
                        {info.tipo === "Almoço" ?
                          <td></td> : <td className="bold bg-important">
                          {info.chegadaEmpresa}
                        </td>}
                        <td
                          style={
                            info.cor && {
                              backgroundColor: info.cor,
                              borderBottom: `1px solid ${info.cor}`,
                              borderRight: `1px solid ${info.cor}`,
                              borderLeft: `1px solid ${info.cor}`,
                              color: "#fff",
                              textShadow: '#5a5a5a -1px 0px 5px',
                            }
                          }
                        >
                          {info.consultora}
                        </td>
                        <td>{info.tecnico}</td>
                        <td className="observation">{info.observacao}</td>
                        <td className="action" style={info.observacao ? {} : null}>
                          
                          {(info.confirmar === false &&
                            info.uid === user.id) ||
                          user.email === Users[0].email ||
                            info.consultora === "Vendedor(a)" ? (
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
                            user.email === Users[0].email &&
                            info.consultora !== "Almoço Téc." ? (
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
                            user.email === Users[0].email ? (
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
