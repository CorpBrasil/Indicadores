import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Company } from '../data/Data';
import { addDoc } from "firebase/firestore";
import axios from 'axios';
import moment from 'moment';

function useVisit(checkNet, scheduleRef, returnSchedule) {

    function getMonthlyWeekNumber(dt) {
        // como função interna, permite reuso
        var getmonweek = function(myDate) {
            var today = new Date(myDate.getFullYear(),myDate.getMonth(),myDate.getDate(),0,0,0);
            var first_of_month = new Date(myDate.getFullYear(),myDate.getMonth(),1,0,0,0);
            var p = Math.floor((today.getTime()-first_of_month.getTime())/1000/60/60/24/7);
            // ajuste de contagem
            if (today.getDay()<first_of_month.getDay()) ++p;
            // ISO 8601.
            if (first_of_month.getDay()<=3) p++;
            return p;
        }
        // último dia do mês
        var udm = (new Date(dt.getFullYear(),dt.getMonth()+1,0,0,0,0)).getDate();
        /*  Nos seis primeiros dias de um mês: verifica se estamos antes do primeiro Domingo.
         *  Caso positivo, usa o último dia do mês anterior para o cálculo.
         */
        if ((dt.getDate()<7) && ((dt.getDate()-dt.getDay())<-2))
            return getmonweek(new Date(dt.getFullYear(),dt.getMonth(),0));
        /*  Nos seis últimos dias de um mês: verifica se estamos dentro ou depois do último Domingo.
         *  Caso positivo, retorna 1 "de pronto".
         */
        else if ((dt.getDate()>(udm-6)) && ((dt.getDate()-dt.getDay())>(udm-3)))
            return 1;
        else
            return getmonweek(dt);
    }


    const createVisit = async (data) => {
        try {
          if(checkNet) {
            Swal.fire({
              title: 'Sem Conexão',
              icon: "error",
              html: `Não é possível Criar uma Visita <b>sem internet.</b> Verifique a sua conexão.`,
              confirmButtonText: "Fechar",
              showCloseButton: true,
              confirmButtonColor: "#d33"  
            })
          }
           else {
            let endereco;
            const date = new Date(data.data);
            await addDoc(scheduleRef, data).then((result) => {
              axios.post('https://n8n.corpbrasil.cloud/webhook/dfbbb99b-1721-4a7d-8ac0-f95335b15aa7', {
                data: moment(data.data).format("DD/MM/YYYY"),
                ID: result.id,
                nome: data.tecnico,
                cliente: data.cliente,
                saida: data.saidaEmpresa,
                marcado: data.chegadaCliente,
                consultora: data.consultora,
                city: data.cidade,
                duracao: data.visita,
                saidaCliente: data.saidaDoCliente,
                semana: getMonthlyWeekNumber(date),
                mes: moment(data.data).format("M"),
                ende: data.endereco,
                confirmada: 'Não',
                categoria: data.categoria,
                extra: data.preData
              })
            }
            );
            Swal.fire({
             title: Company,
             html: `A visita em <b>${data.cidade}</b> foi criada com sucesso!`,
             icon: "success",
             showConfirmButton: true,
             showCloseButton: true,
             confirmButtonColor: "#F39200",
            })
            if(data.endereco.length < 3) {
             endereco = data.cidade;
            } else {
             endereco = data.endereco;
            }
            if(data.categoria !== 'lunch') {
             axios.post('https://backend.botconversa.com.br/api/v1/webhooks-automation/catch/45898/Z8sTf2Pi46I1/', {
               data: moment(data.data).format("DD.MM.YYYY"),
               nome: data.tecnico,
               cliente: data.cliente,
               endereco: endereco,
               saida: data.saidaEmpresa,
               marcado: data.chegadaCliente,
               chegada: data.chegadaEmpresa,
               tipo: data.tipo,
               consultora: data.consultora,
               telefone: "5515991832181",
               lat: data.lat,
               lng: data.lng,
               duracao: data.visita,
               saidaCliente: data.saidaDoCliente,
               categoria: data.categoria
             })
           }

             return returnSchedule();
          }
        } catch (e) {
          console.error('SEM CONEXÃO', e)
        }
      }

  return {createVisit}
}

export default useVisit