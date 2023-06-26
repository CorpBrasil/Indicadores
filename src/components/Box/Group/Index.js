import { updateDoc, addDoc } from "firebase/firestore";
import { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import axios from 'axios';
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from 'moment';
import 'moment/locale/pt-br';
import useAuth from "../../../hooks/useAuth";
import { usePlacesWidget } from "react-google-autocomplete";
import {
  DistanceMatrixService,
  GoogleMap,
  useLoadScript,
} from "@react-google-maps/api";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Company, KeyMaps, Users } from "../../../data/Data";

import '../style.scss';

const CreateVisitGroup = ({ returnSchedule, filterSchedule, tecs, sellers, userRef, visitRef, scheduleRef, scheduleVisitRef, schedule, monthNumber, type}) => {
  const { user } = useAuth();
  const chegadaFormatadaTec = useRef();
  const saidaFormatadaTec = useRef();
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [lat2, setLat2] = useState(0);
  const [lng2, setLng2] = useState(0);
  const [latRef, setLatRef] = useState(0);
  const [lngRef, setLngRef] = useState(0);
  const [tecRefUID, setTecRefUID] = useState(tecs.find((tec) => tec.nome === visitRef.tecnico) || {nome: 'Nenhum', uid: '000', veiculo: '001'}); // Procura os tecnicos que vem da pagina 'Schedule'
  const [sellerRef, setSellerRef] = useState(sellers[0]); // Procura os tecnicos que vem da pagina 'Schedule'
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [rotaTempo1, setRotaTempo1] = useState();
  const [rotaTempo2, setRotaTempo2] = useState();
  const [tempoTexto1, setTempoTexto1] = useState()
  const [tempoTexto2, setTempoTexto2] = useState()
  const [visitaNumero, setVisitaNumero] = useState(1800);
  const [saidaCliente, setSaidaCliente] = useState();
  const [horarioTexto, setHorarioTexto] = useState()
  const [saidaTexto, setSaidaTexto] = useState();
  const [chegadaTexto, setChegadaTexto] = useState();
  const [dataTexto, setDataTexto] = useState();
  const [tecnicoTexto, setTecnicoTexto] = useState();
  const [consultoraTexto, setConsultoraTexto] = useState(userRef.cargo === "Vendedor(a)" ? userRef.nome : sellers[0].nome);
  const [numberAddress, setNumberAddress] = useState(undefined);
  const [addressComplete, setAddressComplete] = useState(undefined);
  const [city, setCity] = useState();
  const [visits] = useState(schedule.filter((visit) => visit.data === moment(new Date(visitRef.dia)).format('YYYY-MM-DD')));
  const [hoursLimit, setHoursLimit] = useState(false);
  const [libraries] = useState(["places"]);

  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  console.log(visitRef);
  console.log(type);


  const { isLoaded } = useLoadScript({
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
      setCheck1(true); // Habilita o serviço de calculo de distancia do google
      //console.log(place);
    },
    options: {
      types: ["geocode"],
      componentRestrictions: { country: "br" },
      fields: ["formatted_address", "address_components", "geometry.location"],
    },
  });

  useLayoutEffect(() => {
    // faz a solicitação do servidor assíncrono e preenche o formulário
    setTimeout(() => {
      reset({
        consultora: userRef.nome,
      });
      setSaidaTexto(visitRef.saidaDoCliente);
      setChegadaTexto(visitRef.chegadaEmpresa);
      setDataTexto(moment(new Date(visitRef.dia)).format('YYYY-MM-DD'));
      setTecnicoTexto(visitRef.tecnico);
      setCity(visitRef.cidade);
      if(type === 'antes') {
        setLatRef(-23.109731);
        setLngRef(-47.715045);
        setLat2(visitRef.lat);
        setLng2(visitRef.lng);
      } else {
        
        if(visitRef.visitaAlmoco) {
          setHorarioTexto(moment(visitRef.chegadaEmpresa, "hh:mm").add(rotaTempo1, 'seconds').format('kk:mm'));
          setLatRef(-23.109731);
          setLngRef(-47.715045);
          setLat2(-23.109731);
          setLng2(-47.715045);
        } else {
          setHorarioTexto(moment(visitRef.saidaDoCliente, "hh:mm").add(rotaTempo1, 'seconds').format('kk:mm'));
          setLatRef(visitRef.lat);
          setLngRef(visitRef.lng);
          setLat2(-23.109731);
          setLng2(-47.715045);
        }
      }
      //setHorarioTexto(moment(visitRef.saidaDoCliente, "hh:mm").add(600, 'seconds').format('kk:mm'));
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitRef]);

  useEffect(() => {
    if(dataTexto) {
      filterSchedule(dataTexto, tecnicoTexto)
    } else {
      filterSchedule()
    }
    if(consultoraTexto) {
      setSellerRef(sellers.find((sel) => sel.nome === consultoraTexto)); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto, consultoraTexto]);

  useEffect(() => {

    if((type === 'antes' && visitaNumero) || (type === 'antes' && rotaTempo2)) {
      setHorarioTexto(moment(visitRef.chegadaCliente, "hh:mm").subtract(Number(visitaNumero) + rotaTempo2, 'seconds').format('kk:mm'));
      //setCheckRef(true);
    }
    if((type === 'depois' && visitaNumero) || (type === 'depois' && rotaTempo1)) {
      if(visitRef.visitaAlmoco) {
        setHorarioTexto(moment(visitRef.chegadaEmpresa, "hh:mm").add(rotaTempo1, 'seconds').format('kk:mm'));
      } else {
        setHorarioTexto(moment(visitRef.saidaDoCliente, "hh:mm").add(rotaTempo1, 'seconds').format('kk:mm'));
      }
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visitaNumero, rotaTempo1, city, rotaTempo2, schedule])

  useEffect(() => {
    moment.locale("pt-br");
    const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
    const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada
    if(type === 'antes') {
        saidaEmpresa.subtract(rotaTempo1, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa
        setSaidaTexto(saidaEmpresa.format("kk:mm"));
        chegadaCliente.add(Number(visitaNumero), "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        setSaidaCliente(chegadaCliente.format("kk:mm"));
        chegadaCliente.add(rotaTempo2, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        setChegadaTexto(chegadaCliente.format("kk:mm"));
    } 
    if(type === 'depois') {
        saidaEmpresa.subtract(rotaTempo1, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa
        setSaidaTexto(saidaEmpresa.format("kk:mm"));
        chegadaCliente.add(Number(visitaNumero), "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        setSaidaCliente(chegadaCliente.format("kk:mm"));
        chegadaCliente.add(rotaTempo2, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        setChegadaTexto(chegadaCliente.format("kk:mm"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horarioTexto, visitaNumero, chegadaTexto, saidaTexto, rotaTempo1, rotaTempo2, city, schedule]);

  const onSubmit = async (userData) => {

    try {
      let diaRef,
        saidaEmpresaRef,
        chegadaClienteRef,
        TempoVisita,
        SaidaClienteRef,
        SaidaClienteRef2,
        ChegadaEmpresaRef;
        //tempoRotaRef;
        const chegada = horarioTexto;
        moment.locale("pt-br");
        // console.log(moment.locale());
        const tempo = moment('00:00', "HH:mm");
        chegadaClienteRef = chegada;
  
        //const chegadaCliente = moment(chegada, "hh:mm"); //Horario de chegada
        const day = moment(dataTexto); // Pega o dia escolhido
  
        diaRef = day.format("YYYY MM DD");
  
        TempoVisita = tempo.add(visitaNumero, 'seconds').format('HH:mm');
  
        saidaEmpresaRef = saidaTexto;
  
        SaidaClienteRef = saidaCliente;
  
        //chegadaCliente.add(rotaTempo1, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        //chegadaCliente.add(rotaTempo1, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
        ChegadaEmpresaRef = chegadaTexto;
        //tempoRotaRef = rotaTempo1;

      const dataRef = schedule.filter(
        (dia) => dia.data === dataTexto && dia.chegadaEmpresa !== visitRef.chegadaEmpresa && dia.tecnicoUID === visitRef.tecnicoUID
      );
      const lunch = schedule.filter(
        (dia) =>
          dia.data === dataTexto &&
          dia.consultora === "Almoço Téc." &&
          dia.tecnico === tecnicoTexto
      );
      const saidaFormatada = moment(saidaEmpresaRef, "hh:mm");
      const chegadaFormatada = moment(ChegadaEmpresaRef, "hh:mm");

      const check = [];
      let visitsFind = [];

      //Almoço
      if (lunch.length < 1 || lunch === undefined) {
        if (
          chegadaFormatada > moment("10:59", "hh:mm") &&
          chegadaFormatada < moment("14:01", "hh:mm")
        ) {
          chegadaFormatadaTec.current = chegadaFormatada.add(1, "h");
          saidaFormatadaTec.current = null; // UseRef não recebe renderização. emtão o valor antigo fica associado ainda
          // console.log(chegadaFormatadaTec.current.format("kk:mm"));
        } else if (
          saidaFormatada > moment("10:59", "hh:mm") &&
          saidaFormatada < moment("14:01", "hh:mm")
        ) {
          saidaFormatadaTec.current = saidaFormatada.subtract(1, "h");
          chegadaFormatadaTec.current = null;
          // console.log(saidaFormatadaTec.current);
        }

        dataRef.map((ref) => {
          if (
            saidaFormatada <= moment(ref.saidaEmpresa, "hh:mm") &&
            chegadaFormatadaTec.current <= moment(ref.saidaEmpresa, "hh:mm")
          ) {
            check.push(ref);
          } else {
            if (saidaFormatada >= moment(ref.chegadaEmpresa, "hh:mm"))
              check.push(ref);
          }
          return dataRef;
        });
      } else {
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
      }
      
      const visitsFindCount = dataRef.length - check.length;
      // console.log(chegadaFormatadaTec.current, saidaFormatadaTec.current);
      // console.log(">>", check, dataRef);
      // console.log(lunch.length);
      // console.log(visitsFindCount);

      dataRef.map((a) => {
        //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
        if (check.includes(a) === false) {
          visitsFind.push(a);
        }
        return visitsFind;
      });
      // console.log(visitsFind);

      // console.log({
      //   dia: diaRef,
      //         saidaEmpresa: saidaEmpresaRef,
      //         chegadaCliente: chegadaClienteRef,
      //         visita: TempoVisita,
      //         visitaNumero: visitaNumero,
      //         saidaDoCliente: SaidaClienteRef,
      //         chegadaEmpresa: saidaCliente,
      //         saidaEmpresaRef: visitRef.saidaEmpresa,
      //         consultora: userData.consultora,
      //         tecnico: tecRefUID.nome,
      //         tecnicoUID: tecRefUID.uid,
      //         cidade: city,
      //         cliente: userData.cliente,
      //         observacao: userData.observacao,
      //         tempoRota: rotaTempo1,
      //         tempo: tempoTexto1,
      //         tempoRotaConjunta: rotaTempo2,
      //         tempoConjunta: tempoTexto2,
      //         lng: lng,
      //         lat: lat,
      //         data: dataTexto,
      //         uid: user.id,
      //         idRef: visitRef.id,
      //         group: 'antes',
      //         cor: userRef.cor,
      //         confirmar: false,
      // });

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
            Swal.fire({
        title: Company,
        html: `Você deseja criar uma <b>Visita Conjunta?</b>`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if(type === 'antes') { // Verifica se existe uma referencia de visita abaixo da visita a ser criada
            if(visitRef.consultora === "Almoço Téc.") {
              SaidaClienteRef2 = visitRef.saidaEmpresa;
            } else {
              await updateDoc(scheduleVisitRef, {
                saidaEmpresa: saidaCliente,
                tempoRotaConjunta: rotaTempo2,
                tempoConjunta: tempoTexto2,
                groupRef: 'antes',
                visitaConjunta: true,
                tipo: "Visita Conjunta"
               })
               SaidaClienteRef2 = SaidaClienteRef;
            }
            createVisitDay({
              dia: diaRef,
              saidaEmpresa: saidaEmpresaRef,
              chegadaCliente: chegadaClienteRef,
              visita: TempoVisita,
              visitaNumero: visitaNumero,
              saidaDoCliente: SaidaClienteRef,
              chegadaEmpresa: SaidaClienteRef2,
              chegadaEmpresaRef: visitRef.chegadaEmpresa,
              saidaEmpresaRef: visitRef.saidaEmpresa,
              consultora: consultoraTexto,
              uid: sellerRef.id,
              cor: sellerRef.cor,
              tecnico: tecRefUID.nome,
              tecnicoUID: tecRefUID.uid,
              veiculo: tecRefUID.veiculo,
              cidade: city,
              endereco: addressComplete,
              cliente: userData.cliente,
              observacao: userData.observacao,
              tempoRota: rotaTempo1,
              tempo: tempoTexto1,
              tempoRotaConjunta: rotaTempo2,
              tempoConjunta: tempoTexto2,
              lng: lng,
              lat: lat,
              data: dataTexto,
              idRef: visitRef.id,
              group: 'antes',
              confirmar: false,
              tipo: "Visita Conjunta"
            })
          } else {
            if(visitRef.consultora !== "Almoço Téc.") {
              await updateDoc(scheduleVisitRef, {
                chegadaEmpresa: saidaEmpresaRef,
                groupRef: 'depois',
                visitaConjunta: true,
                tipo: "Visita Conjunta"
               })
            } 
              //====================================== DEPOIS
              const visita = {
                dia: diaRef,
                saidaEmpresa: visitRef.tipo === "Almoço" ? visitRef.saidaDoCliente : saidaEmpresaRef,
                chegadaCliente: chegadaClienteRef,
                visita: TempoVisita,
                visitaNumero: visitaNumero,
                saidaDoCliente: SaidaClienteRef,
                chegadaEmpresa: ChegadaEmpresaRef,
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
                tempoRota: rotaTempo2,
                tempo: tempoTexto2,
                tempoRotaConjunta: rotaTempo1,
                tempoConjunta: tempoTexto1,
                lngRef: lng2,
                latRef: lat2,
                data: dataTexto,
                confirmar: false,
                group: 'depois',
                visitaConjunta: true,
                tipo: 'Visita Conjunta',
              };

              // const visitaConjunta = {
              //   dia: diaRef,
              //   saidaEmpresa: saidaEmpresaRef,
              //   chegadaCliente: chegadaClienteRef,
              //   visita: TempoVisita,
              //   visitaNumero: visitaNumero,
              //   saidaDoCliente: SaidaClienteRef,
              //   chegadaEmpresa: SaidaClienteRef,
              //   consultora: consultoraTexto,
              //   uid: sellerRef.id,
              //   cor: sellerRef.cor,
              //   tecnico: tecRefUID.nome,
              //   tecnicoUID: tecRefUID.uid,
              //   veiculo: tecRefUID.veiculo,
              //   groupRef: "depois",
              //   cidade: city,
              //   endereco: addressComplete,
              //   lat: lat,
              //   lng: lng,
              //   cliente: userData.cliente,
              //   observacao: userData.observacao,
              //   tempoRota: rotaTempo2,
              //   tempo: tempoTexto2,
              //   tempoRotaConjunta: rotaTempo1,
              //   tempoConjunta: tempoTexto1,
              //   lngRef: lng2,
              //   latRef: lat2,
              //   data: dataTexto,
              //   confirmar: false,
              //   visitaConjunta: true,
              //   group: 'depois',
              //   tipo: 'Visita Conjunta',
              // };
              if (chegadaFormatadaTec.current && lunch.length === 0) {               
                          createVisitDay({
                            dia: diaRef,
                            saidaEmpresa: saidaEmpresaRef,
                            chegadaCliente: chegadaClienteRef,
                            visita: TempoVisita,
                            visitaNumero: visitaNumero,
                            saidaDoCliente: SaidaClienteRef,
                            chegadaEmpresa: moment(ChegadaEmpresaRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                            consultora: userData.consultora,
                            group: "depois",
                            visitaAlmoco: true, // Para poder identificar que essa visita tem um almoço dentro dela
                            tecnico: tecRefUID.nome,
                            tecnicoUID: tecRefUID.uid,
                            cidade: city,
                            endereco: addressComplete,
                            veiculo: tecRefUID.veiculo,
                            lat: lat,
                            lng: lng,
                            lngRef: lng2,
                            latRef: lat2,
                            cliente: userData.cliente,
                            observacao: userData.observacao,
                            tempoRota: rotaTempo2,
                            tempo: tempoTexto2,
                            tempoRotaConjunta: rotaTempo1,
                            tempoConjunta: tempoTexto1,
                            data: dataTexto,
                            uid: user.id,
                            cor: userRef.cor,
                            confirmar: false,
                            visitaConjunta: true,
                            tipo: 'Visita Conjunta',
                          })
                        }  
              createVisitDay(visita)
          }
        }
      })
    }
    } catch (error) {
      // console.log(error)
    } 
    }

    const createVisitDay = async (data) => {
      let endereco;
      await addDoc(scheduleRef, data);
      Swal.fire({
       title: Company,
       html: `A visita em <b>${city}</b> foi criada com sucesso!`,
       icon: "success",
       showConfirmButton: true,
       showCloseButton: true,
       confirmButtonColor: "#F39200",
     })
     if(data.endereco.length < 3) {
      endereco = city;
     } else {
      endereco = data.endereco;
     }
     if(data.tecnico === "Lucas") {
      axios.post('https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/43469/qiwZHdtY6dK1/', {
        data: moment(data.data).format("DD.MM.YYYY"),
        nome: data.tecnico,
        cliente: data.cliente,
        endereco: endereco,
        saida: data.saidaEmpresa,
        marcado: data.chegadaCliente,
        chegada: data.chegadaEmpresa,
        tipo: data.tipo,
        consultora: data.consultora,
        telefone: "5515991907957",
        lat: data.lat,
        lng: data.lng,
        duracao: data.visita,
        saidaCliente: data.saidaDoCliente
      })
    }
    const date = new Date(data.data);
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
        confirmada: 'Não'
      })
     return returnSchedule();
   }

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

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        <h4>Criar Visita Conjunta</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
            <label className="label">
            <p data-cooltipz-size="fit"
                 aria-label={tempoTexto1 && tempoTexto2 && `Tempo da Rota: ${tempoTexto1} | Cidade: ${city} | N° ${numberAddress ? numberAddress + ' ✅' : '❌'}`}
                  className="notice cooltipz--top cooltipz--visible">Endereço *</p>
              <input
                className="label__input"
                placeholder="Digite a cidade"
                ref={ref}
              />
            </label>
            <label className="label">
              <p>Dia *</p>
              <input
                value={dataTexto || ''}
                className="label__input"
                type="date"
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                onChange={(e) => setDataTexto(e.target.value)}
                placeholder="Digite o dia"
                autoComplete="off"
                disabled
              /> 
            </label>
            <label className="label">
              <p>Hórario Marcado *</p>
              <input
                className="label__input time"
                type="time"
                value={horarioTexto || ''}
                placeholder="Digite o hórario marcado"
                min="07:00"
                max="18:00"
                onBlur={(e) => moment(e.target.value, 'hh:mm') < moment('07:00', 'hh:mm') || moment(e.target.value, 'hh:mm') > moment('18:00', 'hh:mm') ? setHoursLimit(true) : setHoursLimit(false)}
                onChange={(e) => setHorarioTexto(e.target.value)}
                disabled
              />
              {hoursLimit && <p className="notice red">Limite de hórario: 07:00 - 18:00</p>}
            </label>
            <label className="label">
              <p>Tempo de Visita *</p>
              <select
              value={visitaNumero || ''}
              className="label__select"
              name="tec"
              onChange={(e) => setVisitaNumero(e.target.value)}>
                  <option value={1800}>00:30</option>
                  <option value={3600}>01:00</option>
                  <option value={5400}>01:30</option>
                  <option value={7200}>02:00</option>
            </select>
            </label>
            {visits && visits.length > 0 ? 
            <List
            sx={{
              width: '90%',
              maxWidth: 500,
              margin: 'auto 1rem',
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'auto',
              maxHeight: 200,
              '& ul': { padding: 0 },
            }}>
              {visits.map((visita, index) => (
                <ListItem className="list-visit" sx={{ borderLeft: `10px solid ${visita.cor}` }} key={index}>
                  <p><b>{visita.dia.substring(8,10)}</b></p>
                  <p className="saida">{type === 'antes' && visitRef.id === visita.id ? visitRef.chegadaCliente : visita.saidaEmpresa}</p>
                  <p className="chegada">{type === 'depois' ? visitRef.saidaDoCliente  : visita.chegadaEmpresa}</p>
                  <p className="tecnico">{visita.tecnico}</p>
                  <p className="cidade">{visita.cidade ? visita.cidade : 'ALMOÇO'}</p>
                </ListItem>
              ))}
             </List>:
             <div className="visit-aviso">
              <h1>Nenhuma Visita Encontrada</h1>
             </div>
             }
             {chegadaTexto && horarioTexto && 
            <div className="box-visit__info prev">
              <span className="">Previsão de Visita</span>
              <p className="notice">
                Saindo: <b>{visitRef.tipo === "Almoço" ? visitRef.saidaDoCliente : saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando: <b>{chegadaTexto}</b>
              </p>
            </div>
          }
            <label className="label">
              <p>Cliente *</p>
              <input
                className="label__input"
                placeholder="Digite o nome do Cliente"
                {...register("cliente")}
                required
              />
            </label>
            {(user.email === Users[0].email || userRef.cargo === "Administrador") && 
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
        </div>}
        {userRef.cargo === 'Vendedor(a)' &&
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
        }
          <div className="label margin-top">
            <p>Técnico/Motorista *</p>
            <div className="radio">
            <select
              value={tecnicoTexto || ''}
              className="label__select"
              name="tec"
              onChange={(e) => setTecnicoTexto(e.target.value)}>
                {tecs &&
                tecs.map((tec, index) => (
                  <option key={index} value={tec.nome}>{tec.nome}</option>
                ))}
                <option value='Nenhum'>Nenhum</option>
            </select>
            </div>
          </div>
          <label className="label">
          <p>Veículo *</p>
          {tecnicoTexto !== 'Nenhum' ? 
          <input
            className="label__input"
            type="text"
            autoComplete="off"
            value={tecRefUID.veiculo || ''}
            disabled
          /> :
          <input
          className="label__input"
          type="text"
          autoComplete="off"
          onChange={(e) => setTecRefUID({
            nome: 'Nenhum',
            uid: '000',
            veiculo: e.target.value
          })}
          value={tecRefUID.veiculo || ''}
        />  }
        </label>
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
          <input className="box-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>

      {isLoaded && check1 === true ? (
        <GoogleMap zoom={10} center={{ lat: lat, lng: lng }}>
          <DistanceMatrixService
            options={{
              destinations: [{ lat: lat, lng: lng }],
              origins: [{ lng: lngRef, lat: latRef }],
              travelMode: "DRIVING",
              drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess'} // Pega o trafico no tempo de criação da visita
            }}
            callback={(response, status) => {
              if (status === "OK") {
                // console.log(response);
                if (
                  rotaTempo1 === undefined || rotaTempo1 !== response?.rows[0].elements[0].duration.value
                  ) {
                    setRotaTempo1(response?.rows[0].elements[0].duration.value);
                    setTempoTexto1(response?.rows[0].elements[0].duration.text);
                    // console.log(response?.rows[0].elements[0].duration.text)
                    setCheck2(true);
                    setCheck1(false);
                }
              }
            }}
          />
        </GoogleMap>
      ) : (
        <></>
      )}
      {isLoaded && check2 === true ? (
        <GoogleMap zoom={10} center={{ lat: lat, lng: lng }}>
          <DistanceMatrixService
            options={{
              destinations: [{ lat: lat, lng: lng }], // Boituva
              origins: [{ lng: lng2, lat: lat2 }], // Boituva
              travelMode: "DRIVING",
              drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess'}
            }}
            callback={(response, status) => {
              if (status === "OK") {
                // console.log(response);
                if (
                  rotaTempo2 === undefined || rotaTempo2 !== response?.rows[0].elements[0].duration.value
                  ) {
                      setRotaTempo2(response?.rows[0].elements[0].duration.value);
                      setTempoTexto2(response?.rows[0].elements[0].duration.text);
                      // console.log(response?.rows[0].elements[0].duration.value);
                      setCheck2(false);
                }
              }
            }}
          />
        </GoogleMap>
      ) : (
        <></>
      )}

    </div>
  )
}


export default CreateVisitGroup