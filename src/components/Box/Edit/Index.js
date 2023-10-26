import { deleteDoc, updateDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { dataBase } from "../../../firebase/database";
// import axios from 'axios';
import { useLayoutEffect, useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from "moment";
import "moment/locale/pt-br";


import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import RestaurantIcon from '@mui/icons-material/Restaurant'; // Almoço
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ReactComponent as CheckIcon } from "../../../images/icons/Check.svg";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { Company } from "../../../data/Data";
// import useAuth from "../../../hooks/useAuth";

import "../style.scss";

const EditVisit = ({
  returnSchedule,
  tecs,
  sellers,
  userRef,
  visitRef,
  scheduleRef,
  scheduleRefUID,
  schedule,
  monthNumber,
  monthSelect,
  year,
  type,
  checkNet
}) => {
  
  // const { user } = useAuth();
  const [rotaTempo, setRotaTempo] = useState();
  const [tempoTexto, setTempoTexto] = useState();
  const [visitaNumero, setVisitaNumero] = useState(1800);
  const [saidaCliente, setSaidaCliente] = useState();
  const [horarioTexto, setHorarioTexto] = useState();
  const [saidaTexto, setSaidaTexto] = useState();
  const [checkInput, setCheckInput] = useState(false);
  const [dataRef, setDataRef] = useState();
  const [chegadaTexto, setChegadaTexto] = useState();
  const [dataTexto, setDataTexto] = useState();
  const [tecnicoTexto, setTecnicoTexto] = useState();
  const [consultoraTexto, setConsultoraTexto] = useState(userRef.cargo === "Vendedor(a)" ? userRef.nome : visitRef.consultora);
  const [sellerRef, setSellerRef] = useState(); // Procura os tecnicos que vem da pagina 'Schedule'
  const [tecRefUID, setTecRefUID] = useState(); // Procura os tecnicos que vem da pagina 'Schedule'
  const [veiculo, setVeiculo] = useState();
  const [city, setCity] = useState();
  const [driver, setDriver] = useState(); // Para escolher o motorista/tecnico de acordo com o tipo de visita
  const [visits, setVisits] = useState();
  //const [visits, setVisits] = useState(schedule);
  const [hoursLimit, setHoursLimit] = useState(false);
  const [visitsFindCount, setVisitsFindCount] = useState();
  const [visitsFind, setVisitsFind] = useState();
  const { register, handleSubmit, reset } = useForm();

  console.log(tecnicoTexto)

  useLayoutEffect(() => {
    // faz a solicitação do servidor assíncrono e preenche o formulário
    setTimeout(() => {
      reset({
        consultora: visitRef.consultora,
        cliente: visitRef.cliente,
        observacao: visitRef.observacao,
      });
      setVisitaNumero(visitRef.visitaNumero);
      setSaidaTexto(visitRef.saidaEmpresa);
      setChegadaTexto(visitRef.chegadaEmpresa);
      setSaidaCliente(visitRef.chegadaCliente);
      setDataTexto(moment(new Date(visitRef.dia)).format("YYYY-MM-DD"));
      setTecnicoTexto(visitRef.tecnico);
      if(visitRef.tecnico !== 'Nenhum') {
        setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto));
      } else {
        setTecRefUID({nome: 'Nenhum', uid: '000', veiculo: visitRef.veiculo});
      }
      setVeiculo(visitRef.veiculo);
      setCity(visitRef.cidade);
      if (visitRef.consultora === "lunch") {
        setHorarioTexto(visitRef.saidaEmpresa);
      } else {
        setHorarioTexto(visitRef.chegadaCliente);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitRef]);

  useEffect(() => { // Seleciona a visita de acordo com o tipo escolhido
    const init = () => {
      switch (type) {
        case 'lunch':
          setDriver(tecs.filter((ref) => ref.nome === userRef.nome))
          setTecnicoTexto(userRef.nome);
          break
        case 'comercial':
          // setDriver(tecs.filter((ref) => ref.nome === "Bruna" || ref.nome === "Lia"))
          setDriver(tecs)
          setTecnicoTexto('Bruna');
          break
        case 'comercial_tecnica':
          setDriver(tecs)
          setTecnicoTexto('Lucas');
          break
        case 'pos_venda':
          setDriver(tecs.filter((ref) => ref.nome === "Lucas" || ref.nome === "Luis"))
          setTecnicoTexto('Lucas');
          setConsultoraTexto('Pós-Venda')
          break
        default:
          setDriver(tecs)
          setVisits(schedule)
      }
      // console.log(consultora)
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(tecRefUID && tecRefUID.nome !== 'Nenhum') {
      if(tecnicoTexto && tecnicoTexto === 'Nenhum') return setTecRefUID({nome: 'Nenhum', uid: '000'})
    }
  },[tecRefUID, tecnicoTexto])

  useEffect(() => {
    // let visitsType = schedule.filter((visit) => visit.tecnico === "Lucas" && visit.tecnico === "Luis");
    let visitsData;
    let visitsType;
    switch (type) {
      case 'comercial':
        visitsData = schedule.filter((visit) => visit.data === dataTexto && (visit.tecnico !== "Lucas" && visit.tecnico !== "Luis"));
        visitsType = schedule.filter((visit) => (visit.tecnico !== "Lucas" && visit.tecnico !== "Luis") || visit.categoria === 'lunch')
        break
      case 'lunch':
        visitsData = schedule.filter((visit) => visit.data === dataTexto);
        visitsType = schedule;
        break
      default:
        visitsData = schedule.filter((visit) => visit.data === dataTexto && (visit.tecnico === "Lucas" || visit.tecnico === "Luis" || visit.categoria === 'lunch'));// Parei aqui
        visitsType = schedule.filter((visit) => visit.tecnico === "Lucas" || visit.tecnico === "Luis" || visit.categoria === 'lunch')
    }
    if(dataTexto) {
      if (visitsData && dataTexto.substring(8,10) !== "00") {
        setVisits(visitsData);
      }
    } else {
      setVisits(visitsType);
      // console.log(schedule.filter((visit) => visit.tecnico !== "Lucas" && visit.tecnico !== "Luis"))
      // console.log(dataTexto)
    }
  },[dataTexto, schedule, type])

  // useEffect(() => {
  //   if(dataTexto) {
  //     const visitsData = schedule.filter((visit) => visit.data === dataTexto);
  //     if (visitsData && dataTexto.substring(8,10) !== "00") {
  //       setVisits(visitsData);
  //     }
  //   } else {
  //     setVisits(schedule);
  //   }
  // },[dataTexto, schedule])

  useEffect(() => {
    // if (dataTexto) {
    //   filterSchedule(dataTexto, tecnicoTexto);
    // } else {
    //   filterSchedule();
    // }
    if(tecnicoTexto && tecnicoTexto !== 'Nenhum') setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto));  
    if(consultoraTexto) {
      setSellerRef(sellers.find((sel) => sel.nome === consultoraTexto)); 
    }
    if(tecRefUID && tecRefUID.nome !== visitRef.tecnico && tecRefUID.nome !== 'Nenhum') setVeiculo(tecRefUID.veiculo)
    if(tecRefUID && tecRefUID.nome === visitRef.tecnico && tecRefUID.nome !== 'Nenhum') setVeiculo(visitRef.veiculo)

    // Muda o filtro de busca das visitas de acordo com o dia escolhido
    if (dataTexto === visitRef.data) {
      setDataRef(
        schedule.filter(
          (dia) =>
            dia.data === dataTexto &&
            dia.tecnico === tecnicoTexto &&
            dia.chegadaCliente !== visitRef.chegadaCliente
        )
      );
    } else {
      setDataRef(
        schedule.filter(
          (dia) => dia.data === dataTexto && dia.tecnico === tecnicoTexto
        )
      );
    }

    // Atualiza o tempo de rota de acordo com o tipo de visita
    if (
      (dataTexto === visitRef.data && visitRef.visitaConjunta) ||
      (dataTexto === visitRef.data && visitRef.group)
    ) {
      if (
        (dataTexto === visitRef.data &&
          !visitRef.group &&
          visitRef.groupRef === "antes") ||
        (dataTexto === visitRef.data && visitRef.group === "depois")
      ) {
        setTempoTexto(visitRef.tempoConjunta);
        setRotaTempo(visitRef.tempoRotaConjunta);
        // console.log("2");
      }
      if (
        (dataTexto === visitRef.data &&
          !visitRef.visitaConjunta &&
          !visitRef.group) ||
        (dataTexto === visitRef.data &&
          visitRef.visitaConjunta &&
          visitRef.groupRef === "depois" &&
          !visitRef.group) ||
        (dataTexto === visitRef.data &&
          visitRef.group === "antes" &&
          !visitRef.visitaConjunta)
      ) {
        // Primeira visita do 'antes'
        setTempoTexto(visitRef.tempo);
        setRotaTempo(visitRef.tempoRota);
        // console.log("33333");
      }
    } else {
      if (
        (dataTexto !== visitRef.data &&
          !visitRef.group &&
          visitRef.groupRef === "antes") ||
        (dataTexto !== visitRef.data && visitRef.group === "depois") ||
        (dataTexto === visitRef.data && !visitRef.visitaConjunta)
      ) {
        setTempoTexto(visitRef.tempo);
        setRotaTempo(visitRef.tempoRota);
        // console.log("2222222");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto, horarioTexto, tecRefUID, consultoraTexto]);

  useEffect(() => {
    // console.log(visitaNumero);
    if (horarioTexto || dataTexto || rotaTempo) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada

      if(visitRef.data) { // Observação
      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa
      // console.log(saidaTexto, rotaTempo);
        setSaidaTexto(saidaEmpresa.format("kk:mm"));
      }
      chegadaCliente.add(visitaNumero, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      setSaidaCliente(chegadaCliente.format("kk:mm"));

      if (
        (dataTexto === visitRef.data && visitRef.visitaConjunta) ||
        (dataTexto === visitRef.data && visitRef.group)
      ) {
        setCheckInput(false);

        //chegadaCliente.add(60, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        setChegadaTexto(visitRef.chegadaEmpresa);
      } else {
        chegadaCliente.add(rotaTempo, "seconds").format("hh:mm");
        setCheckInput(true);
        // console.log("trocou");
        setChegadaTexto(chegadaCliente.format("kk:mm"));
      }
    }

  moment.locale("pt-br");
  const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada
  chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta

  const saidaFormatada = moment(saidaTexto, "hh:mm");
  const chegadaFormatada = moment(chegadaTexto, "hh:mm");
  saidaFormatada.add(1, "minutes").format("hh:mm");
  chegadaFormatada.subtract(1, "minutes").format("hh:mm");

  // console.log(saidaEmpresaRef);
  //console.log(chegadaFormatada)

  let check = [];
  let visitsFindData = [];

    dataRef && dataRef.map((ref) => {
      // console.log("eae");
      if (
        saidaFormatada <= moment(ref.saidaEmpresa, "hh:mm") &&
        chegadaFormatada <= moment(ref.saidaEmpresa, "hh:mm")
      ) {
        check.push(ref);
      } else {
        if (saidaFormatada >= moment(ref.chegadaEmpresa, "hh:mm"))
          check.push(ref);
      }
      return dataRef;
    });
  

    // console.log(visitsFindCount);
    
    dataRef && dataRef.map((a) => {
      //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
      if (check.includes(a) === false) {
        visitsFindData.push(a);
      }
      return setVisitsFind(visitsFindData);
    });

    setVisitsFindCount(dataRef && dataRef.length - check.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    horarioTexto,
    visitaNumero,
    chegadaTexto,
    saidaTexto,
    tecnicoTexto,
    rotaTempo,
    dataTexto,
  ]);


  const onSubmit = async (userData) => {
    try {
      if(checkNet) {
        Swal.fire({
          title: 'Sem Conexão',
          icon: "error",
          html: `Não é possível Editar uma Visita <b>sem internet.</b> Verifique a sua conexão.`,
          confirmButtonText: "Fechar",
          showCloseButton: true,
          confirmButtonColor: "#d33"  
        })
      } else {
        let c = 1;
        if (visitsFindCount < 0 || visitsFindCount > 0) {
          const visits = visitsFind.map(
            (e) =>
              `Visita <b>` +
              c++ +
              "</b> - Saida: <b>" +
              e.saidaEmpresa +
              "</b> Chegada: <b>" +
              e.chegadaEmpresa +
              "</b></br>"
          );
          Swal.fire({
            title: Company,
            html:
              `Foram encontrado(s) <b>${visitsFindCount}</b> visita(s) marcada(s) nesse periodo.</br></br>` +
              visits,
            icon: "error",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
          });
        } else {
          let msg1, msg2;
          if (visitRef.categoria === "lunch") {
            msg1 = 'o <b>horário de almoço?</b>'
            msg2 = 'O <b>horário de almoço</b> foi alterado'
          } else { 
            msg1 = 'essa <b>Visita?</b>'
            msg2 = `A visita em <b>${visitRef.cidade}</b> foi alterada`
           }
          Swal.fire({
            title: Company,
            html: `Você deseja alterar ${msg1}`,
            icon: "question",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              if (visitRef.data !== dataTexto) {
              const visitsAntes = schedule.filter(
                  (ref) =>
                    ref.data === visitRef.data &&
                    ref.chegadaEmpresa === visitRef.saidaEmpresa &&
                    ref.tipo !== "Almoço" &&
                    !ref.visitaAlmoco
  
                );
               const visitsDepois = schedule.filter(
                  (ref) =>
                    ref.data === visitRef.data &&
                    ref.saidaEmpresa === visitRef.chegadaEmpresa &&
                    ref.tipo !== "Almoço" &&
                    !ref.visitaAlmoco
                );
                // console.log(visitsAntes, visitsDepois);
            if(visitsAntes.length > 0) {
              visitsAntes.map(async (ref) => {
                const visitBefore =  schedule.filter(before => (before.data === ref.data && before.chegadaEmpresa === ref.saidaEmpresa && ref.categoria !== 'lunch' && before.tipo === "Visita Conjunta" && !before.visitaAlmoco));
                if(ref.cidade === visitRef.cidade) {
                  if(visitBefore) {
                    visitBefore.map(async (ref) => {
                      await updateDoc(doc(dataBase, "Visitas_2023", ref.id),
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
                    doc(dataBase, "Visitas_2023", ref.id)
                  );
                } else {
                  await updateDoc(doc(dataBase, "Visitas_2023", ref.id),
                              {
                                chegadaEmpresa: moment(ref.saidaDoCliente, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'),
                                groupRef: "",
                                group: "",
                                visitaConjunta: false,
                                tipo: "Visita"
                              })
                }
                  // console.log(ref.chegadaEmpresa ,moment(ref.chegadaEmpresa, "hh:mm").add(ref.tempoRota, 'seconds').format('kk:mm'))
            })
            }
            if (visitsDepois.length > 0) {
              visitsDepois.map(async (ref) => {
               const visitNext =  schedule.filter(next => (next.data === ref.data && next.saidaEmpresa === ref.chegadaEmpresa && ref.categoria !== 'lunch' && next.tipo === "Visita Conjunta" && !next.visitaAlmoco));
                if(ref.cidade === visitRef.cidade) {
                  if(visitNext) {
                    visitNext.map(async (ref) => {
                      await updateDoc(doc(dataBase, "Visitas_2023", year, monthSelect, ref.id),
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
                  doc(dataBase, "Visitas_2023", year, monthSelect, ref.id)
                );
                } else {
                  await updateDoc(doc(dataBase, "Visitas_2023", year, monthSelect, ref.id),
                            {
                              saidaEmpresa: moment(ref.chegadaCliente, "hh:mm").subtract(ref.tempoRota, 'seconds').format('kk:mm'),
                              groupRef: "",
                              group: "",
                              visitaConjunta: false,
                              tipo: "Visita"
                            })
                }
                
                // console.log(ref.saidaEmpresa ,moment(ref.chegadaCliente, "hh:mm").subtract(ref.tempoRota, 'seconds').format('kk:mm'))
              })
              }
            }
  
              if (visitRef.categoria === "lunch") {
                await updateDoc(scheduleRefUID, {
                  dia: moment(dataTexto).format("YYYY MM DD"),
                  saidaEmpresa: saidaTexto,
                  chegadaCliente: saidaTexto,
                  visita: "01:00",
                  visitaNumero: 3600,
                  saidaDoCliente: chegadaTexto,
                  chegadaEmpresa: chegadaTexto,
                  consultora: tecRefUID.nome,
                  tecnico: tecRefUID.nome,
                  tecnicoUID: tecRefUID.uid,
                  cidade: "",
                  tempoRota: "",
                  tempo: "",
                  cliente: "",
                  observacao: userData.observacao,
                  data: dataTexto,
                  uid: visitRef.uid,
                  cor: tecRefUID.cor,
                  confirmar: false,
                  categoria: 'lunch',
                  corTec: tecRefUID.cor,
                  updateVisit: new Date(),
                  dataRef: new Date(`${dataTexto}T${saidaTexto}`)
                });
              }
              if (
                visitRef.data !== dataTexto && // Visita editada para outro dia
                visitRef.categoria !== "lunch"
              ) {
                await updateDoc(
                  doc(dataBase, "Visitas_2023", visitRef.id),
                  {
                    dia: moment(dataTexto).format("YYYY MM DD"),
                    data: dataTexto,
                    saidaEmpresa: saidaTexto,
                    chegadaCliente: horarioTexto,
                    visita: moment("00:00", "HH:mm").add(visitaNumero, "seconds").format("HH:mm"),
                    visitaNumero: visitaNumero,
                    saidaDoCliente: saidaCliente,
                    chegadaEmpresa: chegadaTexto,
                    tecnico: tecRefUID.nome,
                    tecnicoUID: tecRefUID.uid,
                    veiculo: veiculo,
                    cidade: visitRef.cidade,
                    cliente: userData.cliente,
                    observacao: userData.observacao,
                    consultora: consultoraTexto,
                    uid: sellerRef.id,
                    cor: sellerRef.cor,
                    visitaConjunta: false,
                    groupRef: "",
                    group: "",
                    tipo: "Visita",
                    categoria: tecRefUID.nome === 'Lucas' ? 'comercial_tecnica' : 'comercial',
                    corTec: tecRefUID.cor,
                    updateVisit: new Date(),
                    dataRef: new Date(`${dataTexto}T${horarioTexto}`),
                    data_completa: moment(dataTexto).format('DD MMMM YYYY') + '-' + horarioTexto 
                  }
                );
              } else if (
                visitRef.data === dataTexto && // Visita editada para o mesmo dia
                visitRef.categoria !== "lunch"
              ) {
                // console.log(userData.consultora)
                await updateDoc(
                  doc(dataBase, "Visitas_2023", visitRef.id),
                  {
                    dia: moment(dataTexto).format("YYYY MM DD"),
                    data: dataTexto,
                    saidaEmpresa: saidaTexto,
                    chegadaCliente: horarioTexto,
                    visita: moment("00:00", "HH:mm").add(visitaNumero, "seconds").format("HH:mm"),
                    visitaNumero: visitaNumero,
                    saidaDoCliente: saidaCliente,
                    chegadaEmpresa: chegadaTexto,
                    tecnico: tecRefUID.nome,
                    tecnicoUID: tecRefUID.uid,
                    veiculo: veiculo,
                    cidade: visitRef.cidade,
                    cliente: userData.cliente,
                    observacao: userData.observacao,
                    consultora: consultoraTexto,
                    uid: sellerRef.id,
                    cor: sellerRef.cor,
                    categoria: tecRefUID.nome === 'Lucas' ? 'comercial_tecnica' : 'comercial',
                    corTec: tecRefUID.cor,
                    updateVisit: new Date(),
                    dataRef: new Date(`${dataTexto}T${horarioTexto}`),
                    data_completa: moment(dataTexto).format('DD MMMM YYYY') + '-' + horarioTexto 
                  }
                );
              }
              if(visitRef.categoria !== 'lunch') {
                let msg;
                if(dataTexto !== visitRef.dia || horarioTexto !== visitRef.visita) msg = `A Apresentação do(a) <b>${visitRef.cliente}</b> foi alterada 
                para o dia <b>${moment(dataTexto).format('DD/MM')} às ${horarioTexto}</b>.`
                await addDoc(collection(dataBase, "Membros", visitRef.uid, 'Notificacao'), {
                  createAt: serverTimestamp(),
                  type: 'Visita',
                  data: moment().format('YYYY-MM-DD'),
                  text: msg
                })
              }
              // if(visitRef.categoria !== "lunch") {
              //   const date = new Date(visitRef.data);
              //   axios.post('https://n8n.corpbrasil.cloud/webhook/63b48297-3e22-4eba-8b21-45e87f52f3fb', {
              //     ID: visitRef.id,
              //     data: moment(visitRef.data).format("DD/MM/YYYY"),
              //     nome: tecRefUID.nome,
              //     cliente: userData.cliente,
              //     marcado: horarioTexto,
              //     consultora: consultoraTexto,
              //     city: visitRef.cidade,
              //     semana: getMonthlyWeekNumber(date),
              //     mes: moment(visitRef.data).format("M"),
              //     ende: visitRef.endereco,
              //     confirmada: 'Não',
              //     categoria: visitRef.categoria,
              //     extra: visitRef.preData,
              //   })
              // } 
              Swal.fire({
                title: Company,
                html: `${msg2} com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#F39200",
              }).then(() => {
                  return returnSchedule();
              });
            }
          });
        }
      }
    } catch (error) {
      // console.log(error);
    }
  };

  // function getMonthlyWeekNumber(dt)
  // {
  //     // como função interna, permite reuso
  //     var getmonweek = function(myDate) {
  //         var today = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),0,0,0);
  //         var first_of_month = new Date(myDate.getFullYear(),myDate.getMonth(),1,0,0,0);
  //         var p = Math.floor((today.getTime()-first_of_month.getTime())/1000/60/60/24/7);
  //         // ajuste de contagem
  //         if (today.getDay()<first_of_month.getDay()) ++p;
  //         // ISO 8601.
  //         if (first_of_month.getDay()<=3) p++;
  //         return p;
  //     }
  //     // último dia do mês
  //     var udm = (new Date(dt.getFullYear(),dt.getMonth()+1,0,0,0,0)).getDate();
  //     /*  Nos seis primeiros dias de um mês: verifica se estamos antes do primeiro Domingo.
  //      *  Caso positivo, usa o último dia do mês anterior para o cálculo.
  //      */
  //     if ((dt.getDate()<7) && ((dt.getDate()-dt.getDay())<-2))
  //         return getmonweek(new Date(dt.getFullYear(),dt.getMonth(),0));
  //     /*  Nos seis últimos dias de um mês: verifica se estamos dentro ou depois do último Domingo.
  //      *  Caso positivo, retorna 1 "de pronto".
  //      */
  //     else if ((dt.getDate()>(udm-6)) && ((dt.getDate()-dt.getDay())>(udm-3)))
  //         return 1;
  //     else
  //         return getmonweek(dt);
  // }

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        {type === 'lunch' && <h4>Editar Almoço</h4>}
        {type === "comercial" && <h4>Editar Visita Comercial</h4>}
        {type === "comercial_tecnica" && <h4>Editar Visita Comercial + Técnica</h4>}
        {type === "pos_venda" && <h4>Editar Visita de Pós-Venda</h4>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
          <div className="box-visit__form">
          {visitRef.categoria !== "lunch" && (
            <>
              <label className="label">
              <p data-cooltipz-size="fit"
                 aria-label={tempoTexto && `Tempo da Rota: ${tempoTexto}`}
                  className="notice cooltipz--top cooltipz--visible">Endereço *</p>
                <input
                  className="label__input"
                  placeholder="Digite a cidade"
                  value={visitRef.endereco ? visitRef.endereco : city}
                  disabled
                />
              </label>
            </>
          )}
            <label className="label">
              <p>Dia *</p>
              {visitRef.categoria === "lunch" ? (
                <input
                  value={dataTexto || ""}
                  className="label__input"
                  type="date"
                  min={moment(new Date()).format('YYYY-MM-DD')}
                  onChange={(e) => setDataTexto(e.target.value)}
                  placeholder="Digite o dia"
                  autoComplete="off"
                  disabled
                />
              ) : (
                <input
                  value={dataTexto || ""}
                  className="label__input"
                  type="date"
                  min={moment(new Date()).format('YYYY-MM-DD')}
                  onChange={(e) => setDataTexto(e.target.value)}
                  placeholder="Digite o dia"
                  autoComplete="off"
                  required
                />
              )}
            </label>
            <label className="label">
              <p>Hórario Marcado *</p>
              {(visitRef.visitaConjunta && !checkInput) ||
              (visitRef.group && !checkInput) ? (
                <input
                  className="label__input time"
                  type="time"
                  value={horarioTexto || ""}
                  placeholder="Digite o hórario marcado"
                  min="07:00"
                  max="18:00"
                  onBlur={(e) =>
                    moment(e.target.value, "hh:mm") <
                      moment("07:00", "hh:mm") ||
                    moment(e.target.value, "hh:mm") > moment("18:00", "hh:mm")
                      ? setHoursLimit(true)
                      : setHoursLimit(false)
                  }
                  onChange={(e) => setHorarioTexto(e.target.value)}
                  disabled
                />
              ) : (
                <></>
              )}
              {(visitRef.visitaConjunta && checkInput) ||
              visitRef.categoria === "lunch" ||
              (!visitRef.visitaConjunta &&
                visitRef.categoria !== "lunch" &&
                checkInput) ||
              (!visitRef.visitaConjunta &&
                visitRef.categoria !== "lunch" &&
                !visitRef.group) ? (
                <input
                  className="label__input time"
                  type="time"
                  value={horarioTexto || ""}
                  placeholder="Digite o hórario marcado"
                  min="07:00"
                  max="18:00"
                  onBlur={(e) =>
                    moment(e.target.value, "hh:mm") <
                      moment("07:00", "hh:mm") ||
                    moment(e.target.value, "hh:mm") > moment("18:00", "hh:mm")
                      ? setHoursLimit(true)
                      : setHoursLimit(false)
                  }
                  onChange={(e) => setHorarioTexto(e.target.value)}
                  required
                />
              ) : (
                <></>
              )}
              {hoursLimit && (
                <p className="notice red">Limite de hórario: 07:00 - 18:00</p>
              )}
            </label>
            {visitRef.categoria !== 'lunch' && 
            
            <label className="label">
              <p>Tempo de Visita *</p>
              {visitRef.categoria === "lunch" || !checkInput ? (
                <select
                  value={3600}
                  className="label__select"
                  name="tec"
                  disabled
                  onChange={(e) => setVisitaNumero(e.target.value)}
                >
                  <option value={1800}>00:30</option>
                  <option value={3600}>01:00</option>
                  <option value={5400}>01:30</option>
                  <option value={7200}>02:00</option>
                </select>
              ) : (
                <select
                  value={visitaNumero}
                  className="label__select"
                  name="tec"
                  required
                  onChange={(e) => setVisitaNumero(e.target.value)}
                >
                  <option value={1800}>00:30</option>
                  <option value={3600}>01:00</option>
                  <option value={5400}>01:30</option>
                  <option value={7200}>02:00</option>
                </select>
              )}
            </label>
            }
            </div>
            {visits && visits.length > 0 ? 
            <><h2 className="title-visits">{dataTexto ? 'Visita(s) do Dia' : 'Visitas do Mês'}</h2>
             <TableContainer className="table-visits" component={Paper} sx={{ maxHeight: 200 }}>
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow className="table-visits_header">
                  <TableCell align="center"></TableCell>
                  <TableCell align="center">Visita</TableCell>
                  <TableCell align="center">Dia</TableCell>
                  <TableCell align="center">Saida</TableCell>
                  <TableCell align="center">Chegada</TableCell>
                  <TableCell align="center">Motorista</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visits.map((visita) => (
                  <TableRow
                    key={visita.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                    aria-label={visita.consultora + ' (' + visita.id_user + ')'}
                    data-cooltipz-dir="right"
                    sx={{ backgroundColor: `${sellers && sellers.filter((data) => data.id === visita.uid)[0].cor}`, width: 30 }} 
                    align="center" component="th" scope="row">
                      <b>{visita.consultora.substring(0, 1)}</b>
                    </TableCell>
                    {visita.categoria === "lunch" && <TableCell style={{ filter: 'contrast' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></TableCell>}
                    {visita.categoria === "comercial" && <TableCell className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></TableCell>}
                    {visita.categoria === "comercial_tecnica" && <TableCell className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></TableCell>}
                    {visita.categoria === "pos_venda" && <TableCell className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></TableCell>}
                    <TableCell sx={{ width: 30 }} align="center" scope="row">
                      {visita.dia.substring(8, 10)}
                    </TableCell>
                    <TableCell align="center">{type === 'antes' && visitRef.id === visita.id ? visitRef.chegadaCliente : visita.saidaEmpresa}</TableCell>
                    <TableCell align="center">{type === 'depois' && visitRef.id === visita.id ? visitRef.saidaDoCliente : visita.chegadaEmpresa}</TableCell>
                    <TableCell align="center">{visita.tecnico}</TableCell>
                    {visita.categoria !== "lunch" && 
                      <TableCell align="center">{visita.cidade && visita.cidade}</TableCell>
                    }
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
            {/* <List
            sx={{
              width: '90%',
              maxWidth: 500,            
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'auto',
              maxHeight: 200,
              '& ul': { padding: 0 },
            }}>
              {visits.map((visita, index) => (
                <ListItem className="list-visit" sx={{ borderLeft: `10px solid ${visita.cor}` }} key={index}>
                  <p><b>{visita.dia.substring(8,10)}</b></p>
                  <p className="saida">{visita.saidaEmpresa}</p>
                  <p className="chegada">{visita.chegadaEmpresa}</p>
                  {visita.categoria !== 'lunch' && 
                    <p className="tecnico">{visita.tecnico}</p>
                  }
                  <p className="cidade">{visita.cidade ? visita.cidade : 'ALMOÇO'}</p>
                </ListItem>
              ))}
             </List> */}
             </>:
             <div style={{ display: 'none!important' }} className="visit-aviso">
              <h1>Nenhuma Visita Encontrada</h1>
             </div>
             }
              <div className={visitsFindCount < 0 || visitsFindCount > 0 ? "box-visit__info prev error-aviso" : "box-visit__info prev check"}>
              <span className="">Previsão de Visita {(visitsFindCount < 0 || visitsFindCount > 0) ?
               <div aria-label="Essa Visita ultrapassa o horário de uma Visita já existente. Verifique os horários disponiveis"
                data-cooltipz-dir="top" data-cooltipz-size="large" ><ErrorOutlineIcon  sx={{ fill: 'red' }} /></div>
              :
              <div aria-label="A Visita pode ser criada"
                data-cooltipz-dir="top" ><CheckIcon className="check-icon" /></div>
              }
              </span>
              <p className="notice">
                <ArrowCircleRightIcon className="saida" />Saindo às <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                <ArrowCircleLeftIcon className="saida" />Chegando às <b>{chegadaTexto}</b>
              </p>
            </div>
            <div className="box-visit__form">
            <label className="label">
                <p>Cliente *</p>
                <input
                  className="label__input"
                  placeholder="Digite a cidade"
                  {...register("cliente")}
                  required />
              </label><div className="label margin-top">
                  <p>Indicador *</p>
                  <select
                    value={consultoraTexto || ''}
                    className="label__select"
                    name="tec"
                    disabled
                    onChange={(e) => setConsultoraTexto(e.target.value)}>
                    {sellers &&
                      sellers.map((seller, index) => (
                        <option key={index} value={seller.nome}>{seller.nome}</option>
                      ))}
                  </select>
                </div>
                {/* {type !== 'lunch' && userRef && userRef.cargo !== 'Administrador' &&
                <label className="label">
                <p>Cliente *</p>
                <input
                  className="label__input"
                  placeholder="Digite a cidade"
                  {...register("cliente")}
                  required />
              </label>
                } */}
              {/* {userRef && userRef.cargo !== 'Administrador' &&
                  <label className="label">
                        <p>Consultora *</p>
                        <input
                          className="label__input"
                          type="text"
                          value={consultoraTexto || ''}
                          placeholder="Digite o nome do Cliente"
                          autoComplete="off"
                          disabled />
                      </label>
              } */}
            <div className="label margin-top">
            {type === "lunch" && <p>Responsável</p>}
            {type === "comercial" && <p>Motorista</p>}
            {(type === "comercial_tecnica" || type === "pos_venda") && <p>Técnico</p>}
              <div className="radio">
                {visitRef.categoria === "lunch" ? (
                  <select
                    value={visitRef.tecnico}
                    className="label__select"
                    name="tec"
                    disabled
                    //onChange={(e) => setTecnicoTexto(e.target.value)}
                  >
                        <option defaultValue={visitRef.tecnico}>
                          {visitRef.tecnico}
                        </option>  
                  </select>
                ) : (
                  <select
                    value={tecnicoTexto}
                    className="label__select"
                    name="tec"
                    onChange={(e) => setTecnicoTexto(e.target.value)}
                  >
                    {driver &&
                      driver.map((tec, index) => (
                        <option key={index} value={tec.nome}>
                          {tec.nome}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
            {visitRef.categoria !== "lunch" && 
            <label className="label">
            <p>Veículo *</p>
            {veiculo && tecnicoTexto !== 'Nenhum' ? 
          <input
            className="label__input"
            type="text"
            autoComplete="off"
            value={veiculo}
            disabled
          /> :
          <input
          className="label__input"
          type="text"
          autoComplete="off"
          onChange={(e) => setVeiculo (e.target.value)}
          // onChange={(e) => setTecRefUID({
          //   nome: 'Nenhum',
          //   uid: '000',
          //   veiculo: e.target.value
          // })}
          value={veiculo}
        />  }
          </label>}
            <label className="label">
              <p>Observação</p>
              <input
                className="label__input"
                type="text"
                placeholder="Digite uma observação"
                autoComplete="off"
                {...register("observacao")}
              />
            </label>
            </div>
          </div>
          <input className="box-visit__btn" type="submit" value="EDITAR" />
        </form>
      </div>
    </div>
  );
};

export default EditVisit;
