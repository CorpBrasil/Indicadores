import { deleteDoc, updateDoc, doc } from "firebase/firestore";
import { dataBase } from "../../../firebase/database";
import { useLayoutEffect, useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from "moment";
import "moment/locale/pt-br";
import { Company } from "../../../data/Data";

import "../style.scss";

const EditVisit = ({
  returnSchedule,
  filterSchedule,
  tecs,
  visitRef,
  scheduleRef,
  scheduleRefUID,
  schedule,
  monthNumber,
  monthSelect,
  year,
}) => {
  // const chegadaFormatadaTec = useRef();
  // const saidaFormatadaTec = useRef();

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
  const [tecRefUID, setTecRefUID] = useState(); // Procura os tecnicos que vem da pagina 'Schedule'
  const [veiculo, setVeiculo] = useState();
  const [city, setCity] = useState();
  const [hoursLimit, setHoursLimit] = useState(false);

  console.log(monthSelect);

  const { register, handleSubmit, reset } = useForm();

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
      setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto));
      setVeiculo(visitRef.veiculo);
      setCity(visitRef.cidade);
      if (visitRef.consultora === "Almoço Téc.") {
        setHorarioTexto(visitRef.saidaEmpresa);
      } else {
        setHorarioTexto(visitRef.chegadaCliente);
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitRef]);

  useEffect(() => {
    if (dataTexto) {
      filterSchedule(dataTexto, tecnicoTexto);
    } else {
      filterSchedule();
    }

    if(tecnicoTexto) {
      setTecRefUID(tecs.find((tec) => tec.nome === tecnicoTexto));
    }
    
    if(tecRefUID && tecRefUID.nome !== visitRef.tecnico) setVeiculo(tecRefUID.veiculo)
    if(tecRefUID && tecRefUID.nome === visitRef.tecnico) setVeiculo(visitRef.veiculo)

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
        console.log("2");
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
        console.log("33333");
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
        console.log("2222222");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto, horarioTexto, tecRefUID]);

  useEffect(() => {
    // console.log(visitaNumero);
    if (horarioTexto || dataTexto || rotaTempo) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada

      saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

      console.log(saidaTexto, rotaTempo);
      setSaidaTexto(saidaEmpresa.format("kk:mm"));
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
        console.log("trocou");
        setChegadaTexto(chegadaCliente.format("kk:mm"));
      }
    }
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

  // const verificaVisitas = (novaVisita, visitasExist) => {
  //   for (let i = 0; i < visitasExist.length; i++) {
  //     const visita = visitasExist[i];
  //     if ((novaVisita.saidaEmpresa >= visita.saidaEmpresa && novaVisita.saidaEmpresa < visita.chegadaEmpresa) &&
  //         (novaVisita.chegadaEmpresa > visita.saidaEmpresa && novaVisita.chegadaEmpresa <= visita.chegadaEmpresa)) {
  //         console.log('trueeee')
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  const onSubmit = async (userData) => {
    try {
      //let tecRefUID = tecs.find((tec) => tec.nome === tecnicoTexto);
      let diaRef,
        saidaEmpresaRef,
        chegadaClienteRef,
        TempoVisita,
        SaidaClienteRef,
        ChegadaEmpresaRef;
        //tempoRotaRef;
      const chegada = horarioTexto;
      const tempo = moment("00:00", "HH:mm");
      moment.locale("pt-br");
      chegadaClienteRef = chegada;

      const chegadaCliente = moment(chegada, "hh:mm"); //Horario de chegada
      const day = moment(dataTexto); // Pega o dia escolhido

      diaRef = day.format("YYYY MM DD");

      TempoVisita = tempo.add(visitaNumero, "seconds").format("HH:mm");

      saidaEmpresaRef = saidaTexto;

      SaidaClienteRef = saidaCliente;

      chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      //chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
      ChegadaEmpresaRef = chegadaTexto;
      //tempoRotaRef = rotaTempo;

      console.log({
        // dia: diaRef,
        saidaEmpresa: saidaEmpresaRef,
        // chegadaCliente: chegadaClienteRef,
        // visita: TempoVisita,
        // saidaDoCliente: SaidaClienteRef,
        chegadaEmpresa: ChegadaEmpresaRef,
        // consultora: userData.consultora,
        // tecnico: tecnicoTexto,
        // cidade: city,
      });

      // const dataRef = schedule.filter(
      //   (dia) => dia.data === dataTexto && dia.tecnico === tecnicoTexto && dia.chegadaCliente !== visitRef.chegadaCliente
      // );

      console.log(dataRef);
      const lunch = schedule.filter(
        (dia) =>
          dia.data === dataTexto &&
          dia.consultora === "Almoço Téc." &&
          dia.tecnico === tecnicoTexto
      );
      const saidaFormatada = moment(saidaEmpresaRef, "hh:mm");
      const chegadaFormatada = moment(ChegadaEmpresaRef, "hh:mm");

      console.log(saidaFormatada);
      console.log(chegadaFormatada);
      let check = [];
      let visitsFind = [];

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
          html: `Você deseja alterar essa <b>Visita?</b>`,
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
              console.log(visitsAntes, visitsDepois);
          if(visitsAntes.length > 0) {
            visitsAntes.map(async (ref) => {
              const visitBefore =  schedule.filter(before => (before.data === ref.data && before.chegadaEmpresa === ref.saidaEmpresa && ref.consultora !== 'Almoço Téc.' && before.tipo === "Visita Conjunta" && !before.visitaAlmoco));
              if(ref.cidade === visitRef.cidade) {
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
             const visitNext =  schedule.filter(next => (next.data === ref.data && next.saidaEmpresa === ref.chegadaEmpresa && ref.consultora !== 'Almoço Téc.' && next.tipo === "Visita Conjunta" && !next.visitaAlmoco));
              if(ref.cidade === visitRef.cidade) {
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
          }

            if (visitRef.consultora === "Almoço Téc.") {
              await updateDoc(scheduleRefUID, {
                dia: diaRef,
                saidaEmpresa: saidaEmpresaRef,
                chegadaCliente: saidaEmpresaRef,
                visita: "01:00",
                visitaNumero: 3600,
                saidaDoCliente: ChegadaEmpresaRef,
                chegadaEmpresa: ChegadaEmpresaRef,
                consultora: "Almoço Téc.",
                tecnico: tecRefUID.nome,
                tecnicoUID: tecRefUID.uid,
                cidade: "",
                tempoRota: "",
                tempo: "",
                cliente: "",
                observacao: userData.observacao,
                data: dataTexto,
                uid: visitRef.uid,
                cor: "#111111",
                confirmar: false,
              });
            }
            if (
              visitRef.data !== dataTexto &&
              visitRef.consultora !== "Almoço Téc."
            ) {
              console.log(userData.consultora)
              await updateDoc(
                doc(dataBase, "Agendas", year, monthSelect, visitRef.id),
                {
                  dia: diaRef,
                  data: dataTexto,
                  saidaEmpresa: saidaEmpresaRef,
                  chegadaCliente: chegadaClienteRef,
                  visita: TempoVisita,
                  visitaNumero: visitaNumero,
                  saidaDoCliente: SaidaClienteRef,
                  chegadaEmpresa: ChegadaEmpresaRef,
                  consultora: userData.consultora,
                  tecnico: tecRefUID.nome,
                  tecnicoUID: tecRefUID.uid,
                  veiculo: veiculo,
                  cidade: visitRef.cidade,
                  cliente: userData.cliente,
                  observacao: userData.observacao,
                  uid: visitRef.uid,
                  cor: visitRef.cor,
                  visitaConjunta: false,
                  groupRef: "",
                  group: "",
                  tipo: "Visita",
                }
              );
            } else if (
              visitRef.data === dataTexto &&
              visitRef.consultora !== "Almoço Téc."
            ) {
              console.log(userData.consultora)
              await updateDoc(
                doc(dataBase, "Agendas", year, monthSelect, visitRef.id),
                {
                  dia: diaRef,
                  data: dataTexto,
                  saidaEmpresa: saidaEmpresaRef,
                  chegadaCliente: chegadaClienteRef,
                  visita: TempoVisita,
                  visitaNumero: visitaNumero,
                  saidaDoCliente: SaidaClienteRef,
                  chegadaEmpresa: ChegadaEmpresaRef,
                  consultora: userData.consultora,
                  tecnico: tecRefUID.nome,
                  tecnicoUID: tecRefUID.uid,
                  veiculo: veiculo,
                  cidade: visitRef.cidade,
                  cliente: userData.cliente,
                  observacao: userData.observacao,
                  uid: visitRef.uid,
                  cor: visitRef.cor,
                }
              );
            }

            Swal.fire({
              title: Company,
              html: `A Visita em <b>${visitRef.cidade}</b> foi alterada com sucesso.`,
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
    } catch (error) {
      console.log(error);
    }
  };

  console.log(visitRef);

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        {visitRef.visitaConjunta ? (
          <h4>Editar Visita Conjunta</h4>
        ) : (
          <h4>Editar Visita</h4>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
            <label className="label">
              <p>Dia *</p>
              {visitRef.consultora === "Almoço Téc." ? (
                <input
                  value={dataTexto || ""}
                  className="label__input"
                  type="date"
                  min={monthNumber && monthNumber.min}
                  max={monthNumber && monthNumber.max}
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
                  min={monthNumber && monthNumber.min}
                  max={monthNumber && monthNumber.max}
                  onChange={(e) => setDataTexto(e.target.value)}
                  placeholder="Digite o dia"
                  autoComplete="off"
                  required
                />
              )}
            </label>
            {visitRef.consultora !== "Almoço Téc." && (
              <>
                <label className="label">
                  <p>Endereço *</p>
                  <input
                    className="label__input"
                    placeholder="Digite a cidade"
                    value={visitRef.endereco ? visitRef.endereco : city}
                    disabled
                  />
                  {tempoTexto && tempoTexto && (
                    <p className="notice">Tempo da rota: {tempoTexto} ✔️</p>
                  )}
                </label>
                <label className="label">
                  <p>Cliente *</p>
                  <input
                    className="label__input"
                    placeholder="Digite a cidade"
                    {...register("cliente")}
                    required
                  />
                </label>
              </>
            )}
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
              visitRef.consultora === "Almoço Téc." ||
              (!visitRef.visitaConjunta &&
                visitRef.consultora !== "Almoço Téc." &&
                checkInput) ||
              (!visitRef.visitaConjunta &&
                visitRef.consultora !== "Almoço Téc." &&
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
            <label className="label">
              <p>Tempo de Visita *</p>
              {visitRef.consultora === "Almoço Téc." || !checkInput ? (
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
            <label className="label">
              <p>Consultora *</p>
              <input
                className="label__input"
                type="text"
                autoComplete="off"
                {...register("consultora")}
                disabled
              />
            </label>

            <div className="label margin-top">
              <p>Técnico *</p>
              <div className="radio">
                {visitRef.consultora === "Almoço Téc." ||
                visitRef.visitaConjunta ? (
                  <select
                    value={tecnicoTexto}
                    className="label__select"
                    name="tec"
                    disabled
                    onChange={(e) => setTecnicoTexto(e.target.value)}
                  >
                    {tecs &&
                      tecs.map((tec, index) => (
                        <option key={index} value={tec.nome}>
                          {tec.nome}
                        </option>
                      ))}
                  </select>
                ) : (
                  <select
                    value={tecnicoTexto}
                    className="label__select"
                    name="tec"
                    required
                    onChange={(e) => setTecnicoTexto(e.target.value)}
                  >
                    {tecs &&
                      tecs.map((tec, index) => (
                        <option key={index} value={tec.nome}>
                          {tec.nome}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
            {visitRef.consultora !== "Almoço Téc." && 
            <label className="label">
            <p>Veículo *</p>
            <input
              className="label__input"
              type="text"
              value={veiculo}
              onChange={(e) => setVeiculo(e.target.value)} // onChange é necessario para poder atualizar a input
              autoComplete="off"
              required
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
                Saindo da Empresa:
                <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando na Empresa: <b>{chegadaTexto}</b>
              </p>
            </div>
          )}
          <input className="box-visit__btn" type="submit" value="EDITAR" />
        </form>
      </div>
    </div>
  );
};

export default EditVisit;
