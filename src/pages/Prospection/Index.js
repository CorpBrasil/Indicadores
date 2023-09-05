import { useState, useEffect } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Company } from "../../data/Data";
import { doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Css
import "cooltipz-css";
import styles from "./style.module.scss";
import '../../styles/_filter.scss';
// import { theme } from "../../data/theme"
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';

// Components
import CreateProspection from "../../components/Box/CreateProspection/Index";
import Filter from "../../components/Filter/Index";

import { ReactComponent as ProspectionIcon } from '../../images/icons/Prospection.svg';
import { ReactComponent as Email } from '../../images/icons/Mail.svg';
import { ReactComponent as Phone } from '../../images/icons/Phone.svg';
import { ReactComponent as WhatsApp } from '../../images/icons/WhatsApp.svg';
import { ReactComponent as CheckIcon } from "../../images/icons/Check.svg";
import { ReactComponent as BlockIcon } from "../../images/icons/Block.svg";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import { Box } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';


const Prospection = ({ user, activity, userRef, members, sellers }) => {
  const [anotacao, setAnotacao] = useState('');
  const [view, setView] = useState(false);
  const [viewEdit, setViewEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activityUser, setActivityUser] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [sellersOrder, setSellersOrder] = useState(null);

  useEffect(() => {
    if(sellers) {
      setSellersOrder(sellers.sort((a,b) => {
        if(a.nome< b.nome) return -1;
        if(a.nome > b.nome) return 1;
        return 0;
      }))
    }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sellers]
  );

  const changeFilter = (data) => {
    setActivityUser(data);
  }
  
  const returnPage = () => {
    setView(false);
  };

  const changeLoading = (data) => {
    setLoading(data);
  };

  useEffect(() => {
    if(userRef && userRef.cargo === 'Vendedor(a)') {
      setActivityUser(activity.filter((act) => act.uid === user.id))
    } else if(userRef && userRef.cargo !== 'Vendedor(a)') {
      setActivityUser(activity);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activity,userRef])


  const handleToggle = (id) => {
    setOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const confirmEdit = async(data) => {
    try {
      const docRef = doc(dataBase, 'Atividades', data);
      Swal.fire({
        title: Company,
        html: `Você deseja alterar a <b>Atividade?</b>`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if(result.isConfirmed) {
          await updateDoc(docRef, {
            anotacao: anotacao,
            updateAt: serverTimestamp()
          }).then((result) => {
            Swal.fire({
              title: Company,
              html: `A Atividade foi alterada com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
            setViewEdit(null)
          });
        }
      })
    } catch(error) {
      console.log(error)
    }
  }

  const DeleteActivity = async (data) => {
    try {
      const docRef = doc(dataBase, 'Atividades', data);
      Swal.fire({
        title: Company,
        html: `Você deseja deletar a <b>Atividade?</b>`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if(result.isConfirmed) {
          await deleteDoc(docRef).then((result) => {
            Swal.fire({
              title: Company,
              html: `A Atividade foi deletada com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
          });
        }
      })
    } catch(error) {
      console.log(error)
    }
  }
  

  return (
    <div className={styles.container_panel}>
        {loading && loading &&
          <Box className="loading">
              <CircularProgress />
          </Box>
        }
      <Header user={user} userRef={userRef}></Header>
      <div className={styles.title_panel}>
        <ProspectionIcon className={styles.prospecction_icon}/>
        <h2>Prospecção</h2>
      </div>
      <div className={styles.content_panel}>
          <div className={styles.box_panel_add}>
            {!view && !view ? 
            <button className={styles.box_panel_add_activity} onClick={() => setView(true)}>
            <ProspectionIcon className={styles.prospecction_icon} />
              <p>Registrar Atividade</p>
            </button> :
            <CreateProspection userRef={userRef} returnPage={returnPage} changeLoading={changeLoading} />
          }
          </div>
        <div className={styles.box_panel}>
            <h2>Atividades</h2>
            <Filter tableData={activityUser} 
            dataFull={activity} 
            sellers={sellersOrder} 
            userRef={userRef} 
            changeFilter={changeFilter}
            type={'prospeccao'}
            />
          <div className={styles.box_activity}>
          <TableContainer className={styles.table_center} component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Atividade</TableCell>
                  <TableCell align="center">Data</TableCell>
                  <TableCell align="center">Empresa</TableCell>
                  <TableCell align="center">Responsável</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                  <TableCell align="center">Consultora</TableCell>
                  <TableCell align="center">Anotação</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {activityUser && activityUser.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data, index) => (
                <><TableRow
                  key={index}
                  hover
                  className={`list-visit`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell aria-label={data.atividade}
                    data-cooltipz-dir="right" align="center" sx={{ width: '50px' }}>
                    {data.atividade === 'Email' && <Email className={styles.circle} style={{ backgroundColor: '#8A8A8A' }} />}
                    {data.atividade === 'Ligação' && <Phone className={styles.circle} style={{ backgroundColor: '#576AF5' }} />}
                    {data.atividade === 'WhatsApp' && <WhatsApp className={styles.circle} style={{ backgroundColor: '#44BF2B', padding: '0.6rem' }} />}
                  </TableCell>
                  <TableCell align="center">{data.data.replace('-', 'às')}</TableCell>
                  <TableCell align="center">{data.empresa}</TableCell>
                  <TableCell align="center">{data.responsavel}</TableCell>
                  <TableCell align="center">{data.cidade}</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: members.find((data1) => data1.uid === data.uid).cor, color: '#fff' }}>{data.consultora}</TableCell>
                  <TableCell align="center" sx={{ width: 'auto' }}>{data.anotacao.substring(0, 30) + '...'} </TableCell>
                  <TableCell align="center" sx={{ width: '50px' }}>
                    <IconButton
                      aria-label="Expandir"
                      data-cooltipz-dir="left"
                      size="small"
                      onClick={() => handleToggle(data.id)}>
                      {open[data.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow><TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0, height: 0 }} colSpan={8}>
                      <Collapse in={open[data.id]} timeout="auto" unmountOnExit colSpan={8}>
                        <Box className={styles.info_anotacao} margin={3}>
                          <h3>Anotação</h3>
                          {viewEdit && viewEdit === data.id ?
                            <textarea className={styles.edit_anotacao} value={anotacao} onChange={(e) => setAnotacao(e.target.value)} cols="30" rows="5"></textarea> :
                            <div className={styles.anotacao}>{data.anotacao}</div>}
                          {data && userRef && (data.uid === userRef.uid || userRef.cargo === 'Administrador') &&
                            <div>
                              {viewEdit && viewEdit === data.id ?
                                <IconButton
                                  aria-label="Confirmar"
                                  data-cooltipz-dir="top"
                                  onClick={() => confirmEdit(data.id)}
                                >
                                  <CheckIcon style={{ scale: '1.2' }} />
                                </IconButton>
                                : <IconButton
                                  aria-label="Editar Anotação"
                                  data-cooltipz-dir="top"
                                  onClick={() => { setViewEdit(data.id); setAnotacao(data.anotacao); } }
                                >
                                  <EditIcon />
                                </IconButton>}
                              {viewEdit && viewEdit === data.id ?
                                <IconButton
                                  aria-label="Cancelar"
                                  data-cooltipz-dir="top"
                                  onClick={() => setViewEdit()}
                                >
                                  <BlockIcon />
                                </IconButton>
                                : <IconButton
                                  aria-label="Deletar Atividade"
                                  data-cooltipz-dir="top"
                                  onClick={() => DeleteActivity(data.id)}
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>}
                            </div>}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow></>
              ))}
            </TableBody>
              {activityUser && activityUser.length < 1 &&
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8}>
                      <p className="margin1" style={{ textAlign: 'center' }}>Nenhuma Atividade Encontrada</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              } 
            </Table>
            <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            labelRowsPerPage="Atividades por página"
            component="div"
            count={activityUser ? activityUser.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prospection;
