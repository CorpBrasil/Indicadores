import { useState, useEffect, memo } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import moment from "moment";
import { getStorage, ref, deleteObject } from "firebase/storage";
import CurrencyInput from "react-currency-input-field";
// import axios from "axios";
// import * as moment from "moment";
import { updateDoc, doc, collection, serverTimestamp, addDoc, deleteDoc } from "firebase/firestore";

// Css
import "cooltipz-css";
import styles from "./style.module.scss";
import '../../styles/_filter.scss';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import "../../components/Dashboard/Visit_and_Prospection/_styles.scss";
import { theme } from "../../data/theme"

// Components
// import CreateProspection from "../../components/Prospection/Create/Index";
// import EditProspection from "../../components/Prospection/Edit/Index";
// import Estimate from "../../components/Prospection/Estimate/Index";
// import CreateActivity from "../../components/Box/CreateActivity/Index";
import Filter from "../../components/Filter/Index";
// import Dashboard from "../../components/Dashboard/Visit_and_Prospection/Index";
// import ImportLeads from "../../components/Prospection/ImportLeads";

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CircularProgress from "@mui/material/CircularProgress";
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
import Collapse from '@mui/material/Collapse';
import { Box, ThemeProvider } from "@mui/material";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

const Estimate = ({ user, orcamento, visits, userRef, sellers }) => {
  const [checkFatura, setCheckFatura] = useState(false);
  // const [viewEdit, setViewEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [openFatura, setOpenFatura] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [valor, setValor] = useState(false);
  const [comissao, setComissao] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orcamentosUser, setOrcamentoUser] = useState(undefined);
  // const [loading, setLoading] = useState(false);
  const [sellersOrder, setSellersOrder] = useState(null);
  // eslint-disable-next-line no-unused-vars
  
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  // const [viewImport, setViewImport] = useState(false);


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
    setOrcamentoUser(data);
  }

  console.log(orcamento);

  useEffect(() => {
    if(userRef && userRef.cargo === 'Orçamentista') {
      setOrcamentoUser(orcamento.filter((act) => act.orcamentista.uid === user.id))
    } else if(userRef && userRef.cargo !== 'Vendedor(a)') {
      setOrcamentoUser(orcamento);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[orcamento,userRef])


  const handleToggle = (id) => {
    setOpen((prevState) => ({[id]: !prevState[id] }));
    // onSnapshot(query(collection(dataBase, "Leads/" + id + "/Atividades"), orderBy("createAt")), (act) => {
    //   // Atualiza os dados em tempo real
    //   setActivityAll(act.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    // });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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

  const handleOnValueChange = (value, type) => {
    if(type === 'valor') {
      setValor(value);
    } else {
      setComissao(value);
    }
  };

const confirmEstimate = async (e, data) => {
  e.preventDefault();
  try{
    Swal.fire({
      title: 'Orçamento',
      icon: "question",
      text: 'Deseja confirmar que o orçamento foi criado?',
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#F39200",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateDoc(doc(dataBase, 'Orcamento', data.id), {
          status: 'Concluido',
          dataStatus: moment().format('DD MMMM YYYY - HH:mm'),
          valor: valor,
          comissao: comissao
        }).then(async() => {
          await updateDoc(doc(dataBase, 'Leads', data.leadRef), {
            status: 'Aguardando Apresentação',
            step: 3,
            orcamento: {
              data: moment().format('DD MMMM YYYY - HH:mm'),
              anotacao: result.value,
              valor: valor,
              comissao: comissao
            }
          }).then(async () => {
            await addDoc(collection(dataBase, "Membros", data.indicador.uid, 'Notificacao'), {
              createAt: serverTimestamp(),
              type: 'Orçamento',
              data: moment().format('YYYY-MM-DD'),
              text: `Orçamento do(a) <b>${data.nome}</b> está pronto! Apresentação está prevista para o dia
               <b>${visits && visits.filter((visit) => visit.id === data.VisitRef)[0].data_completa.replace('-', ' às ')}</b>.`
            })
              Swal.fire({
                title: 'CORPBRASIL',
                html: 'Orçamento confirmado com sucesso.',
                icon: "success",
                showConfirmButton: true,
                showCloseButton: true,
                confirmButtonColor: "#F39200"
              })
              setOpenConfirm(false)
            })
        })
      }
    })
  } catch {

  }
}

