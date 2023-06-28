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
import { Company, KeyMaps, Users } from "../../../data/Data";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
//import ListItemText from '@mui/material/ListItemText';

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
  createVisitGroupChoice
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
  const [tecnicoTexto, setTecnicoTexto] = useState(tecs[0].nome);
  const [consultoraTexto, setConsultoraTexto] = useState(userRef.cargo === "Vendedor(a)" ? userRef.nome : sellers[0].nome);
  const [hoursLimit, setHoursLimit] = useState(false);
  const [city, setCity] = useState(undefined);
  const [numberAddress, setNumberAddress] = useState(undefined);
  const [addressComplete, setAddressComplete] = useState(undefined);
  const [visits, setVisits] = useState(schedule);
  const [libraries] = useState(["places"]);
  const { register, handleSubmit } = useForm(); 
  
  useEffect(() => {
    if(dataTexto) {
      filterSchedule(dataTexto, tecnicoTexto)
    } else {
      filterSchedule(null)
    }
    if(tecnicoTexto !== 'Nenhum') {
      setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto)); 
    }
    if(consultoraTexto) {
      setSellerRef(sellers.find((sel) => sel.nome === consultoraTexto)); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto, consultoraTexto]);

  useEffect(() => {
    const lunch = () => {
      if(type) {
        setCheckInput(true);
        setVisitaNumero(3600);
      }
      // console.log(consultora)
    };
    lunch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(dataTexto) {
      const visitsData = schedule.filter((visit) => visit.data === dataTexto);
      if (visitsData && dataTexto.substring(8,10) !== "00") {
        setVisits(visitsData);
      }
    } else {
      setVisits(schedule);
    }
  },[dataTexto, schedule])

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
  }, [horarioTexto, visitaNumero, chegadaTexto, saidaTexto, rotaTempo]);

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
      let diaRef,
      saidaEmpresaRef,
      chegadaClienteRef,
      TempoVisita,
      SaidaClienteRef,
      ChegadaEmpresaRef,
      tempoRotaRef;

      const chegada = horarioTexto;
      moment.locale("pt-br");
      const tempo = moment('00:00', "HH:mm");
      chegadaClienteRef = chegada;

      const chegadaCliente = moment(chegada, "hh:mm"); //Horario de chegada
      const day = moment(dataTexto); // Pega o dia escolhido

      diaRef = day.format("YYYY MM DD");

      TempoVisita = tempo.add(visitaNumero, 'seconds').format('HH:mm');

      saidaEmpresaRef = saidaTexto;

      SaidaClienteRef = saidaCliente;

      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      ChegadaEmpresaRef = chegadaTexto;
      tempoRotaRef = rotaTempo;

      // console.log({
      //   dia: diaRef,
      //   saidaEmpresa: saidaEmpresaRef,
      //   chegadaCliente: chegadaClienteRef,
      //   visita: TempoVisita,
      //   saidaDoCliente: SaidaClienteRef,
      //   chegadaEmpresa: ChegadaEmpresaRef,
      //   consultora: userData.consultora,
      //   tecnico: tecnicoTexto,
      //   cidade: city,
      // });

      const dataRef = schedule.filter(
        (dia) => dia.data === dataTexto && dia.tecnico === tecnicoTexto
      );
      const lunch = schedule.filter(
        (dia) =>
          dia.data === dataTexto &&
          dia.consultora === "Almoço Téc." &&
          dia.tecnico === tecnicoTexto
      );
      const saidaFormatada = moment(saidaEmpresaRef, "hh:mm");
      const chegadaFormatada = moment(SaidaClienteRef, "hh:mm");

      console.log(saidaFormatada);
      console.log(chegadaFormatada);
      let check = [];
      let visitsFind = [];

      // //Almoço
      // if ((lunch.length < 1 || lunch === undefined) && !checkInput) {
      //   if (
      //     chegadaFormatada > moment("10:59", "hh:mm") &&
      //     chegadaFormatada < moment("13:01", "hh:mm")
      //   ) {
      //     chegadaFormatadaTec.current = chegadaFormatada.add(1, "h");
      //     saidaFormatadaTec.current = null; // UseRef não recebe renderização. emtão o valor antigo fica associado ainda
      //     // console.log(chegadaFormatadaTec.current.format("kk:mm"));
      //   } else if (
      //     saidaFormatada > moment("11:59", "hh:mm") &&
      //     saidaFormatada < moment("14:01", "hh:mm")
      //   ) {
      //     saidaFormatadaTec.current = saidaFormatada.subtract(1, "h");
      //     chegadaFormatadaTec.current = null;
      //     // console.log(saidaFormatadaTec.current);
      //   }

      //   dataRef.map((ref) => {
      //     if (
      //       saidaFormatada <= moment(ref.saidaEmpresa, "hh:mm") &&
      //       chegadaFormatadaTec.current <= moment(ref.saidaEmpresa, "hh:mm")
      //     ) {
      //       check.push(ref);
      //     } else {
      //       if (saidaFormatada >= moment(ref.chegadaEmpresa, "hh:mm"))
      //         check.push(ref);
      //     }
      //     return dataRef;
      //   });
      // } else {
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

      const visitsFindCount = dataRef.length - check.length;
      //console.log(visitsFindCount);

      dataRef.map((a) => {
        //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
        if (check.includes(a) === false) {
          visitsFind.push(a);
        }
        return visitsFind;
      });
      //console.log(visitsFind);
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
                dia: diaRef,
                saidaEmpresa: chegadaClienteRef,
                chegadaCliente: chegadaClienteRef,
                visita: "01:00",
                visitaNumero: 3600,
                saidaDoCliente: SaidaClienteRef,
                chegadaEmpresa: SaidaClienteRef,
                consultora: "Almoço Téc.",
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                cidade: '',
                lat: -23.109731, 
                lng: -47.715045,
                tempoRota: '',
                tempo: '',
                cliente: '',
                observacao: userData.observacao,
                data: dataTexto,
                uid: user.id,
                cor: "#111111",
                confirmar: false,
                tipo: "Almoço"
              });
              Swal.fire({
                title: Company,
                html: `O horário de almoço do Técnico <b>${tecRefUID.nome}</b> foi criado com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#F39200",
              }).then(() => {
                  return returnSchedule();
              })
            } else {
              const visita = {
                dia: diaRef,
                saidaEmpresa: saidaEmpresaRef,
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
                tempoRota: tempoRotaRef,
                tempo: tempoTexto,
                data: dataTexto,
                confirmar: false,
                tipo: 'Visita',
              };
                  createVisitDay(visita)
            }
          } else return null
        });
      }
    } catch (error) {
    }
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

  const createVisitDay = async (data) => {
     await addDoc(scheduleRef, data);
     console.log(data)
     const date = new Date(data.data);
     Swal.fire({
      title: Company,
      html: `A visita em <b>${city}</b> foi criada com sucesso!`,
      icon: "success",
      showConfirmButton: true,
      showCloseButton: true,
      confirmButtonColor: "#F39200",
    })
    if(data.tecnico === "Lucas") {
      axios.post('https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/43469/qiwZHdtY6dK1/', {
        data: moment(data.data).format("DD.MM.YYYY"),
        nome: data.tecnico,
        cliente: data.cliente,
        endereco: data.endereco,
        saida: data.saidaEmpresa,
        marcado: data.chegadaCliente,
        chegada: data.chegadaEmpresa,
        tipo: data.tipo,
        consultora: data.consultora,
        telefone: "5515991907957",
        lat: data.lat,
        lng: data.lng,
        duracao: data.visita,
        saidaCliente: data.saidaDoCliente,
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
        confirmada: 'Não'
      })

    return returnSchedule();
  }

  const verifyLunch = () => {

    const lunchDay = schedule.find((lunch) => lunch.data === dataTexto && lunch.tipo === "Almoço" && lunch.tecnico === tecnicoTexto)
        if(lunchDay && type) {
          Swal.fire({
            title: Company,
            icon: "warning",
            html: `Já existe um horário de almoço do técnico <b>${tecnicoTexto}</b> criado nesse dia.<br/><br/>` + 
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
        {checkInput ? <h4>Criar Almoço</h4> : <h4>Criar Visita</h4>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
          {!checkInput &&
                <label className="label">
                <p data-cooltipz-size="fit"
                 aria-label={tempoTexto && `Tempo da Rota: ${tempoTexto} | Cidade: ${city} | N° ${numberAddress ? numberAddress + ' ✅' : '❌'}`}
                  className="notice cooltipz--top cooltipz--visible">Endereço *</p>
                <input
                  className="label__input"
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
            {visits && visits.length > 0 ? 
            <List
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
                  <div className="btn-add"
                  aria-label="Criar Visita Conjunta"
                  data-cooltipz-dir="right"
                   onClick={() => createVisitGroupChoice(visita)}
                  ></div>
                  <p className="saida">{visita.saidaEmpresa}</p>
                  <p className="chegada">{visita.chegadaEmpresa}</p>
                  <p className="tecnico">{visita.tecnico}</p>
                  <p className="cidade">{visita.cidade ? visita.cidade : 'ALMOÇO'}</p>
                </ListItem>
              ))}
             </List>:
             <div style={{ display: 'none!impoortant' }} className="visit-aviso">
              <h1>Nenhuma Visita Encontrada</h1>
             </div>
             }
              <div className="box-visit__info prev">
              <span className="">Previsão de Visita</span>
              <p className="notice">
                Saindo da Empresa: <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando na Empresa: <b>{chegadaTexto}</b>
              </p>
            </div>
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
            {(user.email === Users[0].email && !type) || (userRef.cargo === "Administrador" && !type) ?
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
        {userRef.cargo === 'Vendedor(a)' && !type &&
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
            <select
              value={tecnicoTexto || ''}
              className="label__select"
              name="tec"
              onBlur={() => verifyLunch()}
              onChange={(e) => setTecnicoTexto(e.target.value)}>
                {tecs &&
                tecs.map((tec, index) => (
                  <option key={index} value={tec.nome}>{tec.nome}</option>
                ))}
                <option value='Nenhum'>Nenhum</option>
            </select>
          </div>
          {!checkInput && 
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
