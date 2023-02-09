import {
  addDoc,
  doc,
  collection,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useLayoutEffect, useState, useEffect } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from 'moment';
import 'moment/locale/pt-br';

import { dataBase } from '../../../firebase/database';
import '../_modal.scss';

const EditVisit = ({ returnSchedule, visitRef, membersRef, schedule, month, year}) => {
  const [ tecs, setTecs] = useState();
  const {
    register,
    handleSubmit,
    reset
  } = useForm();

  useLayoutEffect(() => {
    // faz a solicitação do servidor assíncrono e preenche o formulário
    setTimeout(() => {
      reset({
        dia: moment(new Date(visitRef.dia)).format('YYYY-MM-DD'),
        cidade: visitRef.cidade,
        chegada: visitRef.chegadaCliente,
        visita: visitRef.visita,
        tecnico: visitRef.tecnico,
        consultora: visitRef.consultora,
      });
    }, 0);
  }, [reset, visitRef]);

  useEffect(() => {
    const find= () => {
      setTecs(membersRef.filter(member => member.cargo === 'Técnico'));
    }

    find();
  },[membersRef])

  const onSubmit = async (userData) => {

    let tecRefUID = tecs.find(tec => tec.nome === userData.tecnico);
    try {
          let diaRef, saidaEmpresaRef, chegadaClienteRef, TempoVisita, SaidaClienteRef, ChegadaEmpresaRef, tempoRotaRef;
          const chegada = userData.chegada;
          moment.locale('pt-br');
          console.log(moment.locale())
          const tempo = moment(userData.visita, 'hh:mm');
          chegadaClienteRef = chegada;

          const saidaEmpresa = moment(chegada, 'hh:mm'); //Horario de chegada 
          const chegadaCliente = moment(chegada, 'hh:mm'); //Horario de chegada 
          const day = moment(userData.dia); // Pega o dia escolhido

          diaRef = day.format('YYYY MM DD');

          saidaEmpresa.subtract(visitRef.tempoRota, "seconds").format('hh:mm'); // Pega o tempo que o tecnico vai precisar sair da empresa
          
          TempoVisita = userData.visita;
          saidaEmpresaRef = saidaEmpresa.format('kk:mm');

          // day.add((visitRef.tempoRota * 2), "seconds").format('hh:mm'); // Adiciona o tempo de viagem ida

          const tempoVisitaH = tempo.format('hh');
          const tempoVisitaM = tempo.format('mm');
          
          chegadaCliente.add(tempoVisitaH, 'h'); 
          chegadaCliente.add(tempoVisitaM, 'm');
          SaidaClienteRef = chegadaCliente.format('kk:mm');

          chegadaCliente.add(visitRef.tempoRota, "seconds").format('hh:mm'); //Adiciona tempo de viagem volta
          ChegadaEmpresaRef = chegadaCliente.format('kk:mm');
          tempoRotaRef = visitRef.tempoRota;

          console.log({
            dia: diaRef,
            saidaEmpresa: saidaEmpresaRef,
            chegadaCliente: chegadaClienteRef,
            visita: TempoVisita,
            saidaDoCliente: SaidaClienteRef,
            chegadaEmpresa: ChegadaEmpresaRef,
            consultora: userData.consultora,
            tecnico: userData.tecnico,
            cidade: visitRef.cidade,
            tempoRota: tempoRotaRef,
          })

          const saidaFormatada = moment(saidaEmpresaRef, 'hh:mm');
          const chegadaFormatada = moment(ChegadaEmpresaRef, 'hh:mm');
          const dataRef = schedule.filter(dia => dia.data === userData.dia && dia.chegadaEmpresa !== visitRef.chegadaEmpresa && dia.tecnicoUID === visitRef.tecnicoUID);

        const check = [];
        let visitsFind = [];
        dataRef.map((ref) => {
          if(saidaFormatada <= moment(ref.saidaEmpresa, 'hh:mm') && chegadaFormatada <= moment(ref.saidaEmpresa, 'hh:mm')) {
              check.push(ref);
            } else {
              if(saidaFormatada >= moment(ref.chegadaEmpresa, 'hh:mm'))
              check.push(ref);
            }
            return dataRef;
          })

          console.log('>>', check, dataRef);
          const visitsFindCount = dataRef.length - check.length;

          dataRef.map((a) => { //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
            if(check.includes(a) === false) {
              visitsFind.push(a)
            }
            return visitsFind;
          })
          console.log(visitsFind);
          let c = 1;

          if(visitsFindCount > 0) {
            const visits = visitsFind.map((e) => (
              `Visita <b>` + c++ + '</b> - Saida: <b>' + e.saidaEmpresa) + '</b> Chegada: <b>' + e.chegadaEmpresa + '</b></br>');
            Swal.fire({
              title: "Infinit Energy Brasil",
              html: `Foram encontrado(s) <b>${visitsFindCount}</b> visita(s) marcada(s) nesse periodo.</br></br>` +
              visits,
              icon: "error",
              showConfirmButton: true,
              confirmButtonColor: "#F39200"
            })
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
          const newMonth = moment(userData.dia).format('MM').toString();
          if(month === newMonth) {
            await updateDoc(doc(dataBase, "Agendas", year, newMonth, visitRef.id), {
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
          } else {
            await addDoc(collection(dataBase, "Agendas", year, newMonth), {
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
              tempo: visitRef.tempo,
              uid: visitRef.uid,
              cor: visitRef.cor,
              confirmar: false
             })
             await deleteDoc(doc(dataBase, "Agendas", year, month, visitRef.id));
          }
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
    <div className='modal-visit'>
       <div className='box-visit'>
            <div className='box-visit__close'>
                <button onClick={returnSchedule} className='btn-close' />
            </div>
            <h4>Editar Visita</h4> 
        <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
          <div className='form-visit__double'>
          <label className="form-visit__label">
            <p>Dia</p>
              <input
                className="form-visit__text small"
                type="date"
                placeholder="Digite o dia"
                autoComplete="off"
                min='2023-01-01'
                max='2023-12-31'
                {...register("dia")}
                required
              />
            </label>
          <label className="form-visit__label">
            <p>Cidade</p>
              <input
                className="form-visit__text small"
                placeholder="Digite a cidade"
                {...register("cidade")}
                disabled
              />
              {visitRef.tempo && visitRef.tempo && <p className='notice'>Tempo de rota: {visitRef.tempo}</p>}
            </label>
          </div>
        <div className='form-visit__double'>
        <label className="form-visit__label">
          <p>Hórario Marcado</p>
            <input
              className="form-visit__text small"
              type="time"
              placeholder="Digite o hórario marcado"
              autoComplete="off"
              {...register("chegada")}
              required
            />
          </label>
        <label className="form-visit__label">
          <p>Tempo de Visita</p>
            <input
              className="form-visit__text small"
              type="time"
              placeholder="Digite o hórario de saida"
              autoComplete="off"
              {...register("visita")}
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
              {...register("consultora")}
              disabled
            />
          </label>
          <div className="margin-top">
          <p>Técnico</p>
            <div className='radio'>
            {tecs && tecs.map((tec) => (
                  <div key={tec.id}>
                    <input {...register("tecnico")} id={tec.id} type="radio" value={tec.nome} required /><label htmlFor={tec.id}>{tec.nome}</label>
                  </div>
                ))}
            </div>
          </div>
        <input className='form-visit__btn' type="submit" value="ALTERAR"/>
      </form> 
        </div>

    </div>
  )
}


export default EditVisit