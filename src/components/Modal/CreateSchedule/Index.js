import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useForm } from "react-hook-form"; // cria formulário personalizado
import Swal from "sweetalert2"; // cria alertas personalizado
import { dataBase } from '../../../firebase/database';

import '../_modal.scss';

const CreateSchedule = ({ returnSchedule, schedules }) => {

  const {
    register,
    handleSubmit,
  } = useForm();

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const onSubmit = (userData) => {
    console.log(schedules.length);
    if (schedules.length > 0) {
      const findSchedule = schedules.find(schedule => schedule.id === userData.ano);
      if (findSchedule) {
        return Swal.fire({
          title: "Infinit Energy Brasil",
          html: `Já existe a <b>Agenda ${userData.ano}</b> no sistema.`,
          icon: "warning",
          showConfirmButton: true,
          confirmButtonColor: "#F39200",
        });
      } else {
        try {
          Swal.fire({
            title: "Infinit Energy Brasil",
            text: `Você deseja criar uma nova Agenda?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              // const docRef = doc(dataBase, "chats", userData.ano);
              // const colRef = collection(docRef, 'Janeiro');
              await setDoc(doc(dataBase, "Agendas", userData.ano), {ano:userData.ano})
              await setDoc(doc(dataBase, "Financeiro", userData.ano), {ano:userData.ano})
              // await addDoc(collection(docRef, 'Janeiro'), {ano:userData.ano});
              const scheduleRefYear = doc(dataBase, "Agendas", userData.ano);
              const financeScheduleRefYear = doc(dataBase, "Financeiro", userData.ano);
                for (let value of months) {
                  const colScheduleRef = collection(scheduleRefYear, value);
                  const colScheduleRefFinance = collection(financeScheduleRefYear, value);
                  await addDoc(colScheduleRef, {
                    mes: value,
                  })
                  await addDoc(colScheduleRefFinance, {
                    mes: value,
                  })
                }

              Swal.fire({
                title: "Infinit Energy Brasil",
                html: `A <b>Agenda ${userData.ano}</b> foi criada com sucesso.`,
                icon: "success",
                showConfirmButton: true,
                confirmButtonColor: "#F39200"
              }).then((result) => {
                if (result.isConfirmed) {
                  returnSchedule();
                }
              })
            }
          })
        } catch (error) {
          console.log(error);
        }
      }
    }
    
  }

  return (
    <div className='modal-visit'>
       <div className='modal-box-visit'>
            <div className='modal-box-visit__close'>
                <button onClick={returnSchedule} className='btn-close' />
            </div>
            <h4>Criar nova Agenda</h4> 
        <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
          <label className="form-visit__label">
          <input
                    className="form-visit__text"
                    type="number"
                    min={2023}
                    max={2999}
                    placeholder="Digite o ano"
                    {...register("ano")}
                    required
                  />
          </label>
        <input className='form-visit__btn' type="submit" value="CRIAR"/>
      </form> 
        </div> 
        
    </div>
  )
}

export default CreateSchedule