import { addDoc } from "firebase/firestore";
import { memo, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from "moment";
import "moment/locale/pt-br";

import useAuth from "../../../hooks/useAuth";
import "animate.css";

import { usePlacesWidget } from "react-google-autocomplete";
import {
  DistanceMatrixService,
  GoogleMap,
  useLoadScript,
} from "@react-google-maps/api";

import "../_modal.scss";

const CreateVisit = ({
  returnSchedule,
  scheduleRef,
  membersRef,
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
  const [visitaTexto, setVisitaTexto] = useState(undefined);
  const [horarioTexto, setHorarioTexto] = useState(undefined);
  const [saidaTexto, setSaidaTexto] = useState(undefined);
  const [chegadaTexto, setChegadaTexto] = useState(undefined);
  const [dataTexto, setDataTexto] = useState(undefined);
  const [tecnicoTexto, setTecnicoTexto] = useState(undefined);

  const [city, setCity] = useState();
  const [libraries] = useState(["places"]);
  const [tecs, setTecs] = useState();
  const [dayVisits, setDayVisits] = useState();

  const { register, handleSubmit } = useForm();
  
  useEffect(() => {
    const find = () => {
      //setTecs(membersRef.filter((member) => member.cargo === "Técnico"));
      setDayVisits(
        schedule.filter(
          (dia) => dia.data === dataTexto && dia.tecnico === tecnicoTexto
        )
        );
    };

    find();
  }, [membersRef, dataTexto, tecnicoTexto ,schedule]);

  useEffect(() => {
    const find = () => {
      setTecs(membersRef.filter((member) => member.cargo === "Técnico"));
    };

    find();
  }, []);

  useEffect(() => {
    if(dataTexto) {
      setDayVisits(dayVisits.sort(function(a, b) {
        if(a.saidaEmpresa < b.saidaEmpresa) return -1;
        if(a.saidaEmpresa > b.saidaEmpresa) return 1;
        return 0;
      }))
      console.log('oi')
    }
  },[dayVisits, dataTexto])

  useEffect(() => {
    console.log(visitaTexto);
    if (horarioTexto && visitaTexto) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const visita = moment(visitaTexto, "hh:mm");

      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

      //console.log(infoTexto)
      setSaidaTexto(saidaEmpresa.format("kk:mm"));

      const tempoVisitaH = visita.format("hh");
      const tempoVisitaM = visita.format("mm");

      chegadaCliente.add(tempoVisitaH, "h");
      chegadaCliente.add(tempoVisitaM, "m");
      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      setChegadaTexto(chegadaCliente.format("kk:mm"));
    }
  }, [horarioTexto, visitaTexto, chegadaTexto, saidaTexto, rotaTempo]);

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
      let tecRefUID = tecs.find((tec) => tec.nome === userData.tecnico);
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
      const tempo = moment(visitaTexto, "hh:mm");
      chegadaClienteRef = chegada;

      const saidaEmpresa = moment(chegada, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(chegada, "hh:mm"); //Horario de chegada
      const day = moment(dataTexto); // Pega o dia escolhido

      diaRef = day.format("YYYY MM DD");

      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

      TempoVisita = visitaTexto;
      saidaEmpresaRef = saidaEmpresa.format("kk:mm");

      const tempoVisitaH = tempo.format("hh");
      const tempoVisitaM = tempo.format("mm");

      chegadaCliente.add(tempoVisitaH, "h");
      chegadaCliente.add(tempoVisitaM, "m");
      SaidaClienteRef = chegadaCliente.format("kk:mm");

      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      ChegadaEmpresaRef = chegadaCliente.format("kk:mm");
      tempoRotaRef = rotaTempo;

      console.log({
        dia: diaRef,
        saidaEmpresa: saidaEmpresaRef,
        chegadaCliente: chegadaClienteRef,
        visita: TempoVisita,
        saidaDoCliente: SaidaClienteRef,
        chegadaEmpresa: ChegadaEmpresaRef,
        consultora: userData.consultora,
        tecnico: userData.tecnico,
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
            saidaFormatada < moment(ref.saidaEmpresa, "hh:mm") &&
            chegadaFormatadaTec.current < moment(ref.saidaEmpresa, "hh:mm")
          ) {
            check.push(ref);
          } else {
            if (saidaFormatada > moment(ref.chegadaEmpresa, "hh:mm"))
              check.push(ref);
          }
          return dataRef;
        });
      } else {
        dataRef.map((ref) => {
          console.log("eae");
          if (
            saidaFormatada < moment(ref.saidaEmpresa, "hh:mm") &&
            chegadaFormatada < moment(ref.saidaEmpresa, "hh:mm")
          ) {
            check.push(ref);
          } else {
            if (saidaFormatada > moment(ref.chegadaEmpresa, "hh:mm"))
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
              saidaDoCliente: SaidaClienteRef,
              chegadaEmpresa: ChegadaEmpresaRef,
              consultora: userData.consultora,
              tecnico: tecRefUID.nome,
              tecnicoUID: tecRefUID.uid,
              cidade: city,
              tempoRota: tempoRotaRef,
              tempo: tempoTexto,
              data: userData.dia,
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
                  if (saidaFormatadaTec === null) {
                    await addDoc(scheduleRef, {
                      dia: diaRef,
                      saidaEmpresa: ChegadaEmpresaRef,
                      chegadaCliente: "",
                      visita: "",
                      saidaDoCliente: "",
                      chegadaEmpresa:
                        chegadaFormatadaTec.current.format("kk:mm"),
                      consultora: "Almoço Téc.",
                      tecnico: tecRefUID.nome,
                      tecnicoUID: tecRefUID.uid,
                      cidade: "",
                      tempoRota: "",
                      data: userData.dia,
                      uid: user.id,
                      cor: "#111111",
                      confirmar: false,
                    });
                  } else {
                    await addDoc(scheduleRef, {
                      dia: diaRef,
                      saidaEmpresa: saidaFormatadaTec.current.format("kk:mm"),
                      chegadaCliente: "",
                      visita: "",
                      saidaDoCliente: "",
                      chegadaEmpresa: saidaEmpresaRef,
                      consultora: "Almoço Téc.",
                      tecnico: tecRefUID.nome,
                      tecnicoUID: tecRefUID.uid,
                      cidade: "",
                      tempoRota: "",
                      data: userData.dia,
                      uid: user.id,
                      cor: "#111111",
                      confirmar: false,
                    });
                  }
                }
                setCheck(false);
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
    <div ref={chegadaFormatadaTec} className="modal-visit">
      <div className="box-visit">
        <div className="box-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        <h4>Criar Visita</h4>
        <form className="form-visit" onSubmit={handleSubmit(onSubmit)}>
          <div>
          <div className="form-visit__double">
            <label className="form-visit__label">
              <p>Dia</p>
              <input
                className="form-visit__text small"
                type="date"
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                onChange={(e) => setDataTexto(e.target.value)}
                placeholder="Digite o dia"
                autoComplete="off"
                //{...register("dia")}
                required
              />
            </label>
            <label className="form-visit__label">
              <p>Cidade</p>
              <input
                className="form-visit__text small"
                placeholder="Digite a cidade"
                ref={ref}
                required
              />
              {tempoTexto && tempoTexto && (
                <p className="notice">Tempo de rota: {tempoTexto}</p>
              )}
            </label>
          </div>
          <div className="form-visit__double">
            <label className="form-visit__label">
              <p>Hórario Marcado</p>
              <input
                className="form-visit__text small"
                type="time"
                placeholder="Digite o hórario marcado"
                autoComplete="off"
                onChange={(e) => setHorarioTexto(e.target.value)}
                //{...register("chegada")}
                required
              />
            </label>
            <label className="form-visit__label">
              <p>Tempo de Visita</p>
              <input
                className="form-visit__text small"
                type="time"
                placeholder="Digite o hórario de saida"
                min="00:00"
                max="03:00"
                onChange={(e) => setVisitaTexto(e.target.value)}
                autoComplete="off"
                //{...register("visita")}
                required
              />
            </label>
          </div>
          <label className="form-visit__label">
            <p>Consultora</p>
            <input
              className="form-visit__text"
              type="text"
              autoComplete="off"
              {...register("consultora", {
                value: user.name,
              })}
              disabled
            />
          </label>

          <div className="form-visit__label margin-top">
            <p>Técnico</p>
            <div className="radio">
              {tecs &&
                tecs.map((tec) => (
                  <div key={tec.id}>
                    <input
                      {...register("tecnico")}
                      onClick={(e) => setTecnicoTexto(e.target.value)}
                      id={tec.id}
                      type="radio"
                      value={tec.nome}
                    />
                    <label htmlFor={tec.id}>{tec.nome}</label>
                  </div>
                ))}
            </div>
          </div>
          <div className="form-visit__double">
          {chegadaTexto && saidaTexto && (
            <div className="form-visit__info prev">
              <span className="">Previsão de Visita</span>
              <p className="notice">
                Saindo da Empresa: <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando na Empresa: <b>{chegadaTexto}</b>
              </p>
            </div>
          )}
          {dataTexto && tecnicoTexto && (
            <div className="form-visit__info visits">
              <span className="">Visitas já criadas - <b>{moment(dataTexto).format('DD/MM/YYYY')}</b></span>
              {dayVisits && dayVisits.map((visit, index) => (
                <p key={index} className="notice">
                {index + 1} - <b>{visit.saidaEmpresa} : {visit.chegadaEmpresa}</b>
              </p>
              ))}
              {/* <p className="notice">
                1 - <b>{saidaTexto} : {chegadaTexto}</b>
              </p> */}
            </div>
          )}
          </div>
          <input className="form-visit__btn" type="submit" value="CRIAR" />
          </div>
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
