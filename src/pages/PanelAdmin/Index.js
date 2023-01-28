import { useEffect, useState } from 'react'
import { dataBase } from '../../firebase/database';

import Header from '../../components/Header/Index';

import { onSnapshot, collection } from "firebase/firestore";

import './_style.scss';
import CreateAdmin from '../../components/CreateAdmin/Index';

const PanelAdmin = ({ user }) => {
    const [members, setMembers] = useState();
    const [createAdmin, setCreateAdmin] = useState(undefined);
    const [schedules, setSchedules] = useState();
    const membersCollectionRef = collection(dataBase, "Membros");
    const schedulesCollectionRef = collection(dataBase, "Agendas");

    useEffect(() => {
        if(collection) { 
            const unsub = onSnapshot(membersCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let documents = [];
              schedules.forEach(doc => {
                documents.push({ ...doc.data(), id: doc.id })
              })
              setMembers(documents); // puxa a coleção 'Chats' para o state
            });
            
            return unsub;
          };
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collection]);

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

          console.log(schedules)

  const returnAdmin = () => {
    setCreateAdmin(false);
  }

  return (
    <div className='container-panel'>
      <Header user={user}></Header>
      <div className='title-panel'>
        <h2>Área Administrativa</h2>
      </div>
       <div className='content-panel'>
        <div className='box-panel'>
          <div className='box-panel__add'>
            <button onClick={() => setCreateAdmin(true)}><span className='icon-user'></span> Cadastrar novo Colaborador</button>
          </div>
          <div className='box-panel__users'>
          <h1>Colaboradores</h1>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Senha</th>
                <th>Cargo</th>
              </tr>
              </thead>
              <tbody>
              {members && members.map((member, index) => (
            <tr key={index}>
              <th>{member.nome}</th>
              <th>{member.email}</th>
              <th>{member.senha}</th>
              <th>{member.cargo}</th>
              </tr>
              ))}
              </tbody>
            
          </table>
          </div>
       </div>
      </div>
       {createAdmin && <CreateAdmin returnAdmin={returnAdmin} members={members}></CreateAdmin>}
    </div>

  )
}

export default PanelAdmin