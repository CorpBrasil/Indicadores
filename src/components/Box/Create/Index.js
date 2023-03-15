import { addDoc } from "firebase/firestore";
import { memo, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from "moment";
import "moment/locale/pt-br";

import useAuth from "../../../hooks/useAuth";

import { usePlacesWidget } from "react-google-autocomplete";
import {
  DistanceMatrixService,
  GoogleMap,
  useLoadScript,
} from "@react-google-maps/api";

import "../style.scss";

const CreateVisit = ({
  returnSchedule,
  filterSchedule,
  scheduleRef,
  membersRef,
  tecs,
  userRef,
  schedule,
  monthNumber,
  type
}) => {
  const { user } = useAuth();
  const chegadaFormatadaTec = useRef();
  const saidaFormatadaTec = useRef();
  const [tecRefUID, setTecRefUID] = useState(tecs[0]); // Procura os tecnicos que vem da pagina 'Schedule'
  let consultora;
  if(type) {
     consultora = 'Almoço Téc.';
  } else {
     consultora = user.name;
  }
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [check, setCheck] = useState(false);
  const [checkInput, setCheckInput] = useState(false);
  const [rotaTempo, setRotaTempo] = useState(undefined);
  const [tempoTexto, setTempoTexto] = useState(undefined);
  const [visitaNumero, setVisitaNumero] = useState(1800);
  const [saidaCliente, setSaidaCliente] = useState();
  const [horarioTexto, setHorarioTexto] = useState(undefined);
  const [saidaTexto, setSaidaTexto] = useState(undefined);
  const [chegadaTexto, setChegadaTexto] = useState(undefined);
  const [dataTexto, setDataTexto] = useState(undefined);
  const [tecnicoTexto, setTecnicoTexto] = useState(tecs[0].nome);
  const [hoursLimit, setHoursLimit] = useState(false);

  const [city, setCity] = useState();
  const [libraries] = useState(["places"]);
  //const [tecs, setTecs] = useState();
  //const [dayVisits, setDayVisits] = useState();

  const { register, handleSubmit } = useForm();
  
  useEffect(() => {
    if(dataTexto) {
      filterSchedule(dataTexto, tecnicoTexto)
    } else {
      filterSchedule()
    }
    if(tecnicoTexto) {
      setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto)); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto]);

  useEffect(() => {
    const lunch = () => {
      if(type) {
        setCheckInput(true);
        setVisitaNumero(3600);
      }
      console.log(consultora)
    };

    lunch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(tecRefUID)

  // useEffect(() => {
  //   if(dataTexto) {
  //     setDayVisits(dayVisits.sort(function(a, b) {
  //       if(a.saidaEmpresa < b.saidaEmpresa) return -1;
  //       if(a.saidaEmpresa > b.saidaEmpresa) return 1;
  //       return 0;
  //     }))
  //     console.log('oi')
  //   }
  // },[dayVisits, dataTexto])

  useEffect(() => {
    console.log(visitaNumero);
    if (horarioTexto && visitaNumero) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada

      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

      setSaidaTexto(saidaEmpresa.format("kk:mm"));

      chegadaCliente.add(visitaNumero, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      setSaidaCliente(chegadaCliente.format("kk:mm"));
      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      console.log(chegadaCliente)
      setChegadaTexto(chegadaCliente.format("kk:mm"));
    }
  }, [horarioTexto, visitaNumero, chegadaTexto, saidaTexto, rotaTempo]);

  let isLoaded;
  window.onload = { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyD1WsJJhTpdhTIVLxxXCgdlV8iYfmOeiC4",
    libraries,
  });
  

  const { ref } = usePlacesWidget({
    apiKey: "AIzaSyD1WsJJhTpdhTIVLxxXCgdlV8iYfmOeiC4",
    onPlaceSelected: (place) => {
      setCity(place.address_components[0].long_name);
      setLat(place.geometry?.location?.lat());
      setLng(place.geometry?.location?.lng());
      setCheck(true); // Habilita o serviço de calculo de distancia do google
      //console.log(place);
    },
    options: {
      types: ["(regions)"],
      componentRestrictions: { country: "br" },
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
      console.log(userData);
      console.log(moment.locale());
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

      console.log({
        dia: diaRef,
        saidaEmpresa: saidaEmpresaRef,
        chegadaCliente: chegadaClienteRef,
        visita: TempoVisita,
        saidaDoCliente: SaidaClienteRef,
        chegadaEmpresa: ChegadaEmpresaRef,
        consultora: userData.consultora,
        tecnico: tecnicoTexto,
        cidade: city,
      });

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

      //Almoço
      if ((lunch.length < 1 || lunch === undefined) && !checkInput) {
        if (
          chegadaFormatada > moment("10:59", "hh:mm") &&
          chegadaFormatada < moment("13:01", "hh:mm")
        ) {
          chegadaFormatadaTec.current = chegadaFormatada.add(1, "h");
          saidaFormatadaTec.current = null; // UseRef não recebe renderização. emtão o valor antigo fica associado ainda
          console.log(chegadaFormatadaTec.current.format("kk:mm"));
        } else if (
          saidaFormatada > moment("11:59", "hh:mm") &&
          saidaFormatada < moment("14:01", "hh:mm")
        ) {
          saidaFormatadaTec.current = saidaFormatada.subtract(1, "h");
          chegadaFormatadaTec.current = null;
          console.log(saidaFormatadaTec.current);
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
          console.log("eae");
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

      console.log(chegadaFormatadaTec.current, saidaFormatadaTec.current);

      // dataRef.map((ref) => {
      //   console.log('eae')
      //   if(saidaFormatada < moment(ref.saidaEmpresa, 'hh:mm') && chegadaFormatada < moment(ref.saidaEmpresa, 'hh:mm')) {
      //       check.push(ref);
      //     } else {
      //       if(saidaFormatada > moment(ref.chegadaEmpresa, 'hh:mm'))
      //       check.push(ref);
      //     }
      //     return dataRef;
      //   })

      console.log(">>", check, dataRef);
      console.log(lunch.length);
      const visitsFindCount = dataRef.length - check.length;
      console.log(visitsFindCount);

      dataRef.map((a) => {
        //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
        if (check.includes(a) === false) {
          visitsFind.push(a);
        }
        return visitsFind;
      });
      console.log(visitsFind);
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
          title: "Infinit Energy Brasil",
          html:
            `Foram encontrado(s) <b>${visitsFindCount}</b> visita(s) marcada(s) nesse periodo.</br></br>` +
            visits,
          icon: "error",
          showConfirmButton: true,
          confirmButtonColor: "#F39200",
        });
      } else {
        Swal.fire({
          title: "Infinit Energy Brasil",
          html: `Você deseja cadastrar uma nova <b>Visita?</b>`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          if (result.isConfirmed) {
            console.log(checkInput)
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
                lat: -23.0881786,
                lng: -47.6973284,
                tempoRota: '',
                tempo: '',
                cliente: '',
                observacao: '',
                data: dataTexto,
                uid: user.id,
                cor: "#111111",
                confirmar: false,
                tipo: "Almoço"
              });
              Swal.fire({
                title: "Infinit Energy Brasil",
                html: `O horário de almoço do Técnico <b>${tecRefUID.nome}</b> foi criado com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                confirmButtonColor: "#F39200",
              }).then((result) => {
                if(result.isConfirmed) {
                  return returnSchedule();
                }
              })
            } else {
              let almoco, chegadaEmpresaVisita, saidaAlmoco;
              const visita = {
                dia: diaRef,
                saidaEmpresa: saidaEmpresaRef,
                chegadaCliente: chegadaClienteRef,
                visita: TempoVisita,
                visitaNumero: visitaNumero,
                saidaDoCliente: SaidaClienteRef,
                chegadaEmpresa: ChegadaEmpresaRef,
                consultora: userData.consultora,
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                cidade: city,
                veiculo: tecRefUID.veiculo,
                lat: lat,
                lng: lng,
                cliente: userData.cliente,
                observacao: userData.observacao,
                tempoRota: tempoRotaRef,
                tempo: tempoTexto,
                data: dataTexto,
                uid: user.id,
                cor: userRef.cor,
                confirmar: false,
                tipo: 'Visita',
              };

              const visitaConjunta = {
                dia: diaRef,
                saidaEmpresa: saidaEmpresaRef,
                chegadaCliente: chegadaClienteRef,
                visita: TempoVisita,
                visitaNumero: visitaNumero,
                saidaDoCliente: SaidaClienteRef,
                chegadaEmpresa: SaidaClienteRef,
                consultora: userData.consultora,
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                veiculo: tecRefUID.veiculo,
                groupRef: "depois",
                cidade: city,
                lat: lat,
                lng: lng,
                cliente: userData.cliente,
                observacao: userData.observacao,
                tempoRota: tempoRotaRef,
                tempo: tempoTexto,
                tempoRotaConjunta: tempoRotaRef,
                tempoConjunta: tempoTexto,
                data: dataTexto,
                uid: user.id,
                cor: userRef.cor,
                confirmar: false,
                visitaConjunta: true,
                tipo: 'Visita Conjunta',
              };

              if (chegadaFormatadaTec.current && lunch.length === 0) {               
                if(city !== 'Tietê') {
                  Swal.fire({
                    title: "Infinit Energy Brasil",
                    html: `O horário de almoço do Técnico <b>${tecRefUID.nome}</b> irá ser criado automaticamente após a visita em <b>${city}</b>.<br/>` +
                    `Você deseja que o almoço seja em <b>${city}</b> ou em <b>Tietê</b>?`,
                    icon: "warning",
                    showDenyButton: true,
                    showCloseButton: true,
                    confirmButtonColor: "#F39200",
                    confirmButtonText: city,
                    denyButtonText: `Tietê`,
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      await addDoc(scheduleRef, {
                        dia: diaRef,
                        saidaEmpresa: SaidaClienteRef,
                        chegadaCliente: SaidaClienteRef,
                        visita: "01:00",
                        visitaNumero: 3600,
                        saidaDoCliente: moment(SaidaClienteRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                        chegadaEmpresa: moment(SaidaClienteRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                        consultora: "Almoço Téc.",
                        tecnico: tecRefUID.nome,
                        tecnicoUID: tecRefUID.uid,
                        cidade: '',
                        lat: lat,
                        lng: lng,
                        tempoRota: '',
                        tempo: '',
                        cliente: '',
                        observacao: '',
                        data: dataTexto,
                        uid: user.id,
                        cor: "#111111",
                        confirmar: false,
                        tipo: "Almoço"
                      })
                      createVisitDay(visitaConjunta)
                      console.log(almoco, chegadaEmpresaVisita, saidaAlmoco);
                } else {
                  await addDoc(scheduleRef, {
                    dia: diaRef,
                    saidaEmpresa: ChegadaEmpresaRef,
                    chegadaCliente: ChegadaEmpresaRef,
                    visita: "01:00",
                    visitaNumero: 3600,
                    saidaDoCliente: moment(ChegadaEmpresaRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                    chegadaEmpresa: moment(ChegadaEmpresaRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                    consultora: "Almoço Téc.",
                    tecnico: tecRefUID.nome,
                    tecnicoUID: tecRefUID.uid,
                    cidade: '',
                    lat: -23.0881786,
                    lng: -47.6973284,
                    tempoRota: '',
                    tempo: '',
                    cliente: '',
                    observacao: '',
                    data: dataTexto,
                    uid: user.id,
                    cor: "#111111",
                    confirmar: false,
                    tipo: "Almoço"
                  })
                  createVisitDay(visita)
                  console.log(almoco, chegadaEmpresaVisita, saidaAlmoco);
                }
                });
              } else {
                await addDoc(scheduleRef, {
                  dia: diaRef,
                  saidaEmpresa: ChegadaEmpresaRef,
                  chegadaCliente: ChegadaEmpresaRef,
                  visita: "01:00",
                  visitaNumero: 3600,
                  saidaDoCliente: moment(ChegadaEmpresaRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                  chegadaEmpresa: moment(ChegadaEmpresaRef, 'hh:mm').add(3600, 'seconds').format('kk:mm'),
                  consultora: "Almoço Téc.",
                  tecnico: tecRefUID.nome,
                  tecnicoUID: tecRefUID.uid,
                  cidade: '',
                  lat: -23.0881786,
                  lng: -47.6973284,
                  tempoRota: '',
                  tempo: '',
                  cliente: '',
                  observacao: '',
                  data: dataTexto,
                  uid: user.id,
                  cor: "#111111",
                  confirmar: false,
                  tipo: "Almoço"
                })
                createVisitDay(visita)
              }
            } else if(saidaFormatadaTec.current && lunch.length === 0) {
              await addDoc(scheduleRef, {
                dia: diaRef,
                saidaEmpresa: moment(saidaEmpresaRef, 'hh:mm').subtract(3600, 'seconds').format('kk:mm'),
                chegadaCliente: moment(saidaEmpresaRef, 'hh:mm').subtract(3600, 'seconds').format('kk:mm'),
                visita: "01:00",
                visitaNumero: 3600,
                saidaDoCliente: saidaEmpresaRef,
                chegadaEmpresa: saidaEmpresaRef,
                consultora: "Almoço Téc.",
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                cidade: '',
                lat: -23.0881786,
                lng: -47.6973284,
                tempoRota: '',
                tempo: '',
                cliente: '',
                observacao: '',
                data: dataTexto,
                uid: user.id,
                cor: "#111111",
                confirmar: false,
                tipo: "Almoço"
              })
              Swal.fire({
                      title: "Infinit Energy Brasil",
                      html: `O horário de almoço do Técnico <b>${tecRefUID.nome}</b> foi criado automaticamente antes a visita`,
                      icon: "warning",
                      showConfirmButton: true,
                      confirmButtonColor: "#F39200",
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        createVisitDay(visita)
                      }
                    })
            } else {
              createVisitDay(visita);
            }
            }
          }
        });
      }
    } catch (error) {
    }
  };

  const createVisitDay = async (data) => {
     await addDoc(scheduleRef, data);
     Swal.fire({
      title: "Infinit Energy Brasil",
      html: `A visita em <b>${city}</b> foi criada com sucesso!`,
      icon: "success",
      showConfirmButton: true,
      confirmButtonColor: "#F39200",
    })
    return returnSchedule();
  }

  const verifyLunch = () => {
    const lunchDay = schedule.find((lunch) => lunch.data === dataTexto && lunch.tipo === "Almoço" && lunch.tecnico === tecnicoTexto)
        if(lunchDay && type) {
          Swal.fire({
            title: "Infinit Energy Brasil",
            icon: "warning",
            html: `Já existe um horário de almoço do técnico <b>${tecnicoTexto}</b> criado nesse dia.<br/><br/>` + 
            `Hórario: <b>${lunchDay.chegadaCliente} - ${lunchDay.saidaDoCliente}</b>`,
            confirmButtonText: "Fechar",
            confirmButtonColor: "#d33"  
          }).then((result) => {
            if(result.isConfirmed) {
              setDataTexto('');
            }
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
            <label className="label">
              <p>Dia *</p>
              <input
                className="label__input"
                type="date"
                value={dataTexto}
                onBlur={() => verifyLunch()}
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                onChange={(e) => setDataTexto(e.target.value)}
                placeholder="Digite o dia"
                autoComplete="off"
                required
              />
            </label>
            {!checkInput &&
              <label className="label">
              <p>Cidade *</p>
              <input
                className="label__input"
                placeholder="Digite a cidade"
                ref={ref}
                required
              />
              {tempoTexto && tempoTexto && (
                <p className="notice">Tempo da rota: {tempoTexto} ✔️</p>
              )}
            </label>
            }
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
            <label className="label">
              <p>Hórario Marcado  *</p>
              <input
                className="label__input time"
                type="time"
                placeholder="Digite o hórario marcado"
                min="07:00"
                max="18:00"
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
                  value={visitaNumero}
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
          <label className="label">
            <p>Consultora  *</p>
            <input
              className="label__input"
              type="text"
              autoComplete="off"
              {...register("consultora", {
                value: consultora,
              })}
              disabled
            />
          </label>
          <div className="label margin-top">
            <p>Técnico *</p>
            <select
              value={tecnicoTexto}
              className="label__select"
              name="tec"
              onBlur={() => verifyLunch()}
              onChange={(e) => setTecnicoTexto(e.target.value)}>
                {tecs &&
                tecs.map((tec, index) => (
                  <option key={index} value={tec.nome}>{tec.nome}</option>
                ))}
            </select>
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
          {chegadaTexto && saidaTexto && (
            <div className="box-visit__info prev">
              <span className="">Previsão de Visita</span>
              <p className="notice">
                Saindo da Empresa: <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando na Empresa: <b>{chegadaTexto}</b>
              </p>
            </div>
          )}
          <input className="box-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>

      {isLoaded && check === true ? (
        <GoogleMap zoom={10} center={{ lat: -27.598824, lng: -48.551262 }}>
          <DistanceMatrixService
            options={{
              destinations: [{ lat: lat, lng: lng }],
              origins: [{ lng: -47.6973284, lat: -23.0881786 }],
              travelMode: "DRIVING",
            }}
            callback={(response, status) => {
              if (status === "OK") {
                console.log(response);
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
