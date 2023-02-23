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
}) => {
  const { user } = useAuth();
  const chegadaFormatadaTec = useRef();
  const saidaFormatadaTec = useRef();
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [check, setCheck] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto]);

  // useEffect(() => {
  //   const find = () => {
  //     setTecs(membersRef.filter((member) => member.cargo === "Técnico"));
  //   };

  //   find();
  // }, []);

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

  const { isLoaded } = useLoadScript({
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
      let tecRefUID = tecs.find((tec) => tec.nome === tecnicoTexto); // Procura os tecnicos que vem da pagina 'Schedule'
      let diaRef,
        saidaEmpresaRef,
        chegadaClienteRef,
        TempoVisita,
        SaidaClienteRef,
        ChegadaEmpresaRef,
        tempoRotaRef;
      const chegada = horarioTexto;
      moment.locale("pt-br");
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
      const chegadaFormatada = moment(ChegadaEmpresaRef, "hh:mm");

      console.log(saidaFormatada);
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
          console.log(chegadaFormatadaTec.current.format("kk:mm"));
        } else if (
          saidaFormatada > moment("10:59", "hh:mm") &&
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
            await addDoc(scheduleRef, {
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
              cliente: userData.cliente,
              tempoRota: tempoRotaRef,
              tempo: tempoTexto,
              data: dataTexto,
              uid: user.id,
              cor: userRef.cor,
              confirmar: false,
            });

            Swal.fire({
              title: "Infinit Energy Brasil",
              html: `A Visita em <b>${city}</b> foi cadastrada com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              confirmButtonColor: "#F39200",
            }).then(async (result) => {
              if (result.isConfirmed) {
                if (lunch.length === 0) {
                  if (saidaFormatadaTec.current === null) {
                    await addDoc(scheduleRef, {
                      dia: diaRef,
                      saidaEmpresa: ChegadaEmpresaRef,
                      chegadaCliente: "",
                      visita: "01:00",
                      visitaNumero: '',
                      saidaDoCliente: "",
                      chegadaEmpresa:
                        chegadaFormatadaTec.current.format("kk:mm"),
                      consultora: "Almoço Téc.",
                      tecnico: tecRefUID.nome,
                      tecnicoUID: tecRefUID.uid,
                      cidade: '',
                      tempoRota: '',
                      tempo: '',
                      data: dataTexto,
                      uid: user.id,
                      cor: "#111111",
                      confirmar: false,
                    });
                  } else {
                    await addDoc(scheduleRef, {
                      dia: diaRef,
                      saidaEmpresa: saidaFormatadaTec.current.format("kk:mm"),
                      chegadaCliente: "",
                      visita: "01:00",
                      visitaNumero: 3600,
                      saidaDoCliente: "",
                      chegadaEmpresa: saidaEmpresaRef,
                      consultora: "Almoço Téc.",
                      tecnico: tecRefUID.nome,
                      tecnicoUID: tecRefUID.uid,
                      cidade: '',
                      tempoRota: '',
                      tempo: '',
                      data: dataTexto,
                      uid: user.id,
                      cor: "#111111",
                      confirmar: false,
                    });
                  }
                }
                //setCheck(false);
                return returnSchedule();
              }
            });
          }
        });
      }
    } catch (error) {
      //console.log(error)
    }
  };

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        <h4>Criar Visita</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
            <label className="label">
              <p>Dia</p>
              <input
                className="label__input"
                type="date"
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                onChange={(e) => setDataTexto(e.target.value)}
                placeholder="Digite o dia"
                autoComplete="off"
                required
              />
            </label>
            <label className="label">
              <p>Cidade</p>
              <input
                className="label__input"
                placeholder="Digite a cidade"
                ref={ref}
                required
              />
              {tempoTexto && tempoTexto && (
                <p className="notice">Tempo da rota: {tempoTexto}</p>
              )}
            </label>
            <label className="label">
            <p>Cliente</p>
            <input
              className="label__input"
              type="text"
              placeholder="Digite o nome do Cliente"
              autoComplete="off"
              {...register("cliente")}
              required
            />
          </label>
            <label className="label">
              <p>Hórario Marcado</p>
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
              <p>Tempo de Visita</p>
              <select
              value={visitaNumero}
              className="label__select"
              name="tec"
              onChange={(e) => setVisitaNumero(e.target.value)}>
                  <option value={1800}>00:30</option>
                  <option value={3600}>01:00</option>
                  <option value={5400}>01:30</option>
                  <option value={7200}>02:00</option>
            </select>
            </label>
          <label className="label">
            <p>Consultora</p>
            <input
              className="label__input"
              type="text"
              autoComplete="off"
              {...register("consultora", {
                value: user.name,
              })}
              disabled
            />
          </label>

          <div className="label margin-top">
            <p>Técnico</p>
            <select
              value={tecnicoTexto}
              className="label__select"
              name="tec"
              onChange={(e) => setTecnicoTexto(e.target.value)}>
                {tecs &&
                tecs.map((tec, index) => (
                  <option key={index} value={tec.nome}>{tec.nome}</option>
                ))}
            </select>
          </div>
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
