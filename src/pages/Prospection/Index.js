import { useState, useEffect, memo } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Company } from "../../data/Data";
import axios from "axios";
// import { PatternFormat } from "react-number-format";
// import { useForm } from "react-hook-form"; // cria formulário personalizado
import { collection, query, serverTimestamp, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";

// Css
import "cooltipz-css";
import styles from "./style.module.scss";
import '../../styles/_filter.scss';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import "../../components/Dashboard/_styles.scss";

// Components
import CreateProspection from "../../components/Box/CreateProspection/Index";
import EditProspection from "../../components/Box/EditProspection/Index";
import CreateActivity from "../../components/Box/CreateActivity/Index";
import Filter from "../../components/Filter/Index";
import Dashboard from "../../components/Dashboard/Index";

import { ReactComponent as ProspectionIcon } from '../../images/icons/Prospection.svg';
// import { ReactComponent as Email } from '../../images/icons/Mail.svg';
// import { ReactComponent as Phone } from '../../images/icons/Phone.svg';
// import { ReactComponent as WhatsApp } from '../../images/icons/WhatsApp.svg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
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
import Collapse from '@mui/material/Collapse';
import { Box } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';


const Prospection = ({ user, leads, activity, userRef, members, sellers }) => {
  const [anotacao, setAnotacao] = useState('');
  const [view, setView] = useState(false);
  const [viewEdit, setViewEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [leadsUser, setLeadsUser] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [sellersOrder, setSellersOrder] = useState(null);
  const [TabsValue, setTabsValue] = useState(0);
  const [activityAll, setActivityAll] = useState();


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

  // useEffect(() => {
  //   const fethData = async () => {
  //     onSnapshot(query(collection(dataBase, "Leads/" + data.id + "/Atividades"), orderBy("createAt")), (act) => {
  //       // Atualiza os dados em tempo real
  //       setActivityAll(act.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  //     });
  //   }
  //     fethData();
  // },[activity])

  const changeFilter = (data) => {
    setLeadsUser(data);
  }
  
  const returnPage = () => {
    setView(false);
  };

  const changeLoading = (data) => {
    setLoading(data);
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
    setOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
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
            status: 'Ganho'
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
              ...data,
              status: 'Ganho'
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
            status: 'Perdido'
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

//   const onSubmit = async (userData) => {
//     try {
//       Swal.fire({
//         title: Company,
//         html: `Você deseja alterar o <b>Lead?</b>`,
//         icon: "question",
//         showCancelButton: true,
//         showCloseButton: true,
//         confirmButtonColor: "#F39200",
//         cancelButtonColor: "#d33",
//         confirmButtonText: "Sim",
//         cancelButtonText: "Não",
//       }).then(async (result) => {
//         if(result.isConfirmed) {

//         }})
//     } catch {

//  }  
// }

  const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  
  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  console.log(TabsValue);
  

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
          <Dashboard schedule={activity} type={'prospeccao'} />
      </div>
      <div className={styles.content_panel}>
        <div className={styles.box_panel}>
            <h2>Atividades</h2>
          <div className={styles.box_panel_add}>
            {!view && !view ? 
            <button className={styles.box_panel_add_activity} onClick={() => setView(true)}>
            <ProspectionIcon className={styles.prospecction_icon} />
              <p>Cadastrar Lead</p>
            </button> :
            <CreateProspection userRef={userRef} returnPage={returnPage} changeLoading={changeLoading} />
          }
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
                  <TableCell align="center">Data</TableCell>
                  <TableCell align="center">Responsável</TableCell>
                  <TableCell align="center">Empresa</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                  <TableCell align="center">Consultora</TableCell>
                  <TableCell align="center">Anotação</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              {leadsUser && leadsUser.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data, index) => (
              <TableBody>
                <TableRow
                  key={index}
                  hover
                  className={`list-visit`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {/* <TableCell aria-label={data.atividade}
                    data-cooltipz-dir="right" align="center" sx={{ width: '50px' }}>
                    {data.atividade === 'Email' && <Email className={styles.circle} style={{ backgroundColor: '#8A8A8A' }} />}
                    {data.atividade === 'Ligação' && <Phone className={styles.circle} style={{ backgroundColor: '#576AF5' }} />}
                    {data.atividade === 'WhatsApp' && <WhatsApp className={styles.circle} style={{ backgroundColor: '#44BF2B', padding: '0.6rem' }} />}
                  </TableCell> */}
                  {data.status === 'Ativo' &&
                    <TableCell align="center" className={styles.ativo}>{data.status}</TableCell>
                  }
                  {data.status === 'Ganho' &&
                    <TableCell align="center" className={styles.ganho}>{data.status}</TableCell>
                  }
                  {data.status === 'Perdido' &&
                    <TableCell align="center" className={styles.perdido}>{data.status}</TableCell>
                  }
                  <TableCell align="center">{data.data.replace('-', 'às')}</TableCell>
                  <TableCell align="center">{data.nome}</TableCell>
                  <TableCell align="center">{data.empresa}</TableCell>
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
                </TableRow>
                <TableRow key={data.id}>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0, height: 0 }} colSpan={8}>
                      <Collapse in={open[data.id]} timeout="auto" unmountOnExit colSpan={8}>
                      <Box className={styles.info_anotacao} margin={3}>
                          <h3>Anotação</h3>
                          {viewEdit && viewEdit === data.id ?
                            <textarea className={styles.edit_anotacao} value={anotacao} onChange={(e) => setAnotacao(e.target.value)} cols="30" rows="5"></textarea> :
                            <div className={styles.anotacao}>{data.anotacao}
                            <IconButton
                            aria-label="Editar Anotação"
                            data-cooltipz-dir="top"
                            size="small"
                            onClick={() => { setViewEdit(data.id); setAnotacao(data.anotacao); } }
                          >
                            <EditIcon />
                          </IconButton></div>}
                              {viewEdit && viewEdit === data.id ?
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
                              </div> : 
                              <div className={styles.activity_button}>
                                {data.status !== "Ativo" ?
                                  <><div className={styles.lead_status} style={data.status === 'Ganho' ? { color: 'green'} : { color: 'red' }}>
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
                                  </Button></> : 
                                  <><Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  type="submit"
                                  startIcon={<HowToRegIcon />}
                                  onClick={() => winLead(data)}
                                >
                                  Ganho
                                </Button><Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  type="submit"
                                  startIcon={<PersonOffIcon />}
                                  onClick={() => loseLead(data)}
                                >
                                    Perdido
                                  </Button></>
                                }
                            </div>}
                      </Box>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={TabsValue} onChange={(e, newValue) => setTabsValue(newValue)} aria-label="Informações do Lead" centered>
                        <Tab label="Atividades" {...a11yProps(1)} />
                        <Tab label="Dados" {...a11yProps(2)} />
                      </Tabs>
                    </Box>
                    <CustomTabPanel value={TabsValue} index={0}>
                      <CreateActivity activityAll={activityAll} changeLoading={changeLoading} data={data} />
                    </CustomTabPanel>
                    <CustomTabPanel value={TabsValue} index={1}>
                  <h3 className={styles.title_info}>Geral</h3>
                    <EditProspection changeLoading={changeLoading} data={data} />
                    </CustomTabPanel>
                    <CustomTabPanel value={TabsValue} index={2}>
                      Item Three
                    </CustomTabPanel>
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
            rowsPerPageOptions={[5, 10, 20]}
            labelRowsPerPage="Atividades por página"
            component="div"
            count={leadsUser ? leadsUser.length : 0}
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

export default memo(Prospection);
