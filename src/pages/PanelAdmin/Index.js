import { useEffect, useState } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import { onSnapshot, collection } from "firebase/firestore";

// Css
import "cooltipz-css";
import "./_style.scss";

// Components
import CreateAdmin from "../../components/Modal/Admin/Create/Index";
import EditAdmin from "../../components/Modal/Admin/Edit/Index";

const PanelAdmin = ({ user }) => {
  const [members, setMembers] = useState();
  const [memberRef, setMemberRef] = useState();
  const [createAdmin, setCreateAdmin] = useState(undefined);
  const [editAdmin, setEditAdmin] = useState(undefined);
  const membersCollectionRef = collection(dataBase, "Membros");

  useEffect(() => {
    if (collection) {
      const unsub = onSnapshot(membersCollectionRef, (schedules) => {
        // Atualiza os dados em tempo real
        let documents = [];
        schedules.forEach((doc) => {
          documents.push({ ...doc.data(), id: doc.id });
        });
        setMembers(documents); // puxa a coleção 'Chats' para o state
      });

      return unsub;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  // useEffect(() => {
  //   if (collection) {
  //     // const q = query(membersCollectionRef); // Pega aos chats pela ordem descrescente do 'Created'
  //     const unsub = onSnapshot(schedulesCollectionRef, (schedules) => {
  //       // Atualiza os dados em tempo real
  //       let documents = [];
  //       schedules.forEach((doc) => {
  //         documents.push({ ...doc.data(), id: doc.id });
  //       });
  //       setSchedules(documents); // puxa a coleção 'Chats' para o state
  //     });

  //     return unsub;
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [collection]);

  // console.log(schedules);

  const returnAdmin = () => {
    setCreateAdmin(false);
    setEditAdmin(false);
  };

  return (
    <div className="container-panel">
      <Header user={user}></Header>
      <div className="title-panel">
        <h2>Área Administrativa</h2>
      </div>
      <div className="content-panel">
        <div className="box-panel">
          <div className="box-panel__add">
            <button onClick={() => setCreateAdmin(true)}>
              <span className="icon-user"></span> Cadastrar novo Colaborador
            </button>
          </div>
            <h1>Colaboradores</h1>
          <div className="box-panel__users">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cor</th>
                  <th>Email</th>
                  <th>Senha</th>
                  <th>Cargo</th>
                  <th>Veiculo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {members &&
                  members.map((member, index) => (
                    <tr key={index}>
                      <td>{member.nome}</td>
                      <td style={member.cor && {
                            backgroundColor: member.cor
                          }}></td>
                      <td>{member.email}</td>
                      <td>{member.senha}</td>
                      <td>{member.cargo}</td>
                      <td>{member.veiculo}</td>
                      <td>{member.veiculo ? 
                          (<button
                            onClick={() => {
                              setMemberRef(member);
                              return setEditAdmin(true);
                            }}
                            className="btn-edit"
                            aria-label="Editar Veiculo"
                            data-cooltipz-dir="left"
                          ></button>) : null
                        }
                        {member.cargo !== "Técnico" ? 
                          (<button
                            onClick={() => {
                              setMemberRef(member);
                              return setEditAdmin(true);
                            }}
                            className="btn-edit-color"
                            aria-label="Editar Cor"
                            data-cooltipz-dir="left"
                          ></button>) : null
                        }</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {createAdmin && (
        <CreateAdmin returnAdmin={returnAdmin} members={members}></CreateAdmin>
      )}
      {editAdmin && (
        <EditAdmin returnAdmin={returnAdmin} memberRef={memberRef}></EditAdmin>
      )}
    </div>
  );
};

export default PanelAdmin;
