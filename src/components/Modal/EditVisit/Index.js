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
  const [visitaNumero, setVisitaNumero] = useState(1800);
  const [saidaCliente, setSaidaCliente] = useState();
  const [horarioTexto, setHorarioTexto] = useState()
  const [saidaTexto, setSaidaTexto] = useState()
  const [chegadaTexto, setChegadaTexto] = useState()
  const [dataTexto, setDataTexto] = useState()
  const [tecnicoTexto, setTecnicoTexto] = useState()
  const [city, setCity] = useState();
  const [hoursLimit, setHoursLimit] = useState(false);

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
      setVisitaNumero(visitRef.visitaNumero);
      setSaidaTexto(visitRef.saidaEmpresa);
      setChegadaTexto(visitRef.chegadaEmpresa);
      setDataTexto(moment(new Date(visitRef.dia)).format('YYYY-MM-DD'));
      setTecnicoTexto(visitRef.tecnico);
      setCity(visitRef.cidade);
      if(visitRef.consultora === 'Almoço Téc.') {
        setHorarioTexto(visitRef.saidaEmpresa);
      } else {
        setHorarioTexto(visitRef.chegadaCliente);
      }
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitRef]);

  useEffect(() => {
    if(dataTexto) {
      filterSchedule(dataTexto, tecnicoTexto)
    } else {
      filterSchedule()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTexto, tecnicoTexto]);

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
      console.log(chegadaFormatada);
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
              visitaNumero: visitaNumero,
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
    <div className="createAndEdit-visit">
      <div className="createAndEdit-visit__box">
        <div className="createAndEdit-visit__close">
          <button onClick={returnSchedule} className="btn-close" />
        </div>
        <h4>Editar Visita</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="createAndEdit-visit__container">
            <label className="label">
              <p>Dia</p>
              {visitRef.consultora === 'Almoço Téc.' ?
              <input
                value={dataTexto}
                className="label__input"
                type="date"
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                onChange={(e) => setDataTexto(e.target.value)}
                placeholder="Digite o dia"
                autoComplete="off"
                disabled
              /> :
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
            }
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
                value={horarioTexto}
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
              {visitRef.consultora === 'Almoço Téc.' ?
              <select
              value={visitaNumero}
              className="label__select"
              name="tec"
              disabled
              onChange={(e) => setVisitaNumero(e.target.value)}>
                  <option value={1800}>00:30</option>
                  <option value={3600}>01:00</option>
                  <option value={5400}>01:30</option>
                  <option value={7200}>02:00</option>
            </select> : <select
              value={visitaNumero}
              className="label__select"
              name="tec"
              onChange={(e) => setVisitaNumero(e.target.value)}>
                  <option value={1800}>00:30</option>
                  <option value={3600}>01:00</option>
                  <option value={5400}>01:30</option>
                  <option value={7200}>02:00</option>
            </select>
            }
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
            {visitRef.consultora === 'Almoço Téc.' ?
            <select
              value={tecnicoTexto}
              className="label__select"
              name="tec"
              disabled
              onChange={(e) => setTecnicoTexto(e.target.value)}>
                {tecs &&
                tecs.map((tec, index) => (
                  <option key={index} value={tec.nome}>{tec.nome}</option>
                ))}
            </select> : 
            <select
            value={tecnicoTexto}
            className="label__select"
            name="tec"
            required
            onChange={(e) => setTecnicoTexto(e.target.value)}>
              {tecs &&
              tecs.map((tec, index) => (
                <option key={index} value={tec.nome}>{tec.nome}</option>
              ))}
          </select>}
            </div>
          </div>
          </div>
          {chegadaTexto && saidaTexto && (
            <div className="createAndEdit-visit__info prev">
              <span className="">Previsão de Visita</span>
              <p className="notice">
                Saindo da Empresa: <b>{saidaTexto}</b>
              </p>
              <p className="notice">
                Chegando na Empresa: <b>{chegadaTexto}</b>
              </p>
            </div>
          )}
          <input className="createAndEdit-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>
    </div>
  )
}


export default EditVisit