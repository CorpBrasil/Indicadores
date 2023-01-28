import { addDoc } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react'
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import * as moment from 'moment';
import 'moment/locale/pt-br';

import useAuth from '../../hooks/useAuth';
import 'animate.css';

import { usePlacesWidget } from "react-google-autocomplete";
import { DistanceMatrixService, GoogleMap, useLoadScript } from '@react-google-maps/api';


import './../../styles/_visit.scss';

const CreateVisit = ({ returnSchedule, scheduleRef, membersRef, userRef}) => {
  const { user } = useAuth();
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [check, setCheck] = useState(false);
  const [rotaTempo, setRotaTempo] = useState(undefined);
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
          let diaRef, saidaEmpresaRef, chegadaClienteRef, TempoVisita, SaidaClienteRef, ChegadaEmpresaRef, tempoRotaRef;
          const saida = userData.saida;
          moment.locale('pt-br');
          console.log(moment.locale())
          const tempo = moment(userData.visita, 'hh:mm');
          saidaEmpresaRef = saida;

          const saidaF = moment(saida, 'hh:mm'); //Horario de saida 
          const day = moment(userData.dia); // Pega o dia escolhido

          diaRef = day.format('YYYY MM DD');

          saidaF.add(rotaTempo + 600, "seconds").format('hh:mm'); // Adiciona o tempo de viagem ida
          
          TempoVisita = userData.visita;

          const saidaH = saidaF.format('kk'); // Transforma em horas
          const saidaM = saidaF.format('mm'); // Trabsforma em minutos


          day.set({'hour': saidaH, 'minute': saidaM})
          chegadaClienteRef = day.format('kk:mm');

          const tempoVisitaH = tempo.format('hh');
          const tempoVisitaM = tempo.format('mm');
          
          day.add(tempoVisitaH, 'h'); 
          day.add(tempoVisitaM, 'm');
          SaidaClienteRef = day.format('kk:mm');

          day.add(rotaTempo + 600, "seconds").format('hh:mm'); //Adiciona tempo de viagem volta
          ChegadaEmpresaRef = day.format('kk:mm');
          tempoRotaRef = rotaTempo + 600;

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
    } catch (error) {
      console.log(error)
    } 
    }

  return (
    <div className='modal-Visit'>
       <div className='box-Visit animate__animated'>
            <div className='box-Visit__close'>
                <button onClick={returnSchedule} className='btn-close' />
            </div>
            <h4>Criar Visita</h4> 
        <form className='form-Visit' onSubmit={handleSubmit(onSubmit)}>
          <div className='form-Visit__double'>
          <label className="form-Visit__label">
            <p>Dia</p>
              <input
                className="form-Visit__text small"
                type="date"
                placeholder="Digite o dia"
                autoComplete="off"
                {...register("dia")}
                required
              />
            </label>
          <label className="form-Visit__label">
            <p>Cidade</p>
              <input
                className="form-Visit__text small"
                onBlur={() => setCheck(true)}
                placeholder="Digite a cidade"
                ref={ref}
                required
              />
            </label>
          </div>
        <div className='form-Visit__double'>
        <label className="form-Visit__label">
          <p>Hórario de Saida</p>
            <input
              className="form-Visit__text small"
              type="time"
              placeholder="Digite o hórario de saida"
              autoComplete="off"
              {...register("saida")}
              required
            />
          </label>
        <label className="form-Visit__label">
          <p>Tempo de Visita</p>
            <input
              className="form-Visit__text small"
              type="time"
              placeholder="Digite o hórario de saida"
              autoComplete="off"
              {...register("visita")}
              required
            />
          </label>
        </div>
        <label className="form-Visit__label">
          <p>Consultora</p>
            <input
              className="form-Visit__text"
              type="text"
              autoComplete="off"
              {...register("consultora", {
                value: user.name
              })}
              disabled
            />
          </label>
          
        <div className="form-Visit__label margin-top">
          <p>Técnico</p>
            <div className='radio'>
            {tecs && tecs.map((tec) => (
              <div key={tec.id}>
                <input {...register("tecnico")} id={tec.id} type="radio" value={tec.nome} required /><label htmlFor={tec.id}>{tec.nome}</label>
              </div>
                ))}
            </div>
          </div>
        <input className='form-Visit__btn' type="submit" value="CRIAR"/>
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
           origins: [{lng:-47.7143335, lat:-23.0995635}],
           travelMode: "DRIVING",
         }}
         callback = {(response, status) => {
            if(status === 'OK') {
              console.log(response)
              if(rotaTempo !== response?.rows[0].elements[0].duration.value) {
                setRotaTempo(response?.rows[0].elements[0].duration.value);
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