import axios from "axios";
import { useEffect, useState, useRef, forwardRef } from "react";
import moment from "moment";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { useParams } from "react-router-dom";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import useAuth from "../../hooks/useAuth";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

//import EventNoteIcon from '@mui/icons-material/EventNote';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import RestaurantIcon from '@mui/icons-material/Restaurant'; // Almoço
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

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

import "cooltipz-css";
import "./_style.scss";

import EditVisit from "../../components/Box/Edit/Index";
import CreateVisit from "../../components/Box/Create/Index";
import CreateVisitGroup from "../../components/Box/Group/Index";
import { Company, Users } from "../../data/Data";

const Schedule = ({ userRef, members, tecs, sellers, alerts, check }) => {
  const data = new Date();
  const checked = JSON.parse(localStorage.getItem("foco"));
  const [focoCheck, setFocoCheck] = useState(false);
  const { year } = useParams();
  const { user } = useAuth();
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const boxVisitRef = useRef();
  const [schedule, setSchedule] = useState();
  const [scheduleNew, setScheduleNew] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(data.getMonth() + 1).padStart(2, "0")
  );
  const [editVisit, setEditVisit] = useState({ check: false });
  const [box, setBox] = useState({name: '', type:''});
  const [createVisitGroup, setCreateVisitGroup] = useState({ check: false });
  const [dayVisits, setDayVisits] = useState(undefined);
  const [scheduleRef, setScheduleRef] = useState();
  const [monthNumber, setMonthNumber] = useState();
  const [sellersOrder, setSellersOrder] = useState();
  const schedulesCollectionRef = collection(
    dataBase,
    "Agendas",
    year,
    monthSelect
  );

  useEffect(
    () => {
      const fetchData = async () => {
        const q = query(schedulesCollectionRef, orderBy("dia"));
        onSnapshot(await q, (schedule) => {
          // Atualiza os dados em tempo real
          setSchedule(
            schedule.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          ); // puxa a coleção 'Chats' para o state
          setScheduleRef(schedulesCollectionRef);
        });
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthSelect]
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
    setDayVisits(dayVisits);
  }, [dayVisits]);

  useEffect(() => {
    if (checked === true) {
      // Altera o valor da input 'toggle'
      setFocoCheck(true);
    }
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
    // console.log(scheduleNew);
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

  // console.log(monthSelect);

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
    setBox({name: '',type: ''});
    setDayVisits(undefined);
  };

  const permission = (visit) => { //Permissão
    console.log(visit)
    if(visit.categoria === 'lunch') {
      if(visit.consultora === userRef.nome || userRef.cargo === 'Administrador') return true;
    }
    if(visit.categoria === 'comercial' || visit.categoria === 'comercial_tecnica') {
      if(visit.consultora === userRef.nome || userRef.cargo === 'Administrador') return true;
    }
    if(visit.categoria === 'pos_venda') {
      if(visit.consultora === userRef.nome || userRef.cargo === 'Administrador') return true;
    }
  }

  const showAddress = (visit) => {
    if(visit) {
      Swal.fire({
        title: Company,
        html: `Endereço: </br>` + 
        `<b>${visit}</b>`,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        confirmButtonText: "Copiar Endereço",
      }).then((result) => {
        if(result.isConfirmed) {
          Swal.fire({
            title: Company,
            html: `<b>Endereço</b> copiado com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          });
          navigator.clipboard.writeText(visit) // Copia o texto 'visit'
        }
      })
    }
  }

  const filterSchedule = (data, tec) => {
    if (data) {
      setDayVisits(
        schedule.filter((dia) => dia.data === data && dia.tecnico === tec)
      );
    } else {
      setDayVisits(undefined);
      // console.log(dayVisits);
      // console.log(data);
    }
  };

  const visitsFind = (type, visit) => {
    if (type === "antes")
      return schedule.filter(
        (ref) =>
          ref.data === visit.data && ref.chegadaEmpresa === visit.saidaEmpresa
          && ref.tipo !== "Almoço" && !ref.visitaAlmoco
      );
    if (type === "depois")
      return schedule.filter(
        (ref) =>
          ref.data === visit.data && ref.saidaEmpresa === visit.chegadaEmpresa
          && ref.tipo !== "Almoço" && !ref.visitaAlmoco
      );
  };

  const deleteVisit = async (visit) => {
    try {
      if(check) {
        Swal.fire({
          title: 'Sem Conexão',
          icon: "error",
          html: `Não é possível Excluir ${visit.categoria === 'lunch' ? 'um Almoço' : 'uma Visita'} <b>sem internet.</b> Verifique a sua conexão.`,
          confirmButtonText: "Fechar",
          showCloseButton: true,
          confirmButtonColor: "#d33" 
        })
      } else {
        if(permission(visit)) {
          Swal.fire({
            title: Company,
            html: `Você deseja excluir essa <b>Visita</b>?`,
            icon: "warning",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const visitsAntes = visitsFind("antes", visit);
              const visitsDepois = visitsFind("depois", visit);
              if (visitsAntes.length > 0) {
                visitsAntes.map(async (ref) => {
                  // const visitBefore = schedule.filter(
                  //   (before) =>
                  //     before.data === ref.data &&
                  //     before.chegadaEmpresa === ref.saidaEmpresa &&
                  //     ref.consultora !== "Almoço Téc." &&
                  //     before.tipo === "Visita Conjunta" &&
                  //     !before.visitaAlmoco
                  // );
                  // if (ref.cidade === visit.cidade) {
                  //   if (visitBefore) {
                  //     visitBefore.map(async (ref) => {
                  //       await updateDoc(
                  //         doc(dataBase, "Agendas", year, monthSelect, ref.id),
                  //         {
                  //           chegadaEmpresa: moment(ref.saidaDoCliente, "hh:mm")
                  //             .add(ref.tempoRota, "seconds")
                  //             .format("kk:mm"),
                  //           groupRef: "",
                  //           group: "",
                  //           visitaConjunta: false,
                  //           tipo: "Visita",
                  //         }
                  //       );
                  //     });
                  //   }
                  //   // await deleteDoc(
                  //   //   doc(dataBase, "Agendas", year, monthSelect, ref.id)
                  //   // );
                  // } else {
                    await updateDoc(
                      doc(dataBase, "Agendas", year, monthSelect, ref.id),
                      {
                        chegadaEmpresa: moment(ref.saidaDoCliente, "hh:mm")
                          .add(ref.tempoRota, "seconds")
                          .format("kk:mm"),
                        groupRef: "",
                        group: "",
                        visitaConjunta: false,
                        tipo: "Visita",
                      }
                    );
                });
               }
              if (visitsDepois.length > 0) {
                visitsDepois.map(async (ref) => {
                  // const visitNext = schedule.filter(
                  //   (next) =>
                  //     next.data === ref.data &&
                  //     next.saidaEmpresa === ref.chegadaEmpresa &&
                  //     ref.consultora !== "Almoço Téc." &&
                  //     next.tipo === "Visita Conjunta" &&
                  //     !next.visitaAlmoco
                  // );
                  // if (ref.cidade === visit.cidade) {
                  //   if (visitNext) {
                  //     visitNext.map(async (ref) => {
                  //       await updateDoc(
                  //         doc(dataBase, "Agendas", year, monthSelect, ref.id),
                  //         {
                  //           saidaEmpresa: moment(ref.chegadaCliente, "hh:mm")
                  //             .subtract(ref.tempoRota, "seconds")
                  //             .format("kk:mm"),
                  //           groupRef: "",
                  //           group: "",
                  //           visitaConjunta: false,
                  //           tipo: "Visita",
                  //         }
                  //       );
                  //     });
                  //   }
                  //   // await deleteDoc(
                  //   //   doc(dataBase, "Agendas", year, monthSelect, ref.id)
                  //   // );
                  // } else {
                    // console.log("cidade diferente");
    
                    await updateDoc(
                      doc(dataBase, "Agendas", year, monthSelect, ref.id),
                      {
                        saidaEmpresa: moment(ref.chegadaCliente, "hh:mm")
                          .subtract(ref.tempoRota, "seconds")
                          .format("kk:mm"),
                        groupRef: "",
                        group: "",
                        visitaConjunta: false,
                        tipo: "Visita",
                      }
                    );
                  // }
    
                  // console.log(
                  //   ref.saidaEmpresa,
                  //   moment(ref.chegadaCliente, "hh:mm")
                  //     .subtract(ref.tempoRota, "seconds")
                  //     .format("kk:mm")
                  // );
                });
              }
              // console.log(visitsAntes, visitsDepois);
              await deleteDoc(
                doc(dataBase, "Agendas", year, monthSelect, visit.id)
              );
              setBox({name: '', type:''});
              setDayVisits(undefined);
              const date = new Date(visit.data);
              axios.post('https://hook.us1.make.com/tmfl4xr8g9tk9qoi9jdpo1d7istl8ksd', {
                data: moment(visit.data).format("DD/MM/YYYY"),
                nome: visit.tecnico,
                cliente: visit.cliente,
                marcado: visit.chegadaCliente,
                consultora: visit.consultora,
                city: visit.cidade,
                semana: getMonthlyWeekNumber(date),
                mes: moment(visit.data).format("M"),
                ende: visit.endereco,
                del: true
              })
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
        } else {
          Swal.fire({
            title: 'Acesso Negado',
            html: `Somente o responsável pode Excluir a <b>Visita.</b>`,
            icon: "error",
            showCloseButton: true,
            confirmButtonColor: "#F39200",
            confirmButtonText: "Ok",
          })
        }
      }
    } catch {}
  };



  function getMonthlyWeekNumber(dt)
  {
      // como função interna, permite reuso
      var getmonweek = function(myDate) {
          var today = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),0,0,0);
          var first_of_month = new Date(myDate.getFullYear(),myDate.getMonth(),1,0,0,0);
          var p = Math.floor((today.getTime()-first_of_month.getTime())/1000/60/60/24/7);
          // ajuste de contagem
          if (today.getDay()<first_of_month.getDay()) ++p;
          // ISO 8601.
          if (first_of_month.getDay()<=3) p++;
          return p;
      }
      // último dia do mês
      var udm = (new Date(dt.getFullYear(),dt.getMonth()+1,0,0,0,0)).getDate();
      /*  Nos seis primeiros dias de um mês: verifica se estamos antes do primeiro Domingo.
       *  Caso positivo, usa o último dia do mês anterior para o cálculo.
       */
      if ((dt.getDate()<7) && ((dt.getDate()-dt.getDay())<-2))
          return getmonweek(new Date(dt.getFullYear(),dt.getMonth(),0));
      /*  Nos seis últimos dias de um mês: verifica se estamos dentro ou depois do último Domingo.
       *  Caso positivo, retorna 1 "de pronto".
       */
      else if ((dt.getDate()>(udm-6)) && ((dt.getDate()-dt.getDay())>(udm-3)))
          return 1;
      else
          return getmonweek(dt);
  }

  const confirmVisit = async (ref, type) => {
    if(check) {
      Swal.fire({
        title: 'Sem Conexão',
        icon: "error",
        html: `Não é possível ${type === 'confirm' ? 'Confirmar' : 'Cancelar'} <b>sem internet.</b> Verifique a sua conexão.`,
        confirmButtonText: "Fechar",
        showCloseButton: true,
        confirmButtonColor: "#d33" 
      })
    } else {
      const visitRef = doc(dataBase, "Agendas", year, monthSelect, ref.id);
      const financeCol = collection(dataBase, "Financeiro", year, monthSelect);
      const financeRef = doc(financeCol, ref.id);
      //const date = new Date(ref.data);
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
            if(ref.tipo !== "Almoço") {
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
            }
            // axios.post('https://hook.us1.make.com/tmfl4xr8g9tk9qoi9jdpo1d7istl8ksd', {
            //   data: moment(ref.data).format("DD/MM/YYYY"),
            //   nome: ref.tecnico,
            //   cliente: ref.cliente,
            //   marcado: ref.chegadaCliente,
            //   consultora: ref.consultora,
            //   city: ref.cidade,
            //   semana: getMonthlyWeekNumber(date),
            //   mes: moment(ref.data).format("M"),
            //   ende: ref.endereco,
            //   confirmada: 'Sim'
            // })
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
            // axios.post('https://hook.us1.make.com/tmfl4xr8g9tk9qoi9jdpo1d7istl8ksd', {
            //   data: moment(ref.data).format("DD/MM/YYYY"),
            //   nome: ref.tecnico,
            //   cliente: ref.cliente,
            //   marcado: ref.chegadaCliente,
            //   consultora: ref.consultora,
            //   city: ref.cidade,
            //   semana: getMonthlyWeekNumber(date),
            //   mes: moment(ref.data).format("M"),
            //   ende: ref.endereco,
            //   confirmada: 'Não'
            // })
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
    }
  };

  const changeBox = (type) => {
    setBox(type);
  };

  const createVisitGroupChoice = (ref) => {
    console.log(ref)
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
        const antes = visitsFind("antes", ref.visit);
        if (antes.length > 0) {
          if (antes[0].tipo === "Almoço") {
            msg = "um <b>Almoço</b> criado";
          } else {
            msg = "uma <b>Visita</b> criada";
          }
          Swal.fire({
            title: Company,
            html:
              `Já existe ${msg} acima dessa visita.<br/>` +
              `<b>Exclua</b> ou <b>Altere</b> ${
                antes[0].tipo === "Almoço"
                  ? "o <b>Almoço</b>"
                  : "a <b>Visita</b>"
              } para poder criar uma <b>Visita Conjunta</b>`,
            icon: "warning",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          });
        } else {
          if(userRef && userRef.nome === 'Pós-Venda') {
            setTimeout(() => {
              setCreateVisitGroup({
                check: true,
                type: "antes",
                info: ref.visit,
                typeRef: 'pos_venda',
                ref: doc(dataBase, "Agendas", year, monthSelect, ref.visit.id),
              });
              setBox({name: "group"});
              return handleBoxVisitRef();
            }, 400);
          } else {
            setTimeout(() => {
              setCreateVisitGroup({
                check: true,
                type: "antes",
                info: ref.visit,
                typeRef: ref.type,
                ref: doc(dataBase, "Agendas", year, monthSelect, ref.visit.id),
              });
              setBox({name: "group"});
              return handleBoxVisitRef();
            }, 400);
          }
        }
      } else if (result.isDenied) {
        let msg;
        const depois = visitsFind("depois", ref.visit);
        if (depois.length > 0) {
          if (depois[0].tipo === "Almoço") {
            msg = "um <b>Almoço</b> criado";
          } else {
            msg = "uma <b>Visita</b> criada";
          }
          Swal.fire({
            title: Company,
            html:
              `Já existe ${msg} abaixo dessa visita.<br/>` +
              `<b>Exclua</b> ou <b>Altere</b> ${
                depois[0].tipo === "Almoço"
                  ? "o <b>Almoço</b>" 
                  : "a <b>Visita</b>"
              } para poder criar uma <b>Visita Conjunta</b>`,
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
              info: ref.visit,
              typeRef: ref.type,
              ref: doc(dataBase, "Agendas", year, monthSelect, ref.visit.id),
            });
            setBox({name: "group"});
            return handleBoxVisitRef();
          }, 400);
        }
      }
    });
  };

  const changeFoco = () => {
    setFocoCheck(!focoCheck); // Altera o estado do FocoCheck
    localStorage.setItem("foco", !focoCheck);
  };

  const viewVisita = (visit, type) => {
    console.log(visit);
    let visitType, visitInfo;
    let observacao = ''; 
    if (visit.observacao) {
      observacao = `</br>Observação: <b>${visit.observacao}</b></br>`;
    }
    if(type === 'comercial') {visitType = {tittle: 'Visita Comercial', driver: `Motorista: <b>${visit.tecnico}</b></br>`};}
    if(type === 'comercial_tecnica') {visitType = {tittle: 'Visita Comercial + Técnica', driver: `Técnico: <b>${visit.tecnico}</b></br>`};}
    if(type === 'pos_venda') {visitType = {tittle: 'Visita Pós-Venda', driver: `Técnico: <b>${visit.tecnico}</b></br>`};}
    if(type === 'lunch') {
    visitType = {tittle: 'Almoço'};
    visitInfo =
      `Data <b>${moment(visit.data).format("DD/MM/YYYY")}</b> </br></br>` +
      `Horário de Inicio: <b>${visit.saidaEmpresa}</b></br>` +
      `Duração: <b>${visit.visita}</b></br>` +
      `Horário de Saida: <b>${visit.chegadaEmpresa}</b></br></br>`+
      `Responsável: <b style={{ color: ${visit.cor} }}>${visit.consultora}</b></br>` +
      observacao
    ;
  } else {
    visitInfo =
      `Data <b>${moment(visit.data).format("DD/MM/YYYY")}</b> </br></br>` +
      `Cliente: <b>${visit.cliente}</b></br>` +
      `Cidade: <b>${visit.cidade}</b></br></br>` + 
      `Horário de Saida: <b>${visit.saidaEmpresa}</b></br>` +
      `Chegada no Cliente: <b>${visit.chegadaCliente}</b></br>` +
      `Tempo de Visita: <b>${visit.visita}</b></br>` +
      `Saida no Cliente: <b>${visit.saidaDoCliente}</b></br>` +
      `Chegada na Empresa: <b>${visit.chegadaEmpresa}</b></br></br>`+
      `Consultora: <b style={{ color: ${visit.cor} }}>${visit.consultora}</b></br>` +
      visitType.driver +
      `Veiculo: <b>${visit.veiculo}</b></br></br>` +
      `Endereço: <b>${visit.endereco}</b></br>` +
      observacao
    ;
  }
    if(type === 'lunch') {
      console.log(userRef)
      Swal.fire({
        title: visitType.tittle,
        html: visitInfo,
        showConfirmButton: true,
        showDenyButton: true,
        showCloseButton: true,
        confirmButtonColor: `${((userRef && visit.consultora === userRef.nome) && !visit.confirmar) ? '#111' : '#ababab'}`,
        denyButtonColor: `${((userRef && visit.consultora === userRef.nome) && !visit.confirmar) ? '#c90707' : '#ababab'}`,
        confirmButtonText: 'Editar',
        denyButtonText: 'Excluir',
      }).then((result) => {
        if(result.isConfirmed) {
          if(check) {
            Swal.fire({
              title: 'Sem Conexão',
              icon: "error",
              html: `Não é possível Editar um Almoço <b>sem internet.</b> Verifique a sua conexão.`,
              confirmButtonText: "Fechar",
              showCloseButton: true,
              confirmButtonColor: "#d33"  
            })
          } else {
            if(visit.confirmar) {
              Swal.fire({
                title: 'Aviso',
                icon: 'warning',
                html: 'Não é possivel editar uma <b>Visita Confirmada.</b> Para poder editar, cancele a <b>Visita.</b>',
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#0eb05f",
                confirmButtonText: 'Ok',
              }).then((result) => {
                if(result.isConfirmed) return viewVisita(visit, type);
              })
            } else if(permission(visit)) {
              setTimeout(() => {
                setEditVisit({
                  info: visit,
                  ref: doc(
                    dataBase,
                    "Agendas",
                    year,
                    monthSelect,
                    visit.id
                  ),
                  type: type
                });
                setBox({name: "edit"});
                return handleBoxVisitRef();
              }, [200]);
            } else {
              Swal.fire({
                title: 'Acesso Negado',
                html: `Somente o responsável pode Editar a <b>Visita.</b>`,
                icon: "error",
                showCloseButton: true,
                confirmButtonColor: "#F39200",
                confirmButtonText: "Ok",
              })
            }
          }
        } else if(result.isDenied) {
          deleteVisit(visit);
        }
      })
    } else {
      Swal.fire({
        title: visitType.tittle,
        html: visitInfo,
        showConfirmButton: true,
        showCancelButton: true,
        showDenyButton: true,
        showCloseButton: true,
        confirmButtonColor: "#0eb05f",
        denyButtonColor: `${((userRef && visit.consultora === userRef.nome) && !visit.confirmar) ? '#111' : '#ababab'}`,
        cancelButtonColor: `${((userRef && visit.consultora === userRef.nome) && !visit.confirmar) ? '#c90707' : '#ababab'}`,
        confirmButtonText: 'GPS',
        denyButtonText: 'Editar',
        cancelButtonText: 'Excluir',
      }).then((result) => {
        if(result.isConfirmed) {
            window.open(`https://maps.google.com/?q=${visit.lat},${visit.lng}`, "_blank");
            //return handleBoxVisitRef();
        } else if(result.isDenied) {
          if(check) {
            Swal.fire({
              title: 'Sem Conexão',
              icon: "error",
              html: `Não é possível Editar uma Visita <b>sem internet.</b> Verifique a sua conexão.`,
              confirmButtonText: "Fechar",
              showCloseButton: true,
              confirmButtonColor: "#d33"  
            })
          } else {
            if(visit.confirmar) {
              Swal.fire({
                title: 'Aviso',
                icon: 'warning',
                html: 'Não é possivel editar uma <b>Visita Confirmada.</b> Para poder editar, cancele a <b>Visita.</b>',
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#0eb05f",
                confirmButtonText: 'Ok',
              }).then((result) => {
                if(result.isConfirmed) return viewVisita(visit, type);
              })
            } else if(permission(visit)) {
              setTimeout(() => {
                setEditVisit({
                  info: visit,
                  ref: doc(
                    dataBase,
                    "Agendas",
                    year,
                    monthSelect,
                    visit.id
                  ),
                  type: type
                });
                setBox({name: "edit"});
                return handleBoxVisitRef();
              }, [200]);
            } else {
              Swal.fire({
                title: 'Acesso Negado',
                html: `Somente o responsável pode Editar a <b>Visita.</b>`,
                icon: "error",
                showCloseButton: true,
                confirmButtonColor: "#F39200",
                confirmButtonText: "Ok",
              })
            }
          }
        } else if(result.dismiss === 'cancel') {
          deleteVisit(visit);
        }
      })
    }
  }

  return (
    <div className="container-schedule">
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className="title-schedule">
        <h2>Visita - Agenda {year} </h2>
      </div>
      <div className="content-schedule-visit">
        <div className="box-schedule-visit" ref={boxVisitRef}>
            {
              (box.name === "create" && (
                <CreateVisit
                  returnSchedule={returnSchedule}
                  filterSchedule={filterSchedule}
                  scheduleRef={scheduleRef}
                  membersRef={members}
                  tecs={tecs}
                  sellers={sellersOrder}
                  userRef={userRef}
                  schedule={schedule}
                  monthNumber={monthNumber}
                  type={box.type}
                  createVisitGroupChoice={createVisitGroupChoice}
                  checkNet={check}
                />
              )) || // Chama o componente 'Create'
                (box.name === "create lunch" && (
                  <CreateVisit
                    returnSchedule={returnSchedule}
                    filterSchedule={filterSchedule}
                    scheduleRef={scheduleRef}
                    membersRef={members}
                    tecs={tecs}
                    sellers={sellersOrder}
                    userRef={userRef}
                    schedule={schedule}
                    monthNumber={monthNumber}
                    type={"lunch"} // Para identificar se é para criar almoço ou mão
                    checkNet={check}
                  />
                )) || // Chama o componente 'Edit'
                (box.name === "edit" && (
                  <EditVisit
                    returnSchedule={returnSchedule}
                    filterSchedule={filterSchedule}
                    tecs={tecs}
                    sellers={sellersOrder}
                    userRef={userRef}
                    scheduleRef={scheduleRef}
                    scheduleRefUID={editVisit.ref}
                    visitRef={editVisit.info}
                    membersRef={members}
                    schedule={schedule}
                    monthNumber={monthNumber}
                    monthSelect={monthSelect}
                    year={year}
                    type={editVisit.type}
                    checkNet={check}
                  />
                )) ||
                (box.name === "group" && (
                  <CreateVisitGroup
                    returnSchedule={returnSchedule}
                    filterSchedule={filterSchedule}
                    tecs={tecs}
                    sellers={sellers}
                    userRef={userRef}
                    scheduleRef={scheduleRef}
                    scheduleVisitRef={createVisitGroup.ref}
                    visitRef={createVisitGroup.info}
                    membersRef={members}
                    schedule={schedule}
                    monthNumber={monthNumber}
                    year={year}
                    type={createVisitGroup.type}
                    typeRef={createVisitGroup.typeRef}
                    checkNet={check}
                  />
                )) // Chama o componente 'Group'
            }
          {(userRef && userRef.cargo === "Vendedor(a)" && !box.name) ||
          (userRef && userRef.cargo === "Administrador" && !box.name) ||
          (user.email === Users[0].email && !box.name) ? (
            <><h1>Criar</h1>
            <div className="box-schedule-visit__content">
            {userRef && (userRef.cargo === 'Vendedor(a)' || userRef.cargo === 'Administrador') && userRef.nome !== 'Pós-Venda' &&
                <><div className="box-schedule-visit__add">
                      <button
                        onClick={() => {
                          changeBox({ name: "create", type: "comercial" });
                          return handleBoxVisitRef();
                        } }
                      >
                        <span className="visit-icon comercial"><RequestQuoteIcon /></span>
                        <div className="visit-text"><p>Visita Comercial</p></div>
                      </button>
                    </div><div className="box-schedule-visit__add">
                        <button
                          onClick={() => {
                            changeBox({ name: "create", type: "comercial_tecnica" });
                            return handleBoxVisitRef();
                          } }
                        >
                          <span className="visit-icon comercial_tec"><PeopleIcon /></span>
                          <div className="visit-text"><p>Comercial + Tecnica</p></div>
                        </button>
                      </div></>
            }
                {userRef && (userRef.nome === 'Pós-Venda' || userRef.cargo === 'Administrador') && 
                  <div className="box-schedule-visit__add">
                  <button
                    onClick={() => {
                      changeBox({name: "create", type: "pos_venda"});
                      return handleBoxVisitRef();
                    } }
                  >
                    <span className="visit-icon pos_venda"><EngineeringIcon /></span>
                    <div className="visit-text"><p>Pós-Venda</p></div>
                  </button>
                </div>
                }
                {userRef && (userRef.nome !== 'Pós-Venda' || userRef.cargo === 'Administrador') && 
                <div className="box-schedule-visit__add">
                  <button
                    onClick={() => {
                      changeBox({name: "create lunch"});
                      return handleBoxVisitRef();
                    } }
                  >
                    <span className="visit-icon lunch"><RestaurantIcon /></span>
                    <div className="visit-text"><p>Almoço</p></div>
                  </button>
                </div>}
              </div></>
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

          {schedule && schedule.length > 0 && (
              <div className="toggle-box desktop">
                <p>Modo foco</p>
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle toggle--shadow"
                  checked={focoCheck}
                  onChange={() => changeFoco()}
                />
                <label htmlFor="toggle"></label>
              </div>
            )}
          <div className="container-table desktop">
            {schedule && schedule.length > 0 && (
              <table
                className={focoCheck ? "table-visit table-foco" : "table-visit"}
              >
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    {/* <th className="icons"></th> */}
                    {/* {userRef && userRef.cargo === "Técnico" ? (
                      <th></th>
                    ) : (
                      <th>V.C</th>
                    )} */}
                    <th>Dia</th>
                    <th>Cidade</th>
                    <th>Cliente</th>
                    <th>Hórario de Saida</th>
                    <th>Chegada no Cliente</th>
                    <th>Tempo de Visita</th>
                    <th>Saída no Cliente</th>
                    <th>Chegada na Empresa</th>
                    <th>Responsável</th>
                    <th>Motorista</th>
                    <th>Observação</th>
                    <th>Ação</th>  
                  </tr>
                </thead>
                <tbody>
                  {schedule &&
                    schedule.map((info, index) => (
                      <tr className={"table"} key={index}>
                        {/* {(info.confirmar === false &&
                          info.tipo === "Visita" && (
                            <td
                              className="visits-icon cursor-help"
                              aria-label="Visita"
                              data-cooltipz-dir="right"
                            ></td>
                            )) ||
                          (info.confirmar === false &&
                            info.tipo === "Visita Conjunta" && (
                              <td
                                className="group-icon cursor-help"
                                aria-label="Visita Conjunta"
                                data-cooltipz-dir="right"
                              ></td>
                            )) ||
                          (info.confirmar === false &&
                            info.tipo === "Almoço" && (
                              <td
                                className="lunch-icon cursor-help"
                                aria-label="Almoço"
                                data-cooltipz-dir="right"
                              ></td>
                            )) ||
                          (info.confirmar === true && (
                            <td
                              className="confirm-icon cursor-help"
                              aria-label="Visita Confirmada"
                              data-cooltipz-dir="right"
                            ></td>
                          ))} */}
                        {/* {info.confirmar === true ||
                        (userRef && userRef.cargo === "Técnico") ? (
                          <td></td>
                        ) : (
                          <td
                            aria-label="Criar Visita Conjunta"
                            data-cooltipz-dir="right"
                          >
                            <button
                              className="btn-add"
                              onClick={() => createVisitGroupChoice(info)}
                            ></button>
                          </td>
                        )} */}
                        {!info.confirmar && info.categoria === 'lunch' && 
                        <td></td>}
                        {!info.confirmar && info.tipo === 'Visita Conjunta' &&
                        <td
                        className="group-icon cursor-help"
                        aria-label="Visita Conjunta"
                        data-cooltipz-dir="right"
                      ></td>
                        }
                        {!info.confirmar && info.tipo === 'Visita' &&
                        <td
                        className="visits-icon cursor-help"
                        aria-label="Visita Única"
                        data-cooltipz-dir="right"
                      ></td>
                        }
                        {info.confirmar &&
                        <td
                              className="confirm-icon cursor-help"
                              aria-label="Visita Confirmada"
                              data-cooltipz-dir="right"
                            ></td>
                        }
                        {info.categoria === "lunch" && <td style={{ filter: 'contrast' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></td>}
                        {info.categoria === "comercial" && <td className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></td>}
                        {info.categoria === "comercial_tecnica" && <td className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></td>}
                        {info.categoria === "pos_venda" && <td className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></td>}
                        {/* Para quem é vendedor */}
                        {!info.confirmar && (info.categoria === "comercial" || info.categoria === "comercial_tecnica") &&
                         userRef && userRef.cargo === "Vendedor(a)" && 
                        <td>
                          <div className="btn-add"
                          aria-label="Criar Visita Conjunta"
                          data-cooltipz-dir="right"
                          onClick={() => createVisitGroupChoice({visit: info, type: info.categoria})}
                          ></div>
                        </td>
                        }
                        {/* Para quem não é vendedor */}
                        {!info.confirmar && (info.categoria === "comercial" || info.categoria === "comercial_tecnica") &&
                         userRef && ( userRef.cargo !== "Vendedor(a)") &&
                        <td>
                        <div className="btn-add disabled"
                        ></div>
                      </td>
                        }
                        {/* Para quem é Pós-Venda */}
                        {!info.confirmar && (info.categoria === "pos_venda") && userRef  && userRef.nome === "Pós-Venda" &&
                        <td>
                          <div className="btn-add"
                          aria-label="Criar Visita Conjunta"
                          data-cooltipz-dir="right"
                          onClick={() => createVisitGroupChoice({visit: info, type: info.categoria})}
                          ></div>
                        </td>}
                        {/* Para quem não é Pós-Venda */}
                        {!info.confirmar && (info.categoria === "pos_venda") && userRef  && userRef.nome !== "Pós-Venda" &&
                        <td>
                        <div className="btn-add disabled"
                        ></div>
                      </td>}
                        {/* Almoço */}
                        {!info.confirmar && (info.categoria === "lunch") &&
                        <td>
                        <div className="btn-add disabled"
                        ></div>
                      </td>}
                        {/* Confirmado */}
                        {info.confirmar &&
                        <td>
                        <div className="btn-add disabled"
                        ></div>
                      </td>}
                        <td className="bold">
                          {/* {moment.utc(info.dia).local().format('D')} */}
                          {info.dia.substring(info.dia.length - 2)}
                        </td>
                        <td onClick={() => showAddress(info.endereco)}
                        className="no-wrap" 
                            aria-label={info.endereco}
                            data-cooltipz-dir="top">{info.cidade}</td>
                        <td className="no-wrap">{info.cliente}</td>
                        {info.tipo === "Almoço" ? (
                          <td></td>
                        ) : (
                          <td className="bold bg-important">
                            {info.saidaEmpresa}
                          </td>
                        )}
                        <td>{info.chegadaCliente}</td>
                        <td>{info.visita}</td>
                        <td className={"bg-important-2"}>
                          {info.saidaDoCliente}
                        </td>
                        {info.tipo === "Almoço" ? (
                          <td></td>
                        ) : (
                          <td className="bold bg-important">
                            {info.chegadaEmpresa}
                          </td>
                        )}
                        <td
                          style={
                            info.cor && {
                              backgroundColor: info.cor,
                              borderBottom: `1px solid ${info.cor}`,
                              borderRight: `1px solid ${info.cor}`,
                              borderLeft: `1px solid ${info.cor}`,
                              color: "#fff",
                              textShadow: "#5a5a5a -1px 0px 5px",
                            }
                          }
                        >
                          {info.consultora}
                        </td>
                        <td>{info.tecnico}</td>
                        <td className="observation">{info.observacao}</td>
                        <td
                          className="action"
                          style={info.observacao ? {} : null}
                        >
                          {(info.confirmar === false && info.uid === user.id) ||
                          user.email === Users[0].email ||
                          (userRef && userRef.cargo === "Administrador") ||
                          info.consultora === "Vendedor(a)" ? (
                            <>
                              <div
                                style={info.confirmar ? {pointerEvents: 'none', opacity: '0.5'} : {pointerEvents: 'initial'}}
                                aria-label="Editar Visita"
                                data-cooltipz-dir="left"
                              >
                                <button
                                  className='btn-edit'
                                  id="edit-visit"
                                  onClick={() => {
                                    setBox({name: "edit"});
                                    setEditVisit({
                                      info: info,
                                      ref: doc(
                                        dataBase,
                                        "Agendas",
                                        year,
                                        monthSelect,
                                        info.id
                                      ),
                                      type: info.categoria
                                    });
                                    return handleBoxVisitRef();
                                  }}
                                ></button>
                              </div>
                              <div
                                aria-label="Excluir Visita"
                                data-cooltipz-dir="left"
                              >
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
                          (user.email === Users[0].email || (userRef && userRef.cargo === "Administrador") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                            <>
                              <div
                                aria-label="Confirmar Visita"
                                data-cooltipz-dir="left"
                              >
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
                          (user.email === Users[0].email || (userRef && userRef.cargo === "Administrador") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                            <>
                              <div
                                aria-label="Cancelar Visita"
                                data-cooltipz-dir="left"
                              >
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
          {/* MOBILE */}
          <div className="box-mobile">
            <h1 className="mobile-title">Visitas do Mês</h1>
          {schedule && schedule.length > 0  ?
            <List
              sx={{
                width: '100%',
                maxWidth: 750,            
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'auto',
                maxHeight: 400,
                '& ul': { padding: 0 },
              }}>
                {schedule.map((visita, index) => (
                  <ListItem className={`list-visit ${visita.tipo === 'Visita Conjunta' && !visita.confirmar ? 'conjunta' : ''} ${visita.confirmar ? 'confirmar' : ''}`} sx={{ borderLeft: `10px solid ${visita.cor}` }} key={index}>
                    <p><b>{visita.dia.substring(8,10)}</b></p>
                    {visita.categoria === "lunch" && <div onClick={() => viewVisita(visita, visita.categoria)} style={{ filter: 'contrast', padding: '0.2rem' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></div>}
                    {visita.categoria === "comercial" && <div onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></div>}
                    {visita.categoria === "comercial_tecnica" && <div onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></div>}
                    {visita.categoria === "pos_venda" && <div onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></div>}
                    {!visita.confirmar && (visita.categoria === 'comercial' || visita.categoria === 'comercial_tecnica') && 
                    userRef && userRef.cargo === 'Vendedor(a)' && userRef.nome !== 'Pós-Venda' &&
                    <div className="btn-add"
                    aria-label="Criar Visita Conjunta"
                    data-cooltipz-dir="right"
                     onClick={() => createVisitGroupChoice({visit: visita, type: visita.categoria})}
                    ></div>
                    }
                    {!visita.confirmar && visita.categoria === 'pos_venda' && 
                    userRef && userRef.nome === 'Pós-Venda' &&
                    <div className="btn-add"
                    aria-label="Criar Visita Conjunta"
                    data-cooltipz-dir="right"
                     onClick={() => createVisitGroupChoice({visit: visita, type: visita.categoria})}
                    ></div>
                    }
                    {visita.confirmar === false &&
                    (user.email === Users[0].email || (userRef && userRef.cargo === "Administrador") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                      <div className="btn-confirm"
                      aria-label="Confirmar Visita"
                      data-cooltipz-dir="right"
                      onClick={() => confirmVisit(visita, "confirm")}
                      ></div>
                    ) : 
                    (
                    <></>
                    )}
                    {visita.confirmar === true &&
                    (user.email === Users[0].email || (userRef && userRef.cargo === "Administrador") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                     <div className="btn-cancel"
                    aria-label="Cancelar Visita"
                    data-cooltipz-dir="right"
                    onClick={() => confirmVisit(visita, "cancel")}
                    ></div>
                            ) : (
                              <></>
                            )}
                    <p className="saida">{visita.saidaEmpresa}</p>
                    <p className="chegada">{visita.chegadaEmpresa}</p>
                    {visita.categoria !== 'lunch' &&
                      <p className="tecnico" style={{ backgroundColor: visita.corTec }}>{visita.tecnico}</p>
                    }
                    <p className="cidade">{visita.cidade ? visita.cidade : 'ALMOÇO'}</p>
                  </ListItem>
                ))}
               </List>:
               <div style={{ display: 'none!important', margin: 'auto' }} className="visit-aviso">
                <h1>Nenhuma Visita Encontrada</h1>
               </div>
          }
          </div>
        </div>
      </div>
      <Snackbar open={check} autoHideDuration={6000}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Você está sem conexão. Verifique a sua conexão com a internet.
          </Alert>
      </Snackbar>
    </div>
  );
};

export default Schedule;
