import {
  updateDoc
} from "firebase/firestore";
import { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from 'moment';
import 'moment/locale/pt-br';

import '../_modal.scss';

const EditVisit = ({ returnSchedule, filterSchedule, tecs, visitRef, scheduleRef, schedule, monthNumber, year}) => {
  const chegadaFormatadaTec = useRef();
  const saidaFormatadaTec = useRef();

  const [rotaTempo, setRotaTempo] = useState()
  const [tempoTexto, setTempoTexto] = useState()
  const [visitaTexto, setVisitaTexto] = useState();
  const [horarioTexto, setHorarioTexto] = useState()
  const [saidaTexto, setSaidaTexto] = useState()
  const [chegadaTexto, setChegadaTexto] = useState()
  const [dataTexto, setDataTexto] = useState()
  const [tecnicoTexto, setTecnicoTexto] = useState()
  const [city, setCity] = useState();

  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  useLayoutEffect(() => {
    // faz a solicitação do servidor assíncrono e preenche o formulário
    setTimeout(() => {
      reset({
        consultora: visitRef.consultora,
      });
      setRotaTempo(visitRef.tempoRota);
      setTempoTexto(visitRef.tempo);
      setVisitaTexto(visitRef.visita);
      setHorarioTexto(visitRef.chegadaCliente);
      setSaidaTexto(visitRef.saidaEmpresa);
      setChegadaTexto(visitRef.chegadaEmpresa);
      setDataTexto(moment(new Date(visitRef.dia)).format('YYYY-MM-DD'));
      setTecnicoTexto(visitRef.tecnico);
      setCity(visitRef.cidade);
    }, 0);
  }, [reset, visitRef]);

  useEffect(() => {
    if(dataTexto) {
      filterSchedule(dataTexto, tecnicoTexto)
    } else {
      filterSchedule()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto]);

  useEffect(() => {
    console.log(visitaTexto);
    if (horarioTexto && visitaTexto) {
      moment.locale("pt-br");

      const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada
      const visita = moment(visitaTexto, "hh:mm");

      saidaEmpresa.subtract(rotaTempo, "seconds") // Pega o tempo que o tecnico vai precisar sair da empresa

      //console.log(infoTexto)
      setSaidaTexto(saidaEmpresa.format("kk:mm"));

      const tempoVisitaH = visita.format("hh");
      const tempoVisitaM = visita.format("mm");

      chegadaCliente.add(tempoVisitaH, "h");
      chegadaCliente.add(tempoVisitaM, "m");
      chegadaCliente.add(rotaTempo, "seconds") //Adiciona tempo de viagem volta
      setChegadaTexto(chegadaCliente.format("kk:mm"));
    }
  }, [horarioTexto, visitaTexto, chegadaTexto, saidaTexto, rotaTempo]);

  const onSubmit = async (userData) => {

    try {
      let tecRefUID = tecs.find((tec) => tec.nome === tecnicoTexto);
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
        tecnico: tecnicoTexto,
        cidade: city,
      });

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
        html: `Você deseja alterar essa <b>Visita?</b>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          console.log(year, monthNumber);
            await updateDoc(scheduleRef, {
              dia: diaRef,
              saidaEmpresa: saidaEmpresaRef,
              chegadaCliente: chegadaClienteRef,
              visita: TempoVisita,
              saidaDoCliente: SaidaClienteRef,
              chegadaEmpresa: ChegadaEmpresaRef,
              consultora: userData.consultora,
              tecnico: tecRefUID.nome,
              tecnicoUID: tecRefUID.uid,
              cidade: visitRef.cidade,
              tempoRota: tempoRotaRef,
              uid: visitRef.uid,
              cor: visitRef.cor,
             })
          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Visita em <b>${visitRef.cidade}</b> foi alterada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200"
          }).then((result) => {
            if (result.isConfirmed) {
                return returnSchedule();
            }
          })
        }
      })
    }
    } catch (error) {
      console.log(error)
    } 
    }

  return (
    <div className="create-visit">
      <div className="create-visit__box">
        <div className="create-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        <h4>Editar Visita</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="create-visit__container">
            <label className="label">
              <p>Dia</p>
              <input
                value={dataTexto}
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
                value={city}
                disabled
              />
              {tempoTexto && tempoTexto && (
                <p className="notice">Tempo da rota: {tempoTexto}</p>
              )}
            </label>
            <label className="label">
              <p>Hórario Marcado</p>
              <input
                className="label__input time"
                type="time"
                placeholder="Digite o hórario marcado"
                autoComplete="off"
                value={horarioTexto}
                onChange={(e) => setHorarioTexto(e.target.value)}
                required
              />
            </label>
            <label className="label">
              <p>Tempo de Visita</p>
              <input
                value={visitaTexto}
                className="label__input time"
                type="time"
                placeholder="Digite o hórario de saida"
                min="00:00"
                max="03:00"
                onChange={(e) => setVisitaTexto(e.target.value)}
                autoComplete="off"
                required
              />
            </label>
          <label className="label">
            <p>Consultora</p>
            <input
              className="label__input"
              type="text"
              autoComplete="off"
              {...register("consultora")}
              disabled
            />
          </label>

          <div className="label margin-top">
            <p>Técnico</p>
            <div className="radio">
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
          </div>
          {chegadaTexto && saidaTexto && (
            <div className="create-visit__info prev">
              <span className="">Previsão de Visita</span>
              <p className="notice">
                Saindo da Empresa: <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando na Empresa: <b>{chegadaTexto}</b>
              </p>
            </div>
          )}
          <input className="create-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>
    </div>
  )
}


export default EditVisit