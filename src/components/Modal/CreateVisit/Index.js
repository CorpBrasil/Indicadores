import { addDoc } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from 'moment';
import 'moment/locale/pt-br';

import useAuth from '../../../hooks/useAuth';
import 'animate.css';

import { usePlacesWidget } from "react-google-autocomplete";
import { DistanceMatrixService, GoogleMap, useLoadScript } from '@react-google-maps/api';


import '../_modal.scss';

const CreateVisit = ({ returnSchedule, scheduleRef, membersRef, userRef, schedule, monthNumber}) => {
  const { user } = useAuth();
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [check, setCheck] = useState(false);
  const [rotaTempo, setRotaTempo] = useState(undefined);
  const [tempoTexto, setTempoTexto] = useState(undefined);
  const [city, setCity] = useState();
  const [ libraries ] = useState(['places']);
  const [ tecs, setTecs] = useState();

  const {
    register,
    handleSubmit
  } = useForm();

  useEffect(() => {
    const find= () => {
      setTecs(membersRef.filter(member => member.cargo === 'Técnico'));
    }

    find();
  },[membersRef])
  
  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD1WsJJhTpdhTIVLxxXCgdlV8iYfmOeiC4",
    libraries,
  });

  const { ref } = usePlacesWidget({
    apiKey: "AIzaSyD1WsJJhTpdhTIVLxxXCgdlV8iYfmOeiC4",
    onPlaceSelected: (place) => {
      setCity(place.address_components[0].long_name);
      setLat(place.geometry?.location?.lat());
      setLng(place.geometry?.location?.lng());

    },
    options: {
      types: ["(regions)"],
      componentRestrictions: { country: "br" },
    },
  });

  const onSubmit = async (userData) => {

    try {
      let tecRefUID = tecs.find(tec => tec.nome === userData.tecnico)
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

          saidaEmpresa.subtract(rotaTempo, "seconds").format('hh:mm'); // Pega o tempo que o tecnico vai precisar sair da empresa
          
          TempoVisita = userData.visita;
          saidaEmpresaRef = saidaEmpresa.format('kk:mm');

          const tempoVisitaH = tempo.format('hh');
          const tempoVisitaM = tempo.format('mm');
          
          chegadaCliente.add(tempoVisitaH, 'h'); 
          chegadaCliente.add(tempoVisitaM, 'm');
          SaidaClienteRef = chegadaCliente.format('kk:mm');

          chegadaCliente.add(rotaTempo, "seconds").format('hh:mm'); //Adiciona tempo de viagem volta
          ChegadaEmpresaRef = chegadaCliente.format('kk:mm');
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
            cidade: city
          })

      const saidaFormatada = moment(saidaEmpresaRef, 'hh:mm');
      const chegadaFormatada = moment(ChegadaEmpresaRef, 'hh:mm');
      const dataRef = schedule.filter(dia => dia.data === userData.dia);

        console.log(tempo);
        const check = [];
        let visitsFind = [];
        dataRef.map((ref) => {
          if(saidaFormatada < moment(ref.saidaEmpresa, 'hh:mm') && chegadaFormatada < moment(ref.saidaEmpresa, 'hh:mm')) {
              check.push(ref);
            } else {
              if(saidaFormatada > moment(ref.chegadaEmpresa, 'hh:mm'))
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
            confirmar: false
           })

          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Visita em <b>${city}</b> foi cadastrada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200"
          }).then((result) => {
            if (result.isConfirmed) {
                setCheck(false);
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
            <h4>Criar Visita</h4> 
        <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
          <div className='form-visit__double'>
          <label className="form-visit__label">
            <p>Dia</p>
              <input
                className="form-visit__text small"
                type="date"
                min={monthNumber && monthNumber.min}
                max={monthNumber && monthNumber.max}
                placeholder="Digite o dia"
                autoComplete="off"
                {...register("dia")}
                required
              />
            </label>
          <label className="form-visit__label">
            <p>Cidade</p>
              <input
                className="form-visit__text small"
                onBlur={() => setCheck(true)}
                placeholder="Digite a cidade"
                ref={ref}
                required
              />
              {tempoTexto && tempoTexto && <p className='notice'>Tempo de rota: {tempoTexto}</p>}
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
              {...register("consultora", {
                value: user.name
              })}
              disabled
            />
          </label>
          
        <div className="form-visit__label margin-top">
          <p>Técnico</p>
            <div className='radio'>
            {tecs && tecs.map((tec) => (
              <div key={tec.id}>
                <input {...register("tecnico")} id={tec.id} type="radio" value={tec.nome} /><label htmlFor={tec.id}>{tec.nome}</label>
              </div>
                ))}
            </div>
          </div>
        <input className='form-visit__btn' type="submit" value="CRIAR"/>
      </form> 
        </div>

       {isLoaded && check === true ? (
        <GoogleMap
        zoom={10}
        center= {{ lat: -27.598824, lng: -48.551262 }}
        >
          <DistanceMatrixService
          options={{
           destinations: [{lat:lat, lng:lng}],
           origins: [{lng:-47.6973284, lat:-23.0881786}],
           travelMode: "DRIVING",
         }}
         callback = {(response, status) => {
            if(status === 'OK') {
              console.log(response)
              if(rotaTempo !== response?.rows[0].elements[0].duration.value) {
                setRotaTempo(response?.rows[0].elements[0].duration.value);
                setTempoTexto(response?.rows[0].elements[0].duration.text);
              }
            }
        }}
          />
        </GoogleMap>
      ) : (<></>)}

    </div>
  )
}


export default memo(CreateVisit)