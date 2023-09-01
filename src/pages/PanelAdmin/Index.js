import { useEffect, useState } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import { onSnapshot, collection } from "firebase/firestore";

// Css
import "cooltipz-css";
import styles from "./style.module.scss";

// Components
import CreateAdmin from "../../components/Modal/Admin/Create/Index";
import EditAdmin from "../../components/Modal/Admin/Edit/Index";
import { ReactComponent as Admin } from '../../images/icons/Admin.svg';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

const PanelAdmin = ({ user, alerts, userRef }) => {
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

  const returnAdmin = () => {
    setCreateAdmin(false);
    setEditAdmin(false);
  };

  return (
    <div className={styles.container_panel}>
      <Header user={user} alerts={alerts} userRef={userRef}></Header>
      <div className={styles.title_panel}>
        <Admin style={{ width: '42px', height: '42px', marginBottom: '0.5rem' }} />
        <h2>Área Administrativa</h2>
      </div>
      <div className={styles.content_panel}>
        <div className={styles.box_panel}>
            <h1>Colaboradores</h1>
          <div className={styles.box_panel__add}>
            <button onClick={() => setCreateAdmin(true)}>
              <AccountCircleIcon className={styles.icon_user} /> 
              <p>Cadastrar novo Colaborador</p>
            </button>
          </div>
          <div className={styles.box_panel__users}>
          <TableContainer className={styles.table_center} component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Nome</TableCell>
                  <TableCell align="center">Cor</TableCell>
                  <TableCell align="center" padding="none">Email</TableCell>
                  <TableCell align="center">Senha</TableCell>
                  <TableCell align="center">Cargo</TableCell>
                  <TableCell align="center">Veiculo</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members && members.map((member) => (
                  <TableRow
                    hover
                    key={member.id}
                    className={`list-visit`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                     <TableCell align="center">{member.nome}</TableCell>
                      <TableCell style={member.cor && {
                            backgroundColor: member.cor
                          }}></TableCell>
                      <TableCell align="center">{member.email}</TableCell>
                      <TableCell align="center">{member.senha}</TableCell>
                      <TableCell align="center">{member.cargo}</TableCell>
                      <TableCell align="center">{member.veiculo}</TableCell>
                      <TableCell align="center">{member.veiculo ? 
                          (<IconButton
                            id="basic-button"
                            onClick={() => {
                              setMemberRef(member);
                              return setEditAdmin(true);
                            }}
                            aria-label="Editar Veiculo"
                            data-cooltipz-dir="left"
                          >
                            <EditIcon sx={{ fill: '#000' }} />
                          </IconButton>) : null
                        }
                        {member.cargo !== "Técnico" ? 
                          (<IconButton
                            id="basic-button"
                            onClick={() => {
                              setMemberRef(member);
                              return setEditAdmin(true);
                            }}
                            aria-label="Editar Cor"
                            data-cooltipz-dir="left"
                          >
                            <EditIcon />
                          </IconButton>) : null
                        }</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
