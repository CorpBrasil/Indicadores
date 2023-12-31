import axios from "axios";
import { useEffect, useState, useRef, forwardRef } from "react";
import moment from "moment";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import useAuth from "../../hooks/useAuth";
import Dashboard from "../../components/Dashboard/Visit_and_Prospection/Index";
import Filter from "../../components/Filter/Index";
// import Requirement from "../../components/Box/Requirement/Index";

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import RestaurantIcon from '@mui/icons-material/Restaurant'; // Almoço
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda
import { ReactComponent as ScheduleIcon } from "../../images/icons/Schedule1.svg";
import { ReactComponent as CheckIcon } from "../../images/icons/Check.svg";
import { ReactComponent as BlockIcon } from "../../images/icons/Block.svg";
import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {
  doc,
  collection,
  deleteDoc,
  updateDoc,
  setDoc 
} from "firebase/firestore";

import "cooltipz-css";
import "./_style.scss";
import "../../components/Dashboard/Visit_and_Prospection/_styles.scss";

import EditVisit from "../../components/Box/Edit/Index";
import CreateVisit from "../../components/Box/Create/Index";
import CreateVisitGroup from "../../components/Box/Group/Index";
import { Company, Users } from "../../data/Data";

const Schedule = ({ userRef, members, visits, tecs, sellers, alerts, check }) => {
  const date = new Date();
  const checked = JSON.parse(localStorage.getItem("foco"));
  const [focoCheck, setFocoCheck] = useState(false);
  const [year, setYear] = useState('2023');
  const { user } = useAuth();
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  const boxVisitRef = useRef();
  const [schedule, setSchedule] = useState();
  // const [scheduleNew, setScheduleNew] = useState();
  const [monthSelect, setMonthSelect] = useState(
    String(date.getMonth() + 1).padStart(2, "0")
  );
  const [editVisit, setEditVisit] = useState({ check: false });
  const [box, setBox] = useState({name: '', type:''});
  const [createVisitGroup, setCreateVisitGroup] = useState({ check: false });
  const [dayVisits, setDayVisits] = useState(undefined);
  const [scheduleRef] = useState();
  // const [monthNumber, setMonthNumber] = useState();
  const [sellersOrder, setSellersOrder] = useState();
  // const [view, setView] = useState(false);
  // const [type, setType] = useState({});
  // const [data, setData] = useState({});

  console.log(schedule);

  // const schedulesCollectionRef = collection(
  //   dataBase,
  //   "Visitas_2023",
  //   'Apresentação',
  //   'Bruna'
  // );

  // useEffect(
  //   () => {
  //     const fetchData = async () => {
  //       const q = query(schedulesCollectionRef, orderBy("dataRef"));
  //       onSnapshot(await q, (schedule) => {
  //         // Atualiza os dados em tempo real
  //         setSchedule(
  //           schedule.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  //         ); // puxa a coleção 'Chats' para o state
  //         setDayVisits(
  //           schedule.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  //         );// puxa a coleção 'Chats' para o state
  //         setScheduleRef(schedulesCollectionRef);
  //       });
  //     };
  //     fetchData();
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [monthSelect]
  // );

  useEffect(() => {
    if(sellers) {
      setSellersOrder(sellers.sort((a,b) => {
        if(a.nome < b.nome) return -1;
        if(a.nome > b.nome) return 1;
        return 0;
      }))
    }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sellers]
  );

  useEffect(() => {
    if(visits) {
      setDayVisits(visits);
      setSchedule(visits);
    }
  }, [visits]);

  useEffect(() => {
    if(monthSelect) {
      setSchedule(visits.filter(data => data.data.substring(0,7) === year+'-'+monthSelect));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthSelect, year]);

  useEffect(() => {
    if (checked === true) {
      // Altera o valor da input 'toggle'
      setFocoCheck(true);
    }
  }, [checked]);

  console.log(schedule)

  // useEffect(() => {
  //   if (schedule) {
  //     schedule.map(async (visita) => {
  //       await updateDoc(doc(dataBase, "Agendas", year, monthSelect, visita.id), {
  //         dataRef: new Date(`${visita.data}T${visita.chegadaCliente}`)
          
  //       })
  //     })
  //     // setSchedule(
  //     //   dayVisits && dayVisits.sort((a, b) => {
  //     //     // Força a renderizaram da tabela ordenada
  //     //       if (moment(a.saidaEmpresa) < moment(b.saidaEmpresa)) return -1;
  //     //       if (moment(a.saidaEmpresa) > moment(b.saidaEmpresa)) return 1;      
  //     //     return 0;
  //     //   }));
        
  //     }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [monthSelect, schedule, dayVisits]);



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

  const handleBoxVisitRef = () => {
    boxVisitRef.current.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "start",
    });
  };


  const returnSchedule = () => {
    setBox({name: '',type: ''});
    //setDayVisits(undefined);
  };


  const permission = (visit) => { //Permissão
    // console.log(visit)
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

  const visitsFind = (type, visit) => {
    if (type === "antes")
      return schedule.filter(
        (ref) =>
          ref.data === visit.data && ref.chegadaEmpresa === visit.saidaEmpresa &&
          ref.tecnico === visit.tecnico && ref.tipo !== "Almoço" && !ref.visitaAlmoco
      );
    if (type === "depois")
      return schedule.filter(
        (ref) =>
          ref.data === visit.data && ref.saidaEmpresa === visit.chegadaEmpresa &&
          ref.tecnico === visit.tecnico && ref.tipo !== "Almoço" && !ref.visitaAlmoco
      );
  };

  // const deleteVisit = async (visit) => {
  //   try {
  //     if(check) {
  //       Swal.fire({
  //         title: 'Sem Conexão',
  //         icon: "error",
  //         html: `Não é possível Excluir ${visit.categoria === 'lunch' ? 'um Almoço' : 'uma Visita'} <b>sem internet.</b> Verifique a sua conexão.`,
  //         confirmButtonText: "Fechar",
  //         showCloseButton: true,
  //         confirmButtonColor: "#d33" 
  //       })
  //     } else {
  //       if(permission(visit)) {
  //         Swal.fire({
  //           title: Company,
  //           html: `Você deseja excluir essa <b>Visita</b>?`,
  //           icon: "warning",
  //           showCancelButton: true,
  //           showCloseButton: true,
  //           confirmButtonColor: "#F39200",
  //           cancelButtonColor: "#d33",
  //           confirmButtonText: "Sim",
  //           cancelButtonText: "Não",
  //         }).then(async (result) => {
  //           if (result.isConfirmed) {
  //             const visitsAntes = visitsFind("antes", visit);
  //             const visitsDepois = visitsFind("depois", visit);
  //             if (visitsAntes.length > 0) {
  //               visitsAntes.map(async (ref) => {
  //                   await updateDoc(
  //                     doc(dataBase, "Agendas", year, monthSelect, ref.id),
  //                     {
  //                       chegadaEmpresa: moment(ref.saidaDoCliente, "hh:mm")
  //                         .add(ref.tempoRota, "seconds")
  //                         .format("kk:mm"),
  //                       groupRef: "",
  //                       group: "",
  //                       visitaConjunta: false,
  //                       tipo: "Visita",
  //                     }
  //                   );
  //               });
  //              }
  //             if (visitsDepois.length > 0) {
  //               visitsDepois.map(async (ref) => {
  //                   await updateDoc(
  //                     doc(dataBase, "Agendas", year, monthSelect, ref.id),
  //                     {
  //                       saidaEmpresa: moment(ref.chegadaCliente, "hh:mm")
  //                         .subtract(ref.tempoRota, "seconds")
  //                         .format("kk:mm"),
  //                       groupRef: "",
  //                       group: "",
  //                       visitaConjunta: false,
  //                       tipo: "Visita",
  //                     }
  //                   );
  //               });
  //             }
  //             await deleteDoc(
  //               doc(dataBase, "Agendas", year, monthSelect, visit.id)
  //             );
  //             setBox({name: '', type:''});
  //             //setDayVisits(undefined);
  //             const date = new Date(visit.data);
  //             axios.post('https://n8n.corpbrasil.cloud/webhook/321c02a7-03b7-4f81-b4a0-2958660ff449', {
  //               ID: visit.id,
  //               data: moment(visit.data).format("DD/MM/YYYY"),
  //               dataDelete: moment(new Date()).format("DD/MM/YYYY HH:mm"),
  //               nome: visit.tecnico,
  //               cliente: visit.cliente,
  //               marcado: visit.chegadaCliente,
  //               consultora: visit.consultora,
  //               city: visit.cidade,
  //               semana: getMonthlyWeekNumber(date),
  //               mes: moment(visit.data).format("M"),
  //               ende: visit.endereco,
  //               categoria: visit.categoria,
  //               tipo: visit.tipo,
  //               confirmar: visit.confirmar,
  //               extra: visit.preData
  //             })
  //             Swal.fire({
  //               title: Company,
  //               html: `A Visita em <b>${visit.cidade}</b> foi deletada com sucesso.`,
  //               icon: "success",
  //               showConfirmButton: true,
  //               showCloseButton: true,
  //               confirmButtonColor: "#F39200",
  //             });
  //           }
  //         });
  //       } else {
  //         Swal.fire({
  //           title: 'Acesso Negado',
  //           html: `Somente o responsável pode Excluir a <b>Visita.</b>`,
  //           icon: "error",
  //           showCloseButton: true,
  //           confirmButtonColor: "#F39200",
  //           confirmButtonText: "Ok",
  //         })
  //       }
  //     }
  //   } catch {}
  // };



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
      const visitRef = doc(dataBase, "Visitas", ref.id);
      const estimateRef = doc(dataBase, "Leads", ref.leadRef);
      const financeCol = collection(dataBase, "Financeiro");
      const financeRef = doc(financeCol, ref.id);
      const date = new Date(ref.data);
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
              confirmar: true
            }).then(async() => {
              await updateDoc(estimateRef, {
                status: 'Apresentação',
                step: 4
              })
            });
            if(ref.tipo !== "Almoço") {
              await setDoc(financeRef, {
                data: ref.data,
                dia: ref.dia,
                cidade: ref.cidade,
                cliente: ref.cliente,
                horario: ref.chegadaCliente,
                saida: ref.saidaEmpresa,
                chegada: ref.chegadaEmpresa,
                indicador: ref.consultora,
                dataRef: new Date(`${ref.data}T${ref.chegadaCliente}`) ,
                indicadorFull: `${ref.consultora} (${ref.id_user})`,
                indicadorUID: ref.uid,
                tecnico: ref.tecnico,
                tecnicoUID: ref.tecnicoUID,
                veiculo: ref.veiculo,
                categoria: ref.categoria,
                createConfirm: new Date()
              });
            }
            axios.post('https://n8n.corpbrasil.cloud/webhook/63b48297-3e22-4eba-8b21-45e87f52f3fb', {
              ID: ref.id,
              data: moment(ref.data).format("DD/MM/YYYY"),
              nome: ref.tecnico,
              cliente: ref.cliente,
              marcado: ref.chegadaCliente,
              consultora: ref.consultora,
              city: ref.cidade,
              semana: getMonthlyWeekNumber(date),
              mes: moment(ref.data).format("M"),
              ende: ref.endereco,
              categoria: ref.categoria,
              confirmada: 'Sim',
            })
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
            axios.post('https://n8n.corpbrasil.cloud/webhook/dfbbb99b-1721-4a7d-8ac0-f95335b15aa7', {
              ID: ref.id,
              data: moment(ref.data).format("DD/MM/YYYY"),
              nome: ref.tecnico,
              cliente: ref.cliente,
              marcado: ref.chegadaCliente,
              consultora: ref.consultora,
              city: ref.cidade,
              semana: getMonthlyWeekNumber(date),
              mes: moment(ref.data).format("M"),
              ende: ref.endereco,
              confirmada: 'Não',
              categoria: ref.categoria
            })
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
            }).then(async() => {
              await updateDoc(estimateRef, {
                status: 'Aguardando Apresentação',
                step: 3
              })
            });;
            await deleteDoc(financeRef);
          }
        });
      }
    }
  };

  // const closeBox = () => {
  //   setView(false);
  // }

  const openBox = (type) => {
    // setType(type);
    changeBox(type)
  }

  const changeBox = (type) => {
    if(type.ref === "conjunta") {
      return createVisitGroupChoice(type)
    } else {
      setBox(type);
    }
    // setView(false);
    // setType(type);
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
                preData: ref.data
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
                preData: ref.data
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
              // preData: data
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

  const changeFilter = (data) => {
    setSchedule(data);
  }


  const viewVisita = (visit, type) => {
    // console.log(visit);
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
      // console.log(userRef)
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
          // deleteVisit(visit);
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
            window.open(`https://waze.com/ul?ll=${visit.lat},${visit.lng}`, "_blank");
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
          // deleteVisit(visit);
        }
      })
    }
  }

  // const collectData = (data) => {
  //   setData(data);
  // }

  return (
    <div className="container-schedule">
      {/* <Requirement type={type} view={view} collectData={collectData} openBox={openBox} changeBox={changeBox} closeBox={closeBox} /> */}
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className="title-schedule">
        <ScheduleIcon />
        <h2>Agenda</h2>
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
              <select
                value={year}
                className="schedule-month__select"
                name="year"
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </select>
            </div>
      </div>
      <div className="content-schedule-visit">
        <Dashboard data={schedule} monthSelect={monthSelect} type='visit' sellers={sellers} />
        <div className="box-schedule-visit" ref={boxVisitRef}>
            {
              (box.name === "create" && (
                <CreateVisit
                  returnSchedule={returnSchedule}
                  scheduleRef={scheduleRef}
                  membersRef={members}
                  tecs={tecs}
                  sellers={sellersOrder}
                  userRef={userRef}
                  schedule={schedule}
                  monthNumber={monthSelect}
                  type={box.type}
                  createVisitGroupChoice={createVisitGroupChoice}
                  checkNet={check}
                />
              )) || // Chama o componente 'Create'
              //   (box.name === "create lunch" && (
              //     <CreateVisit
              //       returnSchedule={returnSchedule}
              //       // filterSchedule={filterSchedule}
              //       scheduleRef={scheduleRef}
              //       membersRef={members}
              //       tecs={tecs}
              //       sellers={sellersOrder}
              //       userRef={userRef}
              //       schedule={schedule}
              //       monthNumber={monthNumber}
              //       type={"lunch"} // Para identificar se é para criar almoço ou mão
              //       checkNet={check}
              //     />
              //   )) 
                (box.name === "edit" && (
                  <EditVisit
                    returnSchedule={returnSchedule}
                    // filterSchedule={filterSchedule}
                    tecs={tecs}
                    sellers={sellersOrder}
                    userRef={userRef}
                    scheduleRef={scheduleRef}
                    scheduleRefUID={editVisit.ref}
                    visitRef={editVisit.info}
                    membersRef={members}
                    schedule={schedule}
                    monthSelect={monthSelect}
                    year={year}
                    type={editVisit.type}
                    checkNet={check}
                  />
                )) ||
                (box.name === "group" && (
                  <CreateVisitGroup
                    returnSchedule={returnSchedule}
                    // preData={data ? data : createVisitGroup.preData}
                    tecs={tecs}
                    sellers={sellers}
                    userRef={userRef}
                    scheduleRef={scheduleRef}
                    scheduleVisitRef={createVisitGroup.ref}
                    visitRef={createVisitGroup.info}
                    membersRef={members}
                    schedule={schedule}
                    monthNumber={monthSelect}
                    year={year}
                    type={createVisitGroup.type}
                    typeRef={createVisitGroup.typeRef}
                    checkNet={check}
                  />
                )) // Chama o componente 'Group'
            }
          {/* {(userRef && userRef.cargo === "Orçamentista" && !box.name) ||
          (userRef && userRef.cargo === "Administrador" && !box.name) ||
          (user.email === Users[0].email && !box.name) ? (
            <><h2>Criar Visita</h2>
            <div className="box-schedule-visit__content">
            {userRef && (userRef.cargo !== 'Indicador' || userRef.cargo !== 'Técnico') && userRef.nome !== 'Pós-Venda' &&
                <><div className="box-schedule-visit__add">
                      <button
                        onClick={() => {
                          openBox({ name: "create", type: "comercial" });
                          return handleBoxVisitRef();
                        } }
                      >
                        <span className="visit-icon comercial-fill"><RequestQuoteIcon /></span>
                        <div className="visit-text"><p>Visita Comercial</p></div>
                      </button>
                    </div><div className="box-schedule-visit__add">
                        <button
                          onClick={() => {
                            openBox({ name: "create", type: "comercial_tecnica" });
                            return handleBoxVisitRef();
                          } }>
                          <span className="visit-icon comercial_tec-fill"><PeopleIcon /></span>
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
                    <span className="visit-icon pos_venda-fill"><EngineeringIcon /></span>
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
                    <span className="visit-icon lunch-fill"><RestaurantIcon /></span>
                    <div className="visit-text"><p>Almoço</p></div>
                  </button>
                </div>}
              </div>
              </>
          ) : (
            <></>
          )} */}
              <div className="toggle-box desktop">
                <Filter tableData={schedule} dataFull={dayVisits} sellers={sellers} changeFilter={changeFilter} type={'visit'} />
                <div className="toggle-box-item">
                  <p>MODO FOCO</p>
                  <input
                    type="checkbox"
                    id="toggle"
                    className="toggle toggle--shadow"
                    checked={focoCheck}
                    onChange={() => changeFoco()}
                  />
                  <label htmlFor="toggle"></label>
                </div>
              </div>
          <div className="container-table desktop">
          <TableContainer className={focoCheck ? "table-visit table-foco" : "table-visit"} component={Paper} >
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow className="table-visits_header">
                  <TableCell align="center"></TableCell>
                  <TableCell align="center" padding="none">Visita</TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="center">Dia</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                  <TableCell align="center">Cliente</TableCell>
                  <TableCell align="center">Saida</TableCell>
                  <TableCell align="center">Horário Marcado</TableCell>
                  <TableCell align="center">Duração</TableCell>
                  <TableCell align="center">Fim da Visita</TableCell>
                  <TableCell align="center">Chegada</TableCell>
                  <TableCell align="center">Responsável</TableCell>
                  <TableCell align="center">Motorista</TableCell>
                  <TableCell align="center">Observação</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule && schedule.map((visita, index) => (
                  <TableRow
                    hover
                    key={index}
                    className={`list-visit`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {!visita.confirmar && visita.categoria === 'lunch' && 
                        <TableCell></TableCell>}
                        {!visita.confirmar && visita.tipo === 'Visita Conjunta' &&
                        <TableCell
                        className="group-icon cursor-help"
                        aria-label="Visita Conjunta"
                        data-cooltipz-dir="right"
                      ></TableCell>
                        }
                        {!visita.confirmar && visita.tipo === 'Visita' &&
                        <TableCell
                        className="visits-icon cursor-help"
                        aria-label="Visita Única"
                        data-cooltipz-dir="right"
                      ></TableCell>
                        }
                        {visita.confirmar &&
                        <TableCell
                              className="confirm-icon cursor-help"
                              aria-label="Visita Confirmada"
                              data-cooltipz-dir="right"
                            ></TableCell>
                        }
                    {visita.categoria === "lunch" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ filter: 'contrast', padding: '0.2rem' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></TableCell>}
                    {visita.categoria === "comercial" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></TableCell>}
                    {visita.categoria === "comercial_tecnica" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></TableCell>}
                    {visita.categoria === "pos_venda" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></TableCell>}
                    {/* Para quem é vendedor */}
                    {!visita.confirmar && (visita.categoria === "comercial" || visita.categoria === "comercial_tecnica") &&
                         userRef && userRef.cargo === "Orçamentista" && 
                        <TableCell className="btn-add"
                        aria-label="Criar Visita Conjunta"
                        data-cooltipz-dir="right"
                        onClick={() => openBox({visit: visita, type: visita.categoria, ref: 'conjunta'})}>
                        </TableCell>
                        }
                        {/* Para quem não é vendedor */}
                        {!visita.confirmar && (visita.categoria === "comercial" || visita.categoria === "comercial_tecnica") &&
                         userRef && ( userRef.cargo !== "Orçamentista") &&
                        <TableCell className="btn-add disabled">
                        </TableCell>
                        }
                        {/* Para quem é Pós-Venda */}
                        {!visita.confirmar && (visita.categoria === "pos_venda") && userRef  && userRef.nome === "Pós-Venda" &&
                        <TableCell className="btn-add"
                        aria-label="Criar Visita Conjunta"
                        data-cooltipz-dir="right"
                        onClick={() => createVisitGroupChoice({visit: visita, type: visita.categoria})}>
                        </TableCell>}
                        {/* Para quem não é Pós-Venda */}
                        {!visita.confirmar && (visita.categoria === "pos_venda") && userRef  && userRef.nome !== "Pós-Venda" &&
                        <TableCell className="btn-add disabled">
                      </TableCell>}
                        {/* Almoço */}
                        {!visita.confirmar && (visita.categoria === "lunch") &&
                        <TableCell className="btn-add disabled">
                      </TableCell>}
                        {/* Confirmado */}
                        {visita.confirmar &&
                        <TableCell className="btn-add disabled">
                      </TableCell>}
                    <TableCell sx={{ width: 30, fontWeight: 'bold' }} align="center" scope="row">
                      {visita.dia.substring(8, 10)}
                    </TableCell>
                    <TableCell align="center">{visita.cidade && visita.cidade}</TableCell>
                    <TableCell align="center">{visita.cliente}</TableCell>
                    {visita.tipo === "Almoço" ? (
                          <TableCell></TableCell>
                        ) : (
                          <TableCell align="center" className="bold bg-important">
                            {visita.saidaEmpresa}
                          </TableCell>
                        )}
                        <TableCell align="center">{visita.chegadaCliente}</TableCell>
                        <TableCell align="center">{visita.visita}</TableCell>
                        <TableCell align="center" className={"bg-important-2"}>
                          {visita.saidaDoCliente}
                        </TableCell>
                        {visita.tipo === "Almoço" ? (
                          <TableCell></TableCell>
                        ) : (
                          <TableCell align="center" className="bold bg-important">
                            {visita.chegadaEmpresa}
                          </TableCell>
                        )}
                    <TableCell 
                    align="center" scope="row">
                      <b>{visita.consultora} ({visita.id_user})</b>
                    </TableCell>
                    <TableCell align="center">{visita.tecnico}</TableCell>
                    <TableCell align="center" className="observation">{visita.observacao}</TableCell>
                    <TableCell
                        sx={{ display: 'flex' }}
                        >
                          {(visita.confirmar === false && visita.uid === user.id) ||
                          user.email === Users[0].email ||
                          (userRef && userRef.cargo === "Administrador") ||
                          (userRef && userRef.cargo === "Closer") ? (
                            <>
                                <IconButton
                                  id="basic-button"
                                  aria-label="Editar Visita"
                                  data-cooltipz-dir="left"
                                  onClick={() => {
                                    setBox({name: "edit"});
                                    setEditVisit({
                                      info: visita,
                                      ref: doc(
                                        dataBase,
                                        "Agendas",
                                        year,
                                        monthSelect,
                                        visita.id
                                      ),
                                      type: visita.categoria
                                    });
                                    return handleBoxVisitRef();
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                                {/* <IconButton
                                  id="basic-button"
                                  aria-label="Excluir Visita"
                                  data-cooltipz-dir="left"
                                  onClick={() => deleteVisit(visita)}
                                >
                                  <DeleteIcon />
                                </IconButton> */}
                            </>
                          ) : (
                            <></>
                          )}

                          {visita.confirmar === false &&
                          ((userRef && userRef.cargo === "Closer") || (userRef && userRef.cargo === "Gestor") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                            <>
                                <IconButton
                                  aria-label="Confirmar Visita"
                                  data-cooltipz-dir="left"
                                  sx={{ width: '40px', height: '40px' }}
                                  onClick={() => confirmVisit(visita, "confirm")}
                                >
                                  <CheckIcon />
                                </IconButton>
                            </>
                          ) : (
                            <></>
                          )}

                          {visita.confirmar === true &&
                          ((userRef && userRef.cargo === "Closer") || (userRef && userRef.cargo === "Gestor") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                            <>
                                <IconButton
                                  aria-label="Cancelar Visita"
                                  data-cooltipz-dir="left"
                                  sx={{ width: '36px', height: '36px' }}
                                  onClick={() => confirmVisit(visita, "cancel")}
                                >
                                  <BlockIcon />
                                </IconButton>
                            </>
                          ) : (
                            <></>
                          )}
                        </TableCell>
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
          </div>
          {/* MOBILE */}
          <div className="box-mobile">
            <h1 className="mobile-title">Visitas do Mês</h1>
          {schedule && schedule.length > 0  ?
            <TableContainer className="table-visits" component={Paper} 
            sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow className="table-visits_header">
                  <TableCell align="center"></TableCell>
                  <TableCell align="center" padding="none">Visita</TableCell>
                  {userRef && userRef.cargo !== 'Técnico' && 
                    <TableCell align="center">Ação</TableCell>
                  }
                  <TableCell align="center">Dia</TableCell>
                  <TableCell align="center">Saida</TableCell>
                  <TableCell align="center">Chegada</TableCell>
                  <TableCell align="center">Motorista</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((visita, index) => (
                  <TableRow
                    hover
                    key={index}
                    className={`list-visit ${visita.tipo === 'Visita Conjunta' && !visita.confirmar ? 'conjunta' : ''} ${visita.confirmar ? 'confirmar' : ''}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                    aria-label={visita.consultora}
                    data-cooltipz-dir="right"
                    sx={{ backgroundColor: `${visita.cor}`, color: '#fff', fontWeight: 'bold' }} 
                    align="center" scope="row">
                      {visita.consultora.substring(0, 1)}
                    </TableCell>
                    {visita.categoria === "lunch" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ filter: 'contrast', padding: '0.2rem' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></TableCell>}
                    {visita.categoria === "comercial" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></TableCell>}
                    {visita.categoria === "comercial_tecnica" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></TableCell>}
                    {visita.categoria === "pos_venda" && <TableCell onClick={() => viewVisita(visita, visita.categoria)} style={{ padding: '0.2rem' }} className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></TableCell>}
                    {!visita.confirmar && (visita.categoria === 'comercial' || visita.categoria === 'comercial_tecnica') && 
                    userRef && userRef.cargo === 'Orçamentista' && userRef.nome !== 'Pós-Venda' &&
                    <TableCell className="btn-add"
                    aria-label="Criar Visita Conjunta"
                    data-cooltipz-dir="right"
                     onClick={() => openBox({visit: visita, type: visita.categoria, ref: 'conjunta'})}
                    ></TableCell>
                    }
                    {!visita.confirmar && visita.categoria === 'pos_venda' && 
                    userRef && userRef.nome === 'Pós-Venda' &&
                    <TableCell className="btn-add"
                    aria-label="Criar Visita Conjunta"
                    data-cooltipz-dir="right"
                     onClick={() => createVisitGroupChoice({visit: visita, type: visita.categoria})}
                    ></TableCell>
                    }
                    {visita.confirmar === false &&
                    (user.email === Users[0].email || (userRef && userRef.cargo === "Administrador") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                      <TableCell className="btn-confirm"
                      aria-label="Confirmar Visita"
                      data-cooltipz-dir="right"
                      onClick={() => confirmVisit(visita, "confirm")}
                      ></TableCell>
                    ) : 
                    (
                    <></>
                    )}
                    {visita.confirmar === true &&
                    (user.email === Users[0].email || (userRef && userRef.cargo === "Administrador") || (userRef && userRef.nome === 'Pós-Venda')) ? (
                     <TableCell className="btn-cancel"
                    aria-label="Cancelar Visita"
                    data-cooltipz-dir="right"
                    onClick={() => confirmVisit(visita, "cancel")}
                    ></TableCell>
                            ) : (
                              <></>
                    )}
                    {(visita.confirmar || visita.categoria === 'pos_venda' || visita.categoria === 'lunch' ) && userRef && userRef.cargo === 'Orçamentista' && 
                      <TableCell className="btn-add disabled"
                      ></TableCell>
                    }
                    <TableCell sx={{ width: 30 }} align="center" scope="row">
                      {visita.dia.substring(8, 10)}
                    </TableCell>
                    <TableCell align="center">{visita.saidaEmpresa}</TableCell>
                    <TableCell align="center">{visita.chegadaEmpresa}</TableCell>
                    <TableCell align="center">{visita.tecnico}</TableCell>
                    {visita.categoria !== "lunch" && 
                      <TableCell align="center">{visita.cidade && visita.cidade}</TableCell>
                    }
                    {visita.categoria === 'lunch' && 
                      <TableCell />
                    }
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
               :
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