const cancelEstimate = async (data) => {
  try{
    Swal.fire({
      title: 'CORPBRASIL',
      html: `Deseja cancelar o pedido de <b>Orçamento</b>?`,
      icon: "question",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#F39200",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      input: 'text',
      inputLabel: 'Deixe uma anotação sobre o Orçamento para o indicador.',
      inputValidator: (value) => {
        if (!value) {
          return 'Deixe uma observação sobre o Orçamento'
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateDoc(doc(dataBase, 'Orcamento', data.id), {
          status: 'Cancelado'
        }).then(async () => {
          await updateDoc(doc(dataBase, 'Leads', data.leadRef), {
            status: 'Orçamento Cancelado',
            step: 1,
            orcamento: {
              data: moment().format('DD MMMM YYYY - HH:mm'),
              anotacao: result.value
            }
          }).then(async () => {
              const storage = getStorage();
              const faturatRef = ref(storage, data.storageRef);
              await deleteDoc(doc(dataBase, "Orcamento", data.id)).then(async () => {
                await deleteDoc(doc(dataBase, "Visitas", data.VisitRef)).then(async() =>{
                  deleteObject(faturatRef).then(() => {
                    console.log('Fatura Deletada!')
                  }).catch((error) => {
                    // Uh-oh, an error occurred!
                  });
                })
              })
            await addDoc(collection(dataBase, "Membros", data.indicador.uid, 'Notificacao'), {
              createAt: serverTimestamp(),
              type: 'Orçamento',
              data: moment().format('YYYY-MM-DD'),
              text: `Pedido de orçamento do(a) <b>${data.nome}</b> foi cancelado. Verifique o motivo pelo perfil do lead.`
            })
            Swal.fire({
              title: 'CORPBRASIL',
              html: 'Orçamento foi cancelado com sucesso.',
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200"
            })
          })
        })
      }
    })
  } catch {

  }
}

const closeFatura = () => {
  setOpenFatura(false);
  setTimeout(() => {
    setCheckFatura(false)
  }, 200);
}

  return (
    <div className={styles.container_panel}>
      <Header user={user} userRef={userRef}></Header>
      <div className={styles.title_panel}>
        <ContentPasteIcon className={styles.prospecction_icon}/>
        <h2>Orçamento</h2>
          {/* <Dashboard type={'prospeccao'} /> */}
      </div>
      <div className={styles.content_panel}>
        <div className={styles.box_panel}>
            <Filter tableData={orcamentosUser} 
            dataFull={orcamento} 
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
                  <TableCell align="center">Apresentação</TableCell>
                  <TableCell align="center">Responsável</TableCell>
                  <TableCell align="center">Empresa</TableCell>
                  <TableCell align="center">Cidade</TableCell>
                  <TableCell align="center">Indicador(a)</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              {orcamentosUser && orcamentosUser.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data, index) => (
              <TableBody>
                <TableRow
                  key={index}
                  hover
                  className={`list-visit`}
                  // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {data && data.status === 'Em Espera' && 
                      <TableCell align="center" className={styles.ativo}>{data.status}</TableCell>
                    }
                    {data && data.status === 'Concluido' && 
                      <TableCell align="center" className={styles.ganho}>{data.status}</TableCell>
                    }
                    {data && data.status === 'Cancelado' && 
                      <TableCell align="center" className={styles.perdido}>{data.status}</TableCell>
                    }
                  <TableCell align="center">{visits && visits.filter((visit) => visit.id === data.VisitRef)[0].data_completa.replace('-', ' às ')}</TableCell>
                  <TableCell align="center">{data.nome ? data.nome.substring(0, 30) + '...' : ""}</TableCell>
                  <TableCell align="center">{data.empresa}</TableCell>
                  <TableCell align="center">{data.endereco.cidade}</TableCell>
                  <TableCell align="center"><b>{data.indicador.nome}</b> ({data.indicador.id})</TableCell>
                  {/* <TableCell align="center">{activity.filter((act) => act.idRef === data.id).length}</TableCell> */}
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
                          <h3>Informações</h3>
                          <div className={styles.info_content}>
                            <ul className={styles.info_content_item}>
                              <li>
                                <h4>Nome</h4>
                                <p>{data.nome}</p>
                              </li>
                              <li>
                                <h4>CPF</h4>
                                <p>{data.cpf}</p>
                              </li>
                              <li>
                                <h4>Telefone</h4>
                                <p>{data.telefone}</p>
                              </li>
                              </ul>
                              <ul className={styles.info_content_item}>
                              <li>
                                <h4>Data de Nascimento: </h4>
                                <p>{data.dataNascimento}</p>
                              </li>
                              <li>
                                <h4>Empresa: </h4>
                                <p>{data.empresa}</p>
                              </li>
                              <li>
                                <h4>Gasto com Energia: </h4>
                                <p>{data.consumo}</p>
                              </li>
                              </ul>
                              <ul className={styles.info_content_item}>
                              <li>
                                <h4>Endereço: </h4>
                                <p>{data.endereco.rua}</p>
                              </li>
                              <li>
                                <h4>Bairro: </h4>
                                <p>{data.endereco.bairro}</p>
                              </li>
                              <li>
                                <h4>Cidade: </h4>
                                <p>{data.endereco.cidade}</p>
                              </li>
                              </ul>
                              <ul className={styles.info_content_item}>
                              <li>
                                <h4>Cliente pretende adquirir equipamento elétrico de alto consumo após a instalação do sistema FV?</h4>
                                <p>{data.anotacao}</p>
                              </li>
                            </ul>
                          </div>
                          <h3>Apresentação</h3>
                          <div className={styles.info_content}>
                            <ul className={styles.info_content_item}>
                              <li>
                                <h4>Data: </h4>
                                <p>{visits && visits.filter((visit) => visit.id === data.VisitRef)[0].data_completa.replace('-', ' às ')}</p>
                              </li>
                              <li>
                                <h4>Responsável: </h4>
                                <p>{visits && visits.filter((visit) => visit.id === data.VisitRef)[0].consultora}</p>
                              </li>
                              </ul>
                              <ul className={styles.info_content_item}>
                              <li>
                                <h4>Endereço: </h4>
                                <p>{data.endereco.rua}</p>
                              </li>
                              <li>
                                <h4>Bairro: </h4>
                                <p>{data.endereco.bairro}</p>
                              </li>
                              </ul>
                              <ul className={styles.info_content_item}>
                              <li>
                                <h4>Cidade: </h4>
                                <p>{data.endereco.cidade}</p>
                              </li>
                              <li>
                                <h4>Veiculo: </h4>
                                <p>{visits.filter((visit) => visit.id === data.VisitRef)[0].veiculo}</p>
                              </li>
                            </ul>
                          </div>
                          <h3>Valores</h3>
                          <div className={styles.info_content}>
                            {data.valor && data.comissao ? 
                            <ul className={`${styles.info_content_item} ${styles.info_content_value}`}>
                              <li>
                                <h4>Orçamento: </h4>
                                <p>{data.valor &&
                                 Number(data.valor).toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}</p>
                              </li>
                              <li>
                                <h4>Comissão: </h4>
                                <p>{data.comissao && Number(data.comissao).toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}</p>
                              </li>
                              </ul> :
                              <p>Confirme o Orçamento para visualizar os valores</p>
                              
                             }
                          </div>
                              <div className={styles.activity_button}>
                                <ThemeProvider theme={theme}>
                                  <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  type="submit"
                                  startIcon={<TextSnippetIcon />}
                                  onClick={() => setOpenFatura(true)}
                                >
                                  Visualizar Fatura
                                </Button>
                                </ThemeProvider>
                                {data && data.status === "Em Espera" && 
                                <><Button
                                variant="contained"
                                color="success"
                                size="small"
                                type="submit"
                                onClick={() => setOpenConfirm(true)}
                              >
                                Confirmar
                              </Button><Button
                                variant="contained"
                                color="error"
                                size="small"
                                type="submit"
                                onClick={() => cancelEstimate(data)}
                              >
                                  Cancelar
                                </Button></>
                                }
                            </div> 
                      </Box>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      </Box>
                      <Dialog
                        className={styles.fatura_container}
                        open={openFatura}
                        fullScreen={fullScreen}
                        maxWidth="lg"
                        onClose={() => setOpenFatura(false)}
                        >
                          <IconButton
                            aria-label="close"
                            onClick={() => setOpenFatura(false)}
                            sx={{
                              position: 'absolute',
                              right: 8,
                              top: 8,
                              color: (theme) => theme.palette.grey[500],
                            }}
                          ><CloseIcon /></IconButton>
                          <div className={styles.fatura}>
                            {!checkFatura && <CircularProgress />}
                            <img src={data && data.fatura_url} alt='' onLoad={() => setCheckFatura(true)} />
                          </div>
                          <ThemeProvider theme={theme}>
                          <DialogActions className={styles.fatura_buttons} sx={{ justifyContent: 'center' }}>
                                  <Button variant='contained' onClick={closeFatura}>FECHAR</Button>
                                </DialogActions>
                          </ThemeProvider>
                          </Dialog>
                          <Dialog
                          className={styles.fatura_container}
                          open={openConfirm}
                          maxWidth="lg"
                          onClose={() => setOpenConfirm(false)}
                          >
                            <IconButton
                              aria-label="close"
                              onClick={() => setOpenConfirm(false)}
                              sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                              }}
                            ><CloseIcon /></IconButton>
                          <DialogTitle align="center">Confirmar Orçamento</DialogTitle>
                          <div className={styles.value_container}>
                          <p>Para confirmar o orçamento, informe o valor do projeto e a comissão do indicador.</p>
                          <form onSubmit={(e) => confirmEstimate(e, data)}>
                            <div>
                              <CurrencyInput
                                fullWidth
                                customInput={TextField}
                                className="label__text"
                                label="Valor do Orçamento"
                                placeholder="R$ 00"
                                intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                                onValueChange={(v) => handleOnValueChange(v, 'valor')}
                                fixedDecimalLength={0}
                                value={valor || ''}
                                min={50}
                                required
                                color="primary" />
                              <CurrencyInput
                                fullWidth
                                customInput={TextField}
                                className="label__text"
                                label="Comissão do Indicador"
                                placeholder="R$ 00"
                                intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                                onValueChange={(v) => handleOnValueChange(v, 'comissao')}
                                fixedDecimalLength={0}
                                value={comissao || ''}
                                min={50}
                                required
                                color="primary" />
                            </div>
                            <div>
                          <ThemeProvider theme={theme}>
                              <Button variant='contained' type="submit">Confirmar</Button>
                              <Button variant='contained' onClick={closeFatura}>Cancelar</Button>
                          </ThemeProvider>
                            </div>
                          </form>
                          </div>
                          </Dialog>
                    </Collapse>
                </TableCell>
              </TableRow>
            </TableBody>
              ))}
              {orcamentosUser && orcamentosUser.length < 1 &&
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
            count={orcamentosUser ? orcamentosUser.length : 0}
            page={!orcamentosUser || orcamentosUser.length <= 0 ? 0 : page}
            rowsPerPage={rowsPerPage}
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

export default memo(Estimate);
