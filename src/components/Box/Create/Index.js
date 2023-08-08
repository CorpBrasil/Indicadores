import { addDoc } from "firebase/firestore";
import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as moment from "moment";
import axios from 'axios';
import useAuth from "../../../hooks/useAuth";
import { usePlacesWidget } from "react-google-autocomplete";
import {
  DistanceMatrixService,
  GoogleMap,
  useLoadScript,
} from "@react-google-maps/api";
import "moment/locale/pt-br";
import { Company, KeyMaps } from "../../../data/Data";

// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import RestaurantIcon from '@mui/icons-material/Restaurant'; // Almoço
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
//import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import "../style.scss";

const CreateVisit = ({
  returnSchedule,
  filterSchedule,
  scheduleRef,
  tecs,
  sellers,
  userRef,
  schedule,
  monthNumber,
  type,
  createVisitGroupChoice,
  checkNet
}) => {
  const { user } = useAuth();
  // const chegadaFormatadaTec = useRef();
  // const saidaFormatadaTec = useRef();
  const [tecRefUID, setTecRefUID] = useState(tecs[0]); // Procura os tecnicos que vem da pagina 'Schedule'
  const [sellerRef, setSellerRef] = useState(sellers[0]); // Procura os tecnicos que vem da pagina 'Schedule'
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [check, setCheck] = useState(false);
  const [checkInput, setCheckInput] = useState(false);
  const [rotaTempo, setRotaTempo] = useState(undefined);
  const [tempoTexto, setTempoTexto] = useState(undefined);
  const [visitaNumero, setVisitaNumero] = useState(1800);
  const [saidaCliente, setSaidaCliente] = useState(undefined);
  const [horarioTexto, setHorarioTexto] = useState(null);
  const [saidaTexto, setSaidaTexto] = useState(undefined);
  const [chegadaTexto, setChegadaTexto] = useState(undefined);
  const [dataTexto, setDataTexto] = useState(undefined);
  const [tecnicoTexto, setTecnicoTexto] = useState('Nenhum');
  const [consultoraTexto, setConsultoraTexto] = useState(userRef.cargo === "Vendedor(a)" ? userRef.nome : sellers[0].nome);
  const [hoursLimit, setHoursLimit] = useState(false);
  const [city, setCity] = useState(undefined);
  const [numberAddress, setNumberAddress] = useState(undefined);
  const [addressComplete, setAddressComplete] = useState(undefined);
  const [visits, setVisits] = useState();
  const [typeVisit] = useState(type); // Escolhe o tipo de visita
  const [driver, setDriver] = useState(); // Para escolher o motorista/tecnico de acordo com o tipo de visita
  const [libraries] = useState(["places"]);
  const { register, handleSubmit } = useForm(); 
  const [visitsFindCount, setVisitsFindCount] = useState();
  const [visitsFind, setVisitsFind] = useState();
  
  // console.log(schedule)

  useEffect(() => {
    // if(dataTexto || driver) {
    //   filterSchedule(dataTexto, tecnicoTexto)
    // } else {
    //   filterSchedule(null)
    // }
    if(tecnicoTexto !== 'Nenhum') {
      setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto)); 
    }
    if(consultoraTexto) {
      setSellerRef(sellers.find((sel) => sel.nome === consultoraTexto)); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto, consultoraTexto]);

  useEffect(() => { // Seleciona a visita de acordo com o tipo escolhido
    const lunch = () => {
      if(type === 'lunch') {
        setCheckInput(true);
        setVisitaNumero(3600);
        //setTecnicoTexto(tecs[0].nome);
      }
      switch (type) {
        case 'lunch':
          setDriver(tecs.filter((ref) => ref.nome === userRef.nome))
          //setVisits(schedule.filter((ref) => ref.tecnico === "Bruna" || ref.tecnico === "Lia"))
          setTecnicoTexto(userRef.nome);
          //driverRef.current = 'Bruna';
          break
        case 'comercial':
          setDriver(tecs.filter((ref) => ref.nome === "Bruna" || ref.nome === "Lia"))
          //setVisits(schedule.filter((ref) => ref.tecnico === "Bruna" || ref.tecnico === "Lia"))
          setTecnicoTexto('Bruna');
          //driverRef.current = 'Bruna';
          break
        case 'comercial_tecnica':
          setDriver(tecs.filter((ref) => ref.nome === "Lucas" || ref.nome === "Luis"))
          //setVisits(schedule.filter((ref) => ref.tecnico === "Lucas"))
          setTecnicoTexto('Lucas');
          //driverRef.current = 'Lucas';
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
    lunch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // let visitsType = schedule.filter((visit) => visit.tecnico === "Lucas" && visit.tecnico === "Luis");
    let visitsData;
    let visitsType;
    switch (type) {
      case 'comercial':
        visitsData = schedule.filter((visit) => visit.data === dataTexto && (visit.tecnico !== "Lucas" && visit.tecnico !== "Luis"));
        visitsType = schedule.filter((visit) => visit.tecnico !== "Lucas" && visit.tecnico !== "Luis")
        break
      case 'lunch':
        visitsData = schedule.filter((visit) => visit.data === dataTexto);
        visitsType = schedule;
        break
      default:
        visitsData = schedule.filter((visit) => visit.data === dataTexto && (visit.tecnico === "Lucas" || visit.tecnico === "Luis" || visit.categoria === 'lunch'));
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

  useEffect(() => {
    // console.log(visitaNumero);
    if (horarioTexto && visitaNumero) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada

      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

      setSaidaTexto(saidaEmpresa.format("kk:mm"));

      chegadaCliente.add(visitaNumero, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      setSaidaCliente(chegadaCliente.format("kk:mm"));
      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      // console.log(chegadaCliente)
      setChegadaTexto(chegadaCliente.format("kk:mm"));
    }

    let saidaEmpresaRef, ChegadaEmpresaRef;
      moment.locale("pt-br");
      saidaEmpresaRef = saidaTexto;
      ChegadaEmpresaRef = chegadaTexto;

      const saidaFormatada = moment(saidaEmpresaRef, "hh:mm");
      const chegadaFormatada = moment(ChegadaEmpresaRef, "hh:mm");
      let check = [];
      let visitsFindData = [];


      const dataRef = schedule.filter(
        (dia) => dia.data === dataTexto && (dia.tecnico === tecnicoTexto || (type === 'lunch' && dia.consultora === tecnicoTexto))
      );

        // console.log(dataRef)


        dataRef.map((ref) => {
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

      dataRef.map((a) => {
        //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
        if (check.includes(a) === false) {
          visitsFindData.push(a);
        }
        return setVisitsFind(visitsFindData);
      });
      setVisitsFindCount(dataRef.length - check.length)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horarioTexto, visitaNumero, chegadaTexto, saidaTexto, rotaTempo, city]);

  let isLoaded;
  window.onload = { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: KeyMaps,
    libraries,
  });
  

  const { ref } = usePlacesWidget({
    apiKey: KeyMaps,
    onPlaceSelected: (place) => {
      const address = place.formatted_address;
      const cityRef = place.address_components.find(ref => ref.types[0] === 'administrative_area_level_2');
      if (place.address_components[0].types[0] === "street_number") {
        const numberRef = place.address_components.find(ref => ref.types[0] === "street_number");
        setNumberAddress(numberRef.long_name);
      } else {
        setNumberAddress(undefined);
      }
      setCity(cityRef.long_name);
      setAddressComplete(address.substring(0, address.length - 19));
      setLat(place.geometry?.location?.lat());
      setLng(place.geometry?.location?.lng());
      setCheck(true); // Habilita o serviço de calculo de distancia do google
    },
    options: {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "br" },
      fields: ["formatted_address", "address_components", "geometry.location"],
    },
  });

  const onSubmit = async (userData) => {
    try {
      // console.log(visitsFind);
      const lunch = schedule.filter(
        (dia) =>
          dia.data === dataTexto &&
          dia.categoria === "lunch" &&
          dia.tecnico === tecnicoTexto
      );

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
          confirmButtonColor: "#F39200",
        });
      } else {
        Swal.fire({
          title: Company,
          html: `Você deseja cadastrar uma nova <b>Visita?</b>`,
          icon: "question",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          if (result.isConfirmed) {
            // console.log(checkInput)
            if(checkInput === true && lunch.length === 0) {
              await addDoc(scheduleRef, {
                dia: moment(dataTexto).format("YYYY MM DD"),
                saidaEmpresa: horarioTexto,
                chegadaCliente: horarioTexto,
                visita: "01:00",
                visitaNumero: 3600,
                saidaDoCliente: saidaCliente,
                chegadaEmpresa: saidaCliente,
                consultora: tecRefUID.nome,
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                cidade: city,
                lat: lat, 
                lng: lng,
                tempoRota: '',
                tempo: '',
                cliente: '',
                observacao: userData.observacao,
                data: dataTexto,
                uid: user.id,
                cor: tecRefUID.cor,
                confirmar: false,
                tipo: "Almoço",
                categoria: type,
                corTec: tecRefUID.cor,
              });
              Swal.fire({
                title: Company,
                html: `O horário de almoço foi criado com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#F39200",
              }).then(() => {
                  return returnSchedule();
              })
            } else {
              const visita = {
                dia: moment(dataTexto).format("YYYY MM DD"),
                saidaEmpresa: saidaTexto,
                chegadaCliente: horarioTexto,
                visita: moment('00:00', "HH:mm").add(visitaNumero, 'seconds').format('HH:mm'),
                visitaNumero: visitaNumero,
                saidaDoCliente: saidaCliente,
                chegadaEmpresa: chegadaTexto,
                consultora: consultoraTexto,
                uid: sellerRef.id,
                cor: sellerRef.cor,
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                cidade: city,
                endereco: addressComplete,
                veiculo: tecRefUID.veiculo,
                lat: lat,
                lng: lng,
                cliente: userData.cliente,
                observacao: userData.observacao,
                tempoRota: rotaTempo,
                tempo: tempoTexto,
                data: dataTexto,
                confirmar: false,
                tipo: 'Visita',
                categoria: type,
                corTec: tecRefUID.cor,
              };
                  createVisitDay(visita)
            }
          } else return null
        });
      }
    } catch (error) {
    }
  };

  function getMonthlyWeekNumber(dt) {
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

  const createVisitDay = async (data) => {
    try {
      if(checkNet) {
        Swal.fire({
          title: 'Sem Conexão',
          icon: "error",
          html: `Não é possível Criar uma Visita <b>sem internet.</b> Verifique a sua conexão.`,
          confirmButtonText: "Fechar",
          showCloseButton: true,
          confirmButtonColor: "#d33"  
        })
      }
       else {
        await addDoc(scheduleRef, data);
        // console.log(data)
        const date = new Date(data.data);
        Swal.fire({
         title: Company,
         html: `A visita em <b>${city}</b> foi criada com sucesso!`,
         icon: "success",
         showConfirmButton: true,
         showCloseButton: true,
         confirmButtonColor: "#F39200",
       })
       if(data.categoria !== 'lunch') {
         axios.post('https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/45898/Z8sTf2Pi46I1/', {
           data: moment(data.data).format("DD.MM.YYYY"),
           nome: data.tecnico,
           cliente: data.cliente,
           endereco: data.endereco,
           saida: data.saidaEmpresa,
           marcado: data.chegadaCliente,
           chegada: data.chegadaEmpresa,
           tipo: data.tipo,
           consultora: data.consultora,
           telefone: "5515991832181",
           lat: data.lat,
           lng: data.lng,
           duracao: data.visita,
           saidaCliente: data.saidaDoCliente,
           categoria: data.categoria
         })
       }
       axios.post('https://hook.us1.make.com/tmfl4xr8g9tk9qoi9jdpo1d7istl8ksd', {
           data: moment(data.data).format("DD/MM/YYYY"),
           nome: data.tecnico,
           cliente: data.cliente,
           saida: data.saidaEmpresa,
           marcado: data.chegadaCliente,
           consultora: data.consultora,
           city: city,
           duracao: data.visita,
           saidaCliente: data.saidaDoCliente,
           semana: getMonthlyWeekNumber(date),
           mes: moment(data.data).format("M"),
           ende: data.endereco,
           confirmada: 'Não',
           categoria: data.categoria
         })
   
      return returnSchedule();
      }
    } catch (e) {
      console.error('SEM CONEXÃO', e)
    }
  }

  const verifyLunch = () => {
    const lunchDay = schedule.find((lunch) => lunch.data === dataTexto && lunch.categoria === "lunch" && lunch.tecnico === tecnicoTexto)
        if(lunchDay && type === 'lunch') {
          Swal.fire({
            title: Company,
            icon: "warning",
            html: `<b>${tecnicoTexto}</b>, já existe um horário de almoço criado por você nesse dia.<br/><br/>Não é possivel ter <b>2</b> almoço da mesma pessoa no mesmo dia.<br/><br/>` + 
            `Hórario: <b>${lunchDay.chegadaCliente} - ${lunchDay.saidaDoCliente}</b>`,
            confirmButtonText: "Fechar",
            showCloseButton: true,
            confirmButtonColor: "#d33"  
          }).then(() => { 
              setDataTexto('');
          })
        }
  }

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        {checkInput && <h4>Criar Almoço</h4>}
        {typeVisit === "comercial" && <h4>Criar Visita Comercial</h4>}
        {typeVisit === "comercial_tecnica" && <h4>Criar Visita Comercial + Técnica</h4>}
        {typeVisit === "pos_venda" && <h4>Criar Visita de Pós-Venda</h4>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
          <div className="box-visit__form">
          {!checkInput ?
                <label className="label">
                <p className="notice">Endereço* 
                <span data-cooltipz-size="medium"
                 aria-label={tempoTexto && `Tempo da Rota: ${tempoTexto} | Cidade: ${city} | N° ${numberAddress ? numberAddress + ' ✅' : '❌'}`}
                  className='cooltipz--top' ><InfoOutlinedIcon className={tempoTexto && 'check-icon' } /></span>
                </p>
                <input
                  className={tempoTexto ? 'label__input check-input' : 'label__input'}
                  placeholder="Digite a cidade"
                  ref={ref}
                  required
                />
              </label> : 
                <label className="label">
                  <p className="notice">Endereço* 
                <span data-cooltipz-size="medium"
                 aria-label={tempoTexto && `Cidade: ${city} ✅`}
                  className='cooltipz--top' ><InfoOutlinedIcon className={tempoTexto && 'check-icon' } /></span>
                </p>
                <input
                  className={tempoTexto ? 'label__input check-input' : 'label__input'}
                  placeholder="Digite a cidade"
                  ref={ref}
                  required
                />
              </label>
              }
            <label className="label">
              <p>Dia *</p>
              <input
                className="label__input"
                type="date"
                value={dataTexto || ''}
                onBlur={() => verifyLunch()}
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                onChange={(e) => setDataTexto(e.target.value)}
                placeholder="Digite o dia"
                autoComplete="off"
                required
              />
            </label>
            {type === 'comercial_tecnica' ? 
            <label className="label">
              <p>Hórario Marcado  *</p>
              <input
                className="label__input time"
                type="time"
                placeholder="Digite o hórario marcado"
                min="07:00"
                max="18:00"
                //value={horarioTexto || ''}
                onBlur={(e) => moment(e.target.value, 'hh:mm') < moment('07:00', 'hh:mm') || moment(e.target.value, 'hh:mm') > moment('18:00', 'hh:mm') ? setHoursLimit(true) : setHoursLimit(false)}
                onChange={(e) => setHorarioTexto(e.target.value)}
                required
              />
                {hoursLimit && <p className="notice red">Limite de hórario: 07:00 - 18:00</p>}
            </label>
             : 
              <label className="label">
              <p>Hórario Marcado  *</p>
              <input
                className="label__input time"
                type="time"
                placeholder="Digite o hórario marcado"
                //value={horarioTexto || ''}
                onChange={(e) => setHorarioTexto(e.target.value)}
                required />
              {hoursLimit && <p className="notice red">Limite de hórario: 07:00 - 18:00</p>}
            </label>
              }
              {type !== 'lunch' && 
            <label className="label">
              <p>Tempo de Visita *</p>
              {checkInput ? (
                <select
                  value={visitaNumero || ''}
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
                  value={visitaNumero || ''}
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
            {visits && visits.length > 0  ? 
            <><h2 className="title-visits">{dataTexto ? 'Visita(s) do Dia' : 'Visitas do Mês'}</h2>
            <TableContainer className="table-visits" component={Paper} sx={{ maxHeight: 240 }}>
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow className="table-visits_header">
                  <TableCell align="center"></TableCell>
                  <TableCell align="center" padding="none">Visita</TableCell>
                  {type !== 'lunch' && 
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
                {visits.map((visita) => (
                  <TableRow
                    hover
                    key={visita.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                    aria-label={visita.consultora}
                    data-cooltipz-dir="right"
                    sx={{ backgroundColor: `${visita.cor}`, color: '#fff', width: 30 }} 
                    align="center" component="th" scope="row">
                      {visita.consultora.substring(0, 1)}
                    </TableCell>
                    {visita.categoria === "lunch" && <TableCell style={{ filter: 'contrast' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></TableCell>}
                    {visita.categoria === "comercial" && <TableCell className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></TableCell>}
                    {visita.categoria === "comercial_tecnica" && <TableCell className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></TableCell>}
                    {visita.categoria === "pos_venda" && <TableCell className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></TableCell>}
                    {visita.categoria !== 'lunch' && visita.categoria !== 'pos_venda' && type !== 'lunch' &&
                    <TableCell sx={{ width: 30 }} className="btn-add"
                        aria-label="Criar Visita Conjunta"
                        data-cooltipz-dir="right"
                        onClick={() => createVisitGroupChoice({ visit: visita, type: type })}
                      ></TableCell>}
                    {visita.categoria === 'pos_venda' && userRef && userRef.nome === 'Pós-Venda' && type !== 'lunch' &&
                    <TableCell sx={{ width: 30 }} className="btn-add"
                        aria-label="Criar Visita Conjunta"
                        data-cooltipz-dir="right"
                        onClick={() => createVisitGroupChoice({ visit: visita, type: type })}
                      ></TableCell>}
                    {(visita.categoria === 'lunch' || visita.categoria === 'pos_venda') &&
                     userRef && visita.confirmar && (userRef.cargo === 'Vendedor(a)' || userRef.cargo === 'Administrador') &&
                    <TableCell className="btn-add disabled"
                    ></TableCell>
                    }
                    {(type !== 'lunch' && (visita.categoria === 'lunch' || visita.categoria === 'pos_venda')) &&
                    <TableCell
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
                    <p><b>{visita.dia.substring(8, 10)}</b></p>
                    {visita.categoria === "lunch" && <div style={{ filter: 'contrast', padding: '0.2rem' }} className="type-icon lunch" aria-label="Almoço" data-cooltipz-dir="right"><RestaurantIcon /></div>}
                    {visita.categoria === "comercial" && <div style={{ padding: '0.2rem' }} className="type-icon comercial" aria-label="Visita Comercial" data-cooltipz-dir="right"><RequestQuoteIcon /></div>}
                    {visita.categoria === "comercial_tecnica" && <div style={{ padding: '0.2rem' }} className="type-icon comercial_tec" aria-label="Comercial + Técnica" data-cooltipz-dir="right"><PeopleIcon /></div>}
                    {visita.categoria === "pos_venda" && <div style={{ padding: '0.2rem' }} className="type-icon pos_venda" aria-label="Pós-Venda" data-cooltipz-dir="right"><EngineeringIcon /></div>}
                    {visita.categoria !== 'lunch' && visita.categoria !== 'pos_venda' && type !== 'lunch' &&
                    <div className="btn-add"
                        aria-label="Criar Visita Conjunta"
                        data-cooltipz-dir="right"
                        onClick={() => createVisitGroupChoice({ visit: visita, type: type })}
                      ></div>}
                    {visita.categoria === 'pos_venda' && userRef && userRef.nome === 'Pós-Venda' && type !== 'lunch' && <div className="btn-add"
                        aria-label="Criar Visita Conjunta"
                        data-cooltipz-dir="right"
                        onClick={() => createVisitGroupChoice({ visit: visita, type: type })}
                      ></div>}
                      <p className="saida">{visita.saidaEmpresa}</p>
                      <p className="chegada">{visita.chegadaEmpresa}</p>
                    {visita.categoria !== 'lunch' &&
                      <p className="tecnico">{visita.tecnico}</p>}
                      <p className="cidade">{visita.cidade ? visita.cidade : 'ALMOÇO'}</p>
                  </ListItem>
                ))}
              </List> */}
              </>:
             <div style={{ display: 'none!important' }} className="visit-aviso">
              <h1>Nenhuma Visita Encontrada</h1>
             </div>
             }
             {type === "lunch" ? 
             (visitaNumero && horarioTexto ? 
               <div className={visitsFindCount < 0 || visitsFindCount > 0 ? "box-visit__info prev error-aviso" : "box-visit__info prev check"}>
               <span className="">Previsão de Visita {(visitsFindCount < 0 || visitsFindCount > 0) &&
               <div aria-label="Essa Visita ultrapassa o horário de uma Visita já existente. Verifique os horários disponiveis."
                data-cooltipz-dir="top" data-cooltipz-size="large" ><ErrorOutlineIcon  sx={{ fill: 'red' }} /></div>}</span>
               <p className="notice">
               <ArrowCircleRightIcon className="saida" />Saindo às <b>{horarioTexto}</b>
               </p>
               <p className="notice">
               <ArrowCircleLeftIcon className="saida" />Chegando às <b>{saidaCliente}</b>
               </p>
             </div> :
               <div className="visit-aviso">
               <h2>Preencha o Horário Marcado para visualizar a Previsão de Horário</h2>
              </div>
             ) : 
             (city && visitaNumero && horarioTexto ? 
              <div className={visitsFindCount < 0 || visitsFindCount > 0 ? "box-visit__info prev error-aviso" : "box-visit__info prev check"}>
              <span className="">Previsão de Visita {(visitsFindCount < 0 || visitsFindCount > 0) &&
               <div aria-label="Essa Visita ultrapassa o horário de uma Visita já existente. Verifique os horários disponiveis."
                data-cooltipz-dir="top" data-cooltipz-size="large" ><ErrorOutlineIcon  sx={{ fill: 'red' }} /></div>}</span>
              <p className="notice">
              <ArrowCircleRightIcon className="saida" />Saindo às <b>{saidaTexto}</b>
              </p>
              <p className="notice">
              <ArrowCircleLeftIcon className="saida" />Chegando às <b>{chegadaTexto}</b>
              </p>
            </div> :
              <div className="visit-aviso">
              <h2>Preencha o Endereço e Horário Marcado para visualizar a Previsão de Horário</h2>
             </div>
             )}
            <div className="box-visit__form">
              {!checkInput && 
              <label className="label">
              <p>Cliente *</p>
              <input
                className="label__input"
                type="text"
                placeholder="Digite o nome do Cliente"
                autoComplete="off"
                {...register("cliente")}
                required
              />
            </label>
              }
          {(userRef.cargo === "Administrador" && type !== "lunch" && type !== 'pos_venda') ?
          <div className="label margin-top">
          <p>Consultora *</p>
          <select
            value={consultoraTexto || ''}
            className="label__select"
            name="tec"
            onChange={(e) => setConsultoraTexto(e.target.value)}>
              {sellers &&
              sellers.map((seller, index) => (
                <option key={index} value={seller.nome}>{seller.nome}</option>
              ))}
          </select>
        </div> : <></>}
        {/* {userRef.cargo === 'Vendedor(a)' && type !== "lunch" &&
          <label className="label">
          <p>Consultora *</p>
          <input
            className="label__input"
            type="text"
            value={consultoraTexto || ''}
            placeholder="Digite o nome do Cliente"
            autoComplete="off"
            disabled
          />
        </label> 
        } */}
          <div className="label margin-top">
          {checkInput && <p>Responsável</p>}
          {typeVisit === "comercial" && <p>Motorista</p>}
          {(typeVisit === "comercial_tecnica" || typeVisit === "pos_venda") && <p>Técnico</p>}
           {typeVisit === 'lunch' ? 
           <select
           value={tecnicoTexto || ''}
           className="label__select"
           name="tec"
           disabled
           onBlur={() => verifyLunch()}
           onChange={(e) => setTecnicoTexto(e.target.value)}>
             {driver &&
             driver.map((tec, index) => (
               <option key={index} value={tec.nome}>{tec.nome}</option>
             ))}
         </select> : 
         <select
         value={tecnicoTexto || ''}
         className="label__select"
         name="tec"
         onBlur={() => verifyLunch()}
         onChange={(e) => setTecnicoTexto(e.target.value)}>
           {driver &&
           driver.map((tec, index) => (
             <option key={index} value={tec.nome}>{tec.nome}</option>
           ))}
       </select>
          } 
          </div>
          {!checkInput && 
          <label className="label">
            <p>Veículo *</p>
          <input
            className="label__input"
            type="text"
            autoComplete="off"
            value={tecRefUID.veiculo || ''}
            disabled
          />
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
          <input className="box-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>

      {isLoaded && check === true ? (
        <GoogleMap zoom={10} center={{lat: -23.109731, lng: -47.715045}}>
          <DistanceMatrixService
            options={{
              destinations: [{ lat: lat, lng: lng }],
              origins: [{ lng: -47.715045, lat: -23.109731}],
              travelMode: "DRIVING",
              drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess'}, // Pega o trafico no tempo de criação da visita
            }}
            callback={(response, status) => {
              if (status === "OK") {
                // console.log(response);
                if (
                  rotaTempo === undefined || rotaTempo !== response?.rows[0].elements[0].duration.value
                  ) {
                  setRotaTempo(response?.rows[0].elements[0].duration.value);
                  setTempoTexto(response?.rows[0].elements[0].duration.text);
                  setCheck(false);
                }
              }
            }}
          />
        </GoogleMap>
      ) : (
        <></>
      )}
    </div>
  );
};

export default memo(CreateVisit);
