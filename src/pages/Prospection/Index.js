import { useState, useEffect, memo } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Company } from "../../data/Data";
import axios from "axios";
import * as moment from "moment";
import { collection, query, serverTimestamp, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

// Css
import "cooltipz-css";
import styles from "./style.module.scss";
import '../../styles/_filter.scss';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import "../../components/Dashboard/Visit_and_Prospection/_styles.scss";
import { theme } from "../../data/theme"

// Components
import CreateProspection from "../../components/Prospection/Create/Index";
import EditProspection from "../../components/Prospection/Edit/Index";
import Estimate from "../../components/Prospection/Estimate/Index";
// import CreateActivity from "../../components/Box/CreateActivity/Index";
import Filter from "../../components/Filter/Index";
import Dashboard from "../../components/Dashboard/Visit_and_Prospection/Index";
// import ImportLeads from "../../components/Prospection/ImportLeads";
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';

import { ReactComponent as ProspectionIcon } from '../../images/icons/Prospection.svg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
// import DeleteIcon from '@mui/icons-material/Delete';
// import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
// import DeleteIcon from '@mui/icons-material/Delete';

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
import RoomIcon from '@mui/icons-material/Room';
import Collapse from '@mui/material/Collapse';
import { Box, ThemeProvider } from "@mui/material";
import { redTheme } from "../../data/theme";

const steps = [
  'Ativo',
  'Pedido de Orçamento',
  'Orçamento Gerado',
  'Apresentação',
  'Finalizado'
];


const Prospection = ({ user, leads, visits, userRef, listLeads, members, sellers }) => {
  const [anotacao, setAnotacao] = useState('');
  const [anotacaoBox, setAnotacaoBox] = useState(false);
  const [view, setView] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEstimate, setOpenEstimate] = useState();
  const [viewEdit, setViewEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [leadsUser, setLeadsUser] = useState(undefined);
  // const [loading, setLoading] = useState(false);
  const [sellersOrder, setSellersOrder] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [activityAll, setActivityAll] = useState();
  // const [viewImport, setViewImport] = useState(false);

  console.log(visits)


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
    setLeadsUser(data);
  }
  
  const returnPage = () => {
    setView(false);
  };

  const changeLoading = (data) => {
    // setLoading(data);
  };

  useEffect(() => {
    if(userRef && userRef.cargo === 'Vendedor(a)') {
      setLeadsUser(leads.filter((act) => act.uid === user.id))
    } else if(userRef && userRef.cargo !== 'Vendedor(a)') {
      setLeadsUser(leads);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[leads,userRef])


  const handleToggle = (id) => {
    setOpen((prevState) => ({[id]: !prevState[id] }));
    onSnapshot(query(collection(dataBase, "Leads/" + id + "/Atividades"), orderBy("createAt")), (act) => {
      // Atualiza os dados em tempo real
      setActivityAll(act.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
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
      const docRef = doc(dataBase, 'Leads', data);
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
          }).then(() => {
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

  const openLead = async (data) => {
    try {
      const docRef = doc(dataBase, 'Leads', data.id);
      Swal.fire({
        title: Company,
        html: `Você deseja reabrir o <b>Lead?</b>`,
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
            status: 'Ativo'
          }).then((result) => {
            Swal.fire({
              title: Company,
              html: `O Lead foi reaberto com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
            axios.post('https://n8n.corpbrasil.cloud/webhook/271dd7a8-0354-4e37-8aaf-b4a955ac836b', {
              ...data,
              status: 'Ativo'
            })
          });
        }
      })
    } catch(error) {
      console.log(error)
    }
  }

  

  const winLead = async (data) => {
    try {
      setOpenDialog(false);
      const day = moment();
      const docRef = doc(dataBase, 'Leads', data.id);
      Swal.fire({
        title: Company,
        html: `Você deseja dar ganho no <b>Lead?</b>`,
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
            status: 'Ganho',
            anotacao: anotacao,
            dataStatus: moment(day).format('DD MMM YYYY - HH:mm')
          }).then((result) => {
            Swal.fire({
              title: Company,
              html: `O Lead foi ganho com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
            axios.post('https://n8n.corpbrasil.cloud/webhook/271dd7a8-0354-4e37-8aaf-b4a955ac836b', {
              Anotacao: anotacao,
              ...data,
              status: 'Ganho',
              ID_SM: userRef.id_sm
            })
          });
        }
      })
    } catch(error) {
      console.log(error)
    }
  }

  const loseLead = async (data) => {
    try {
      console.log(data)
      setOpenDialog(false);
      const day = moment();
      const docRef = doc(dataBase, 'Leads', data.id);
      Swal.fire({
        title: Company,
        html: `Você deseja dar perdido no <b>Lead?</b>`,
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
            status: 'Perdido',
            anotacao: anotacao,
            dataStatus: moment(day).format('DD MMM YYYY - HH:mm')
          }).then((result) => {
            Swal.fire({
              title: Company,
              html: `O Lead foi perdido com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
            axios.post('https://n8n.corpbrasil.cloud/webhook/271dd7a8-0354-4e37-8aaf-b4a955ac836b', {
              Anotacao: anotacao,
              ...data,
              status: 'Perdido'
            })
          });
        }
      })
    } catch(error) {
      console.log(error)
    }
  }

  const deleteLead = async (data) => {
    try {
      console.log(data.storageRef)
      setOpenDialog(false);
      Swal.fire({
        title: Company,
        html: `Você deseja excluir o <b>Lead?</b>`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if(result.isConfirmed) {
        const storage = getStorage();
        const faturatRef = ref(storage, data.storageRef);
         await deleteDoc(doc(dataBase, 'Leads', data.id)).then(async() => {
            if (data.visitRef) {
              await deleteDoc(doc(dataBase, 'Visitas_2023', data.visitRef))
            }
            deleteObject(faturatRef).then(() => {
              console.log('Fatura Deletada!')
            }).catch((error) => {
              // Uh-oh, an error occurred!
            });
            Swal.fire({
              title: Company,
              html: `O Lead foi excluido com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
            axios.post('https://n8n.corpbrasil.cloud/webhook/271dd7a8-0354-4e37-8aaf-b4a955ac836b', {
              Anotacao: anotacao,
              ...data,
              status: 'Perdido'
            })
          });
        }
      })
    } catch(error) {
      console.log(error)
    }
  }

const openAnotacaoBox = (act, type) => {
  setAnotacao(act.anotacao);
  setOpenDialog(true);
  setAnotacaoBox({info:act, type:type});
}

const closeAnotacaoBox = () => {
  setAnotacao('');
  setOpenDialog(false);
  setAnotacaoBox({info: null});
}

  // const CustomTabPanel = (props) => {
  //   const { children, value, index, ...other } = props;
  
  //   return (
  //     <div
  //       role="tabpanel"
  //       hidden={value !== index}
  //       id={`simple-tabpanel-${index}`}
  //       aria-labelledby={`simple-tab-${index}`}
  //       {...other}
  //     >
  //       {value === index && (
  //         <Box sx={{ p: 3 }}>
  //           {children}
  //         </Box>
  //       )}
  //     </div>
  //   );
  // }

  // CustomTabPanel.propTypes = {
  //   children: PropTypes.node,
  //   index: PropTypes.number.isRequired,
  //   value: PropTypes.number.isRequired,
  // };
  
  // const a11yProps = (index) => {
  //   return {
  //     id: `simple-tab-${index}`,
  //     'aria-controls': `simple-tabpanel-${index}`,
  //   };
  // }

  // const closeImport = () => {
  //   setViewImport(false);
  // }

  // const openImport = () => {
  //   setViewImport(true);
  // }

  // const deleteList = (list) => {
  //   try {
  //     Swal.fire({
  //       title: 'Atenção',
  //       html: `Você deseja excluir a lista <b>(${list.nome})</b>? <br /><br />` +
  //       `Importante: Ao excluir <b>(${list.nome})</b>, todos os leads vinculados a essa lista também serão removidos.<br /> <b>Esta ação é irreversível!</b>`,
  //       icon: "question",
  //       showCancelButton: true,
  //       showCloseButton: true,
  //       confirmButtonColor: "#F39200",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Sim",
  //       cancelButtonText: "Não",
  //     }).then(async (result) => {
  //       if(result.isConfirmed) {
  //       changeLoading(true);
  //       const listRef = leads.filter((ref) => ref.listaID === list.id);
  //       Promise.all(listRef.map(async (data) => {
  //         await deleteDoc(doc(dataBase, "Leads", data.id))
  //       })).then(async (result) => {
  //         if(result) {
  //           const day = moment();
  //           await updateDoc(doc(dataBase, "Lista_Leads", list.id), {
  //             status: "Excluido",
  //             dataStatus: moment(day).format('DD MMM YYYY - HH:mm')
  //           }).then(() => {
  //             changeLoading(false);
  //             Swal.fire({
  //               title: Company,
  //               html: `A lista foi excluida com sucesso.`,
  //               icon: "success",
  //               showConfirmButton: true,
  //               showCloseButton: true,
  //               confirmButtonColor: "#F39200",
  //             })
  //           })
  //       }
  //     })
  //   }
  //   })
  // } catch {

  //   }
  // }

  const close = () => {
    setOpenEstimate(false);
  }

  const openBox = () => {
    setOpenEstimate(true);
  }

  return (
    <div className={styles.container_panel}>
        {/* {loading && loading &&
          <Box className="loading">
              <CircularProgress />
          </Box>
        } */}
      <Header user={user} userRef={userRef}></Header>
      <div className={styles.title_panel}>
        <ProspectionIcon className={styles.prospecction_icon}/>
        <h2>Prospecção</h2>
          <Dashboard type={'prospeccao'} />
      </div>
      <div className={styles.content_panel}>
        <div className={styles.box_panel}>
            <h2>Leads</h2>
          <div className={styles.box_panel_add}>
            {!view && !view ? 
            <button className={styles.box_panel_add_activity} onClick={() => setView(true)}>
                <ProspectionIcon className={styles.prospecction_icon} />
                <p>Cadastrar Lead</p>
              </button> 
              :
              <CreateProspection userRef={userRef} returnPage={returnPage} changeLoading={changeLoading} />
            }
              {/* {userRef && userRef.cargo === "Administrador" && 
              <><button className={styles.box_panel_add_activity} onClick={() => setViewImport(true)}>
                    <PersonAddAltIcon className={styles.prospecction_icon} />
                    <p>Importar Leads</p>
                  </button><ImportLeads members={members} company={Company} dataBase={dataBase} view={viewImport}
                    open={openImport} close={closeImport} userRef={userRef} changeLoading={changeLoading} /></>
                  } */}    
          </div>
            <Filter tableData={leadsUser} 
            dataFull={leads} 
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
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Data de Criação</TableCell>
                  <TableCell align="center">Responsável</TableCell>
                  <TableCell align="center">Empresa</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                  <TableCell align="center">Indicador(a)</TableCell>
                  {/* <TableCell align="center">Anotação</TableCell> */}
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              {leadsUser && leadsUser.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data, index) => (
              <TableBody>
                <TableRow
                  key={index}
                  hover
                  className={`list-visit`}
                  // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                  {data.status === 'Ativo' &&
                    <TableCell align="center" className={styles.ativo}>{data.status}</TableCell>
                  }
                  {data.status === 'Orçamento' &&
                    <TableCell align="center" className={styles.orcamento}>{data.status}</TableCell>
                  }
                  {data.status === 'Orçamento Cancelado' &&
                    <TableCell align="center" className={styles.orcamento_negado}>{data.status}</TableCell>
                  }
                  {data.status === 'Apresentação' &&
                    <TableCell align="center" className={styles.apresentacao}>{data.status}</TableCell>
                  }
                  {data.status === 'Ganho' &&
                    <TableCell align="center" aria-label={data.dataStatus && data.dataStatus.replace('-','às')}
                    data-cooltipz-dir="right" className={styles.ganho}>{data.status}</TableCell>
                  }
                  {data.status === 'Perdido' &&
                    <TableCell align="center" aria-label={data.dataStatus && data.dataStatus.replace('-','às')}
                    data-cooltipz-dir="right" className={styles.perdido}>{data.status}</TableCell>
                  }
                  <TableCell align="center">{data.data.replace('-', 'às')}</TableCell>
                  <TableCell align="center">{data.nome ? data.nome.substring(0, 30) + '...' : ""}</TableCell>
                  <TableCell align="center">{data.empresa}</TableCell>
                  <TableCell align="center">{data.cidade}</TableCell>
                  <TableCell align="center"><b>{data.indicador} ({data && members.filter((member) => member.id === data.uid)[0].id_user})</b></TableCell>
                  {/* <TableCell align="center">{activity.filter((act) => act.idRef === data.id).length}</TableCell> */}
                  {/* <TableCell align="center" sx={{ width: 'auto' }}>{data.anotacao ? data.anotacao.substring(0, 30) + '...' : ""} </TableCell> */}
                  <TableCell align="center" sx={{ width: '50px' }}>
                    <IconButton
                      aria-label="Expandir"
                      data-cooltipz-dir="left"
                      size="small"
                      onClick={() => handleToggle(data.id)}>
                      {open[data.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow key={data.id}>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0, height: 0 }} colSpan={9}>
                      <Collapse in={open[data.id]} timeout="auto" unmountOnExit colSpan={9}>
                      <Box className={styles.info_anotacao} margin={3}>
                        <Estimate data={data} visits={visits} members={members} openEstimate={openEstimate} close={close} open={openBox} userRef={userRef} />
                        <Box sx={{ width: '90%', marginBottom: '1rem' }}>
                          <Stepper activeStep={data && data.step}>
                            {steps.map((label) => (
                              <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Box>
                        {data.status === 'Ativo' && 
                        <Box className={styles.info_step} sx={{ width: '87%', marginBottom: '1rem' }}>
                          <p><b>{data && data.data.replace('-', 'às')}</b></p>
                          <p>Lead ativo</p>
                        </Box>
                        }
                        {data.status === 'Orçamento' && 
                        <Box className={styles.info_step} sx={{ width: '87%', marginBottom: '1rem' }}>
                          <p><b>{data.pedido && data.pedido.data.replace('-', 'às')}</b></p>
                          <p>Aguardando Orçamento. A data de apresentação está prevista para o dia <b>{visits && visits.filter((visit) => visit.id === data.visitRef)[0].data_completa.replace('-', ' às ')}</b>.</p>
                        </Box>
                        }
                        {data.status === 'Orçamento Cancelado' && 
                        <Box className={styles.info_step} sx={{ width: '87%', marginBottom: '1rem' }}>
                          <p><b>{data.pedido && data.orcamento.data.replace('-', 'às')}</b></p>
                          <p>Orçamento foi cancelado pela <b>{data.orcamentista && data.orcamentista.nome}</b>. Motivo: <b>{data.orcamento && data.orcamento.anotacao}</b></p>
                        </Box>
                        }
                        {data.status === 'Apresentação' && 
                        <Box className={styles.info_step} sx={{ width: '87%', marginBottom: '1rem' }}>
                          <p><b>{data.orcamento && data.orcamento.data.replace('-', 'às')}</b></p>
                          <p>Orçamento gerado pela <b>Bruna</b>. A data de apresentação está prevista para o dia <b>{visits && visits.filter((visit) => visit.id === data.visitRef)[0].data_completa.replace('-', ' às ')}</b>.</p>
                        </Box>
                        }
                          <h3>Anotação</h3>
                          {viewEdit && viewEdit === data.id ?
                            <><textarea className={styles.edit_anotacao} value={anotacao} onChange={(e) => setAnotacao(e.target.value)} cols="30" rows="5"></textarea>
                            <div className={styles.activity_button}>
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                type="submit"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() => confirmEdit(data.id)}
                              >
                                Confirmar
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                type="submit"
                                startIcon={<BlockIcon />}
                                onClick={() => setViewEdit()}
                              >
                                Cancelar
                              </Button>
                            </div></>  :
                            <div className={styles.anotacao}>{data.anotacao}
                            <IconButton
                            aria-label="Editar Anotação"
                            data-cooltipz-dir="top"
                            size="small"
                            onClick={() => { setViewEdit(data.id); setAnotacao(data.anotacao); } }
                          > 
                            <EditIcon />
                          </IconButton></div>}
                        <EditProspection changeLoading={changeLoading} data={data} />
                              <div className={styles.activity_button}>
                                <ThemeProvider theme={theme}>
                                {(userRef && userRef.cargo === 'Indicador') &&
                                  <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  type="submit"
                                  startIcon={<RoomIcon />}
                                  onClick={() => window.open(data.endereco, '_blank')}
                                >
                                  Localização
                                </Button>}
                                </ThemeProvider>
                                 {(data.status === "Ganho" || data.status === "Perdido") &&
                                  <><div className={styles.lead_status} aria-label={data.dataStatus && data.dataStatus.replace('-', 'às')} data-cooltipz-dir="top" style={data.status === 'Ganho' ? { color: 'green' } : { color: 'red' }}>
                                  <HowToRegIcon />
                                  <h3>{data.status}</h3>
                                </div><Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  type="submit"
                                  startIcon={<RefreshIcon />}
                                  onClick={() => openLead(data)}
                                >
                                    Reabrir
                                  </Button></>}
                                  {((data.status === "Ativo" || data.status === "Orçamento Cancelado")  && userRef && userRef.cargo === 'Indicador') &&
                                  <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  type="submit"
                                  startIcon={<ContentPasteGoIcon />}
                                  onClick={() => setOpenEstimate(true)}
                                >
                                  Solicitar Orçamento
                                </Button>}
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  type="submit"
                                  startIcon={<PersonOffIcon />}
                                  onClick={() => openAnotacaoBox(data, 'ganho')}
                                >
                                    Ganho
                                  </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  type="submit"
                                  startIcon={<PersonOffIcon />}
                                  onClick={() => openAnotacaoBox(data, 'perdido')}
                                >
                                    Perdido
                                  </Button>
                                  <ThemeProvider theme={redTheme}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  type="submit"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => deleteLead(data)}
                                >
                                    Excluir
                                  </Button>
                                  </ThemeProvider>
                                
                            </div>
                      </Box>
                      {/* <Tabs value={TabsValue} onChange={(e, newValue) => setTabsValue(newValue)} aria-label="Informações do Lead" centered>
                        <Tab label="Atividades" {...a11yProps(1)} />
                        <Tab label="Dados" {...a11yProps(2)} />
                      </Tabs> */}
                    {/* <CustomTabPanel value={TabsValue} index={0}>
                      <CreateActivity activityAll={activityAll} changeLoading={changeLoading} data={data} />
                    </CustomTabPanel> */}
                    {/* <CustomTabPanel value={TabsValue} index={1}>
                  <h3 className={styles.title_info}>Geral</h3>
                    <EditProspection changeLoading={changeLoading} data={data} />
                    </CustomTabPanel> */}
                    </Collapse>
                </TableCell>
              </TableRow>
            </TableBody>
              ))}
              {leadsUser && leadsUser.length < 1 &&
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={8}>
                      <p className="margin1" style={{ textAlign: 'center' }}>Nenhum Lead Encontrado</p>
                    </TableCell>
                  </TableRow>
                </TableBody>
              } 
            </Table>
            <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Leads por página"
            component="div"
            count={leadsUser ? leadsUser.length : 0}
            page={!leadsUser || leadsUser.length <= 0 ? 0 : page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
          </div>
        </div>
      </div>
      <ThemeProvider theme={theme} >
      <Dialog
              open={openDialog}
              fullWidth={true}
              maxWidth='sm'
              size
              onClose={() => setAnotacaoBox({state:false})}
            >
                <DialogTitle>
                {openDialog && anotacaoBox.type === 'ganho' ? 
                <p className="center-flex gap05"><HowToRegIcon sx={{ fill: 'green' }} /> Marcar como ganho</p> :
                <p className="center-flex gap05"><PersonOffIcon sx={{ fill: 'red' }} /> Marcar como perdido</p>
                }  
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ textAlign: 'center' }}>
                    Complemente a anotação com um feedback sobre o Lead de acordo com a sua experiência. ✍️
                  </DialogContentText>
                  <div className="alert-message" style={{ margin: '1rem' }}>
                  <FormControl sx={{ margin: '0.3rem 0' }} fullWidth>
                </FormControl>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Anotação"
                  type="text"
                  onChange={(e) => setAnotacao(e.target.value)}
                  value={anotacao}
                  fullWidth
                  required
                  multiline
                  rows={5}
                  variant="outlined"
                />
                  </div>
                </DialogContent>
                <DialogActions>
                {openDialog && anotacaoBox.type === 'ganho' ?
                  <Button autoFocus onClick={() => {setAnotacaoBox({state:false});winLead(anotacaoBox.info)}}>
                    Confirmar
                  </Button> :
                  <Button autoFocus onClick={() => {setAnotacaoBox({state:false});loseLead(anotacaoBox.info)}}>
                  Confirmar
                </Button>
                }
                  <Button onClick={() => closeAnotacaoBox()} autoFocus>
                    Cancelar
                  </Button>
                </DialogActions>
      </Dialog>
      </ThemeProvider>
    </div>
  );
};

export default memo(Prospection);
