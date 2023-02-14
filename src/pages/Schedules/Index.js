import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'; // import do hook
import { dataBase } from '../../firebase/database';

import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header/Index';

import { doc, onSnapshot, collection, deleteDoc } from "firebase/firestore";

import './_style.scss';
import CreateSchedule from '../../components/Modal/CreateSchedule/Index';
import Swal from 'sweetalert2';

const Schedules = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState();
    const navigate = useNavigate(); //chamado do hook
    const [createSchedule, setCreateSchedule] = useState(undefined);
    const schedulesCollectionRef = collection(dataBase, "Agendas");

    useEffect(() => {
        if(collection) { 
            // const q = query(membersCollectionRef); // Pega aos chats pela ordem descrescente do 'Created'
            const unsub = onSnapshot(schedulesCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let documents = [];
              schedules.forEach(doc => {
                documents.push({ ...doc.data(), id: doc.id })
              })
              setSchedules(documents); // puxa a coleção 'Chats' para o state
            });
            
            return unsub;
          };
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collection]);

  const returnSchedule = () => {
    setCreateSchedule(false);
    console.log('oi')
  }

  const goToSchedule = (year) => {
    navigate("/agenda/" + year);
  }

  const deleteSchedule = async (id) => {
    try {
      Swal.fire({
        title: "Infinit Energy Brasil",
        html: `Você deseja deletar essa <b>Agenda</b>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteDoc(doc(dataBase, "Agendas", id));
          Swal.fire({
            title: "Infinit Energy Brasil",
            html: `A Agenda <b>${id}</b> foi deletada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "#F39200"
          })
        }
      })
    } catch {

    }
  }

  return (
    <div className='container-schedules'>
      <Header user={user}></Header>
      <div className='title-schedule'>
        <h2>Agendas</h2>
      </div>
       <div className='content-schedule'>
        <div className='box-schedule'>
          {schedules && schedules.map((schedule, index) => (
            <li key={index} className='schedule'>
              {user.email === "admin@infinitenergy.com.br" &&
              <div className='schedule__button'>
                <button onClick={() => deleteSchedule(schedule.id)}></button>
              </div>
              }
              <div className='schedule__content' onClick={() => goToSchedule(schedule.id)}>
              <div className='schedule__text'>
                <p>Agenda</p>
                <p>{schedule.id}</p>
              </div>
              <div className='schedule__icon'></div>
              </div>
            </li>
          ))}
       </div>
       {user.email === "admin@infinitenergy.com.br" &&
       <div className='add-schedule'>
          <button onClick={() => setCreateSchedule(true)} className='add-schedule__btn'></button>
      </div>
       }
       
      </div>
      {createSchedule && <CreateSchedule returnSchedule={returnSchedule} schedules={schedules}></CreateSchedule>}
      
    </div>

  )
}

export default Schedules