import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { memo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Select from 'react-select'
import * as moment from "moment";
import "moment/locale/pt-br";

import { Company } from "../../../data/Data";
import { dataBase } from "../../../firebase/database";

import { ReactComponent as WhatsApp } from '../../../images/icons/WhatsApp.svg';
import { ReactComponent as Phone } from '../../../images/icons/Phone.svg';
import { ReactComponent as Email } from '../../../images/icons/Mail.svg';

import "../style.scss";

const CreateProspection = ({
  returnPage,
  userRef,
  changeLoading
}) => {
  //const { user } = useAuth();
  // const chegadaFormatadaTec = useRef();
  // const saidaFormatadaTec = useRef();
  const { register, handleSubmit } = useForm();
  const [atividade, setAtividade] = useState('Email');
  const options = [
    { value: 'Email', label: (<div className="circle-icon"><Email className="mail" />Email</div>) },
    { value: 'Ligação', label: (<div className="circle-icon"><Phone className="phone" />Ligação</div>) },
    { value: 'WhatsApp', label: (<div className="circle-icon"><WhatsApp className="whatsapp" />WhatsApp</div>) }
  ];

  
  // console.log(schedule)

  // useEffect(() => { // Seleciona a visita de acordo com o tipo escolhido
  //   const lunch = () => {
  //     if(type === 'lunch') {
  //       setCheckInput(true);
  //       setVisitaNumero(3600);
  //       //setTecnicoTexto(tecs[0].nome);
  //     }
  //     switch (type) {
  //       case 'lunch':
  //         setDriver(tecs.filter((ref) => ref.nome === userRef.nome))
  //         //setVisits(schedule.filter((ref) => ref.tecnico === "Bruna" || ref.tecnico === "Lia"))
  //         setTecnicoTexto(userRef.nome);
  //         //driverRef.current = 'Bruna';
  //         break
  //       case 'comercial':
  //         setDriver(tecs.filter((ref) => ref.nome === "Bruna" || ref.nome === "Lia"))
  //         //setVisits(schedule.filter((ref) => ref.tecnico === "Bruna" || ref.tecnico === "Lia"))
  //         setTecnicoTexto('Bruna');
  //         //driverRef.current = 'Bruna';
  //         break
  //       case 'comercial_tecnica':
  //         setDriver(tecs.filter((ref) => ref.nome === "Lucas" || ref.nome === "Luis"))
  //         //setVisits(schedule.filter((ref) => ref.tecnico === "Lucas"))
  //         setTecnicoTexto('Lucas');
  //         //driverRef.current = 'Lucas';
  //         break
  //       case 'pos_venda':
  //         setDriver(tecs.filter((ref) => ref.nome === "Lucas" || ref.nome === "Luis"))
  //         setTecnicoTexto('Lucas');
  //         setConsultoraTexto('Pós-Venda')
  //         break
  //       default:
  //         setDriver(tecs)
  //         setVisits(schedule)
  //     }
  //     // console.log(consultora)
  //   };
  //   lunch();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   if(dataTexto) {
  //     const visitsData = schedule.filter((visit) => visit.data === dataTexto);
  //     if (visitsData && dataTexto.substring(8,10) !== "00") {
  //       setVisits(visitsData);
  //     }
  //   } else {
  //     setVisits(schedule);
  //   }
  // },[dataTexto, schedule])

  // useEffect(() => {
  //   // let visitsType = schedule.filter((visit) => visit.tecnico === "Lucas" && visit.tecnico === "Luis");
  //   let visitsData;
  //   let visitsType;
  //   switch (type) {
  //     case 'comercial':
  //       visitsData = schedule.filter((visit) => visit.data === dataTexto && (visit.tecnico !== "Lucas" && visit.tecnico !== "Luis"));
  //       visitsType = schedule.filter((visit) => visit.tecnico !== "Lucas" && visit.tecnico !== "Luis")
  //       break
  //     case 'lunch':
  //       visitsData = schedule.filter((visit) => visit.data === dataTexto);
  //       visitsType = schedule;
  //       break
  //     default:
  //       visitsData = schedule.filter((visit) => visit.data === dataTexto && (visit.tecnico === "Lucas" || visit.tecnico === "Luis" || visit.categoria === 'lunch'));
  //       visitsType = schedule.filter((visit) => visit.tecnico === "Lucas" || visit.tecnico === "Luis" || visit.categoria === 'lunch')
  //   }
  //   if(dataTexto) {
  //     if (visitsData && dataTexto.substring(8,10) !== "00") {
  //       setVisits(visitsData);
  //     }
  //   } else {
  //     setVisits(visitsType);
  //     // console.log(schedule.filter((visit) => visit.tecnico !== "Lucas" && visit.tecnico !== "Luis"))
  //     // console.log(dataTexto)
  //   }
  // },[dataTexto, schedule, type])

  // useEffect(() => {
  //   // console.log(visitaNumero);
  //   if (horarioTexto && visitaNumero) {
  //     moment.locale("pt-br");

  //     const saidaEmpresa = moment(horarioTexto, "hh:mm"); //Horario de chegada
  //     const chegadaCliente = moment(horarioTexto, "hh:mm"); //Horario de chegada

  //     saidaEmpresa.subtract(rotaTempo, "seconds").format("hh:mm"); // Pega o tempo que o tecnico vai precisar sair da empresa

  //     setSaidaTexto(saidaEmpresa.format("kk:mm"));

  //     chegadaCliente.add(visitaNumero, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
  //     setSaidaCliente(chegadaCliente.format("kk:mm"));
  //     chegadaCliente.add(rotaTempo, "seconds").format("hh:mm"); //Adiciona tempo de viagem volta
  //     // console.log(chegadaCliente)
  //     setChegadaTexto(chegadaCliente.format("kk:mm"));
  //   }

  //   let saidaEmpresaRef, ChegadaEmpresaRef;
  //     moment.locale("pt-br");
  //     saidaEmpresaRef = saidaTexto;
  //     ChegadaEmpresaRef = chegadaTexto;

  //     const saidaFormatada = moment(saidaEmpresaRef, "hh:mm");
  //     const chegadaFormatada = moment(ChegadaEmpresaRef, "hh:mm");
  //     let check = [];
  //     let visitsFindData = [];


  //     const dataRef = schedule.filter(
  //       (dia) => dia.data === dataTexto && (dia.tecnico === tecnicoTexto || (type === 'lunch' && dia.consultora === tecnicoTexto))
  //     );

  //       // console.log(dataRef)


  //       dataRef.map((ref) => {
  //         // console.log("eae");
  //         if (
  //           saidaFormatada <= moment(ref.saidaEmpresa, "hh:mm") &&
  //           chegadaFormatada <= moment(ref.saidaEmpresa, "hh:mm")
  //         ) {
  //           check.push(ref);
  //         } else {
  //           if (saidaFormatada >= moment(ref.chegadaEmpresa, "hh:mm"))
  //             check.push(ref);
  //         }
  //         return dataRef;
  //       });
  //     // console.log(visitsFindCount);

  //     dataRef.map((a) => {
  //       //Percorre todos os arrays de 'dataRef' e compara se os arrays são iguais
  //       if (check.includes(a) === false) {
  //         visitsFindData.push(a);
  //       }
  //       return setVisitsFind(visitsFindData);
  //     });
  //     setVisitsFindCount(dataRef.length - check.length)

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [horarioTexto, visitaNumero, chegadaTexto, saidaTexto, rotaTempo, city]);
  

  const onSubmit = async (userData) => {
    //const docRef = doc(dataBase, 'Atividades', userRef.uid);
    const day = moment();
    console.log(moment(day).format('DD MMM YYYY - HH:mm'))
    try {
      Swal.fire({
        title: Company,
        html: `Você deseja registrar a <b>Atividade?</b>`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          changeLoading(true);
          await addDoc(collection(dataBase, 'Atividades'), {
            ...userData,
            atividade: atividade.value,
            consultora: userRef.nome,
            data: moment(day).format('DD MMM YYYY - HH:mm'),
            createAt: serverTimestamp(),
            uid: userRef.uid
          })
          axios.post('https://n8n.corpbrasil.cloud/webhook/d490a21a-4488-4907-871f-b4326209c05a', {
            ...userData,
            atividade: atividade.value,
            consultora: userRef.nome,
          }).then(() => {
            changeLoading(false);
            Swal.fire({
              title: Company,
              html: `A Atividade foi registrada com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            }).then(() => {
              return returnPage();
            })
          })
        }})
    } catch {

    }
  };

  // const createVisitDay = async (data) => {
  //   try {
  //     if(checkNet) {
  //       Swal.fire({
  //         title: 'Sem Conexão',
  //         icon: "error",
  //         html: `Não é possível Criar uma Visita <b>sem internet.</b> Verifique a sua conexão.`,
  //         confirmButtonText: "Fechar",
  //         showCloseButton: true,
  //         confirmButtonColor: "#d33"  
  //       })
  //     }
  //      else {
  //       // await addDoc(scheduleRef, data);
  //       // console.log(data)
  //       const date = new Date(data.data);
  //       Swal.fire({
  //        title: Company,
  //        html: `A visita em <b>${city}</b> foi criada com sucesso!`,
  //        icon: "success",
  //        showConfirmButton: true,
  //        showCloseButton: true,
  //        confirmButtonColor: "#F39200",
  //      })
  //      if(data.categoria !== 'lunch') {
  //        axios.post('https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/45898/Z8sTf2Pi46I1/', {
  //          data: moment(data.data).format("DD.MM.YYYY"),
  //          nome: data.tecnico,
  //          cliente: data.cliente,
  //          endereco: data.endereco,
  //          saida: data.saidaEmpresa,
  //          marcado: data.chegadaCliente,
  //          chegada: data.chegadaEmpresa,
  //          tipo: data.tipo,
  //          consultora: data.consultora,
  //          telefone: "5515991832181",
  //          lat: data.lat,
  //          lng: data.lng,
  //          duracao: data.visita,
  //          saidaCliente: data.saidaDoCliente,
  //          categoria: data.categoria
  //        })
  //      }
  //      axios.post('https://hook.us1.make.com/tmfl4xr8g9tk9qoi9jdpo1d7istl8ksd', {
  //          data: moment(data.data).format("DD/MM/YYYY"),
  //          nome: data.tecnico,
  //          cliente: data.cliente,
  //          saida: data.saidaEmpresa,
  //          marcado: data.chegadaCliente,
  //          consultora: data.consultora,
  //          city: city,
  //          duracao: data.visita,
  //          saidaCliente: data.saidaDoCliente,
  //          mes: moment(data.data).format("M"),
  //          ende: data.endereco,
  //          confirmada: 'Não',
  //          categoria: data.categoria
  //        })
   
  //     return returnPage();
  //     }
  //   } catch (e) {
  //     console.error('SEM CONEXÃO', e)
  //   }
  // }

  return (
    <div className="box-visit">
      <div className="box-visit__box">
        <div className="box-visit__close">
          <button onClick={returnPage} className="btn-close" />
        </div>
        <h4>Registrar Atividade</h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="box-visit__container">
          <div className="box-visit__form"> 
                <><label className="label">
                  <p>Atividade</p>
                  <Select
                    required
                    className="select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        boxShadow: "none",
                        border: state.isFocused && "none"
                      }),
                      menu: (provided) => ({
                        ...provided,
                        border: "none",
                        boxShadow: "none"
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused && "#313131",
                        color: state.isFocused && "white"
                      })
                    }}
                    placeholder="Selecione uma atividade"
                    onChange={(e) => setAtividade(e)}
                    options={options}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        neutral0: '#eee',
                        primary25: '#e4e4e4',
                        primary: '#313131',
                        primary50: '#313131',
                      }
                    })} />
                </label><label className="label">
                    <p>Empresa</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite uma observação"
                      autoComplete="off"
                      required
                      {...register("empresa")} />
                  </label><label className="label">
                    <p>Responsável</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite uma observação"
                      autoComplete="off"
                      required
                      {...register("responsavel")} />
                  </label><label className="label">
                    <p>Cidade</p>
                    <input
                      className="label__input"
                      type="text"
                      placeholder="Digite uma observação"
                      autoComplete="off"
                      required
                      {...register("cidade")} />
                  </label><label className="label-max">
                    <p>Anotação</p>
                    <textarea
                      className="label__textarea"
                      type="text"
                      placeholder="Digite uma observação"
                      autoComplete="off"
                      required
                      {...register("anotacao")} />
                  </label></>
          </div>
          </div>
          <input className="box-visit__btn" type="submit" value="CRIAR" />
        </form>
      </div>
    </div>
  );
};

export default memo(CreateProspection);
