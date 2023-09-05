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
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
// import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
// import CloseIcon from '@mui/icons-material/Close';

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
// import Popover from '@mui/material/Popover';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import { ThemeProvider } from '@mui/material/styles';
// import MenuItem from '@mui/material/MenuItem';
// import Select from '@mui/material/Select';
// import InputLabel from '@mui/material/InputLabel';
// import FormControl from '@mui/material/FormControl';
// import moment from "moment";
// import DateRangePicker from '@wojtekmaj/react-daterange-picker';


const Prospection = ({ user, activity, userRef, members }) => {
  // const activityCollectionRef = collection(dataBase, "AtividadesTotal");
  const [anotacao, setAnotacao] = useState('');
  const [view, setView] = useState(false);
  const [viewEdit, setViewEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activityUser, setActivityUser] = useState(undefined);
  const [loading, setLoading] = useState(false);
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [viewPopover, setviewPopover] = useState(false);
  // const [searchValue, setSearchValue] = useState('');
  // const [searchParams, setSearchParams] = useState([]);
  // const [searchType, setSearchType] = useState('');
  const [sellers, setSellers] = useState(null);
  //const [value, onChange] = useState([new Date(), new Date()]);
  
  // const openFilter = Boolean(anchorEl);
  // const id = open ? 'simple-popover' : undefined;

//   const search = (type) => {
//     if(type ==='atividade') {
//       setActivityUser(activityUser.filter((item) => {return item.atividade === searchValue}));
//       const newData = [...searchParams];
//       newData.push({
//         title: 'Atividade é',
//         value: searchValue
//       })
//       handleClose();
//       setSearchParams(newData);
//     }else if(type === 'data') {
//       const data1 = moment(searchValue[0]).format('YYYY-MM-DD');
//       const data2 = moment(searchValue[1]).format('YYYY-MM-DD');
//       setActivityUser(activityUser.filter((item) => 
//           //  (moment(activity[0].createAt.seconds*1000) <= moment(searchValue[1]) && moment(searchValue[0]) >= moment(activity[0].createAt.seconds*1000))
//           (moment(data1).isSameOrBefore(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')) && moment(data2).isSameOrAfter(moment(item.createAt.seconds*1000).format('YYYY-MM-DD')))
//         ));
//       const newData = [...searchParams];
//       newData.push({
//         title: 'Data entre',
//         value: moment(data1).format('DD-MM-YYYY') + ' - ' +  moment(data2).format('DD-MM-YYYY')
//       })
//       handleClose();
//       setSearchParams(newData);
//     }
//      else if(type === 'empresa') {
//        setActivityUser(activityUser.filter((item) => {return item.empresa.includes(searchValue)}));
//        const newData = [...searchParams];
//       newData.push({
//         title: 'Empresa é',
//         value: searchValue
//       })
//       handleClose();
//       setSearchParams(newData);
//     } else if(type === 'responsável') {
//       setActivityUser(activityUser.filter((item) => {return item.responsavel.includes(searchValue)}));
//       const newData = [...searchParams];
//       newData.push({
//         title: 'Responsável é',
//         value: searchValue
//       })
//       handleClose();
//       setSearchParams(newData);
//     } else if(type === 'cidade') {
//       setActivityUser(activityUser.filter((item) => {return item.cidade.includes(searchValue)}));
//       const newData = [...searchParams];
//       newData.push({
//         title: 'Cidade é',
//         value: searchValue
//       })
//       handleClose();
//       setSearchParams(newData);
//     } else if(type === 'consultora') {
//       setActivityUser(activityUser.filter((item) => {return item.consultora === searchValue}));
//       const newData = [...searchParams];
//       newData.push({
//         title: 'Consultora é',
//         value: searchValue
//       })
//       handleClose();
//       setSearchParams(newData);
//     }
// }

  // const resetSearch = () => {
  //   setSearchParams([]);
  //   if(userRef && userRef.cargo === 'Vendedor(a)') {
  //     setActivityUser(activity.filter((act) => act.uid === user.id))
  //   } else {
  //     setActivityUser(activity);
  //   }
  // }  

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
      setSellers(members.filter((member) => member.cargo === 'Vendedor(a)' && member.nome !== 'Pós-Venda'))
    } else if(userRef && userRef.cargo !== 'Vendedor(a)') {
      setActivityUser(activity);
      setSellers(members.filter((member) => member.cargo === 'Vendedor(a)' && member.nome !== 'Pós-Venda'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activity,userRef])


  const handleToggle = (id) => {
    setOpen((prevState) => ({ ...prevState, [id]: !prevState[id] }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = (type) => {
  //     setAnchorEl(null);
  //     setSearchValue('');
  //     setTimeout(() => {
  //       setviewPopover(false);
  //     }, 500);
  // };

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
            {/* <div className='filter-container'>
            <ThemeProvider theme={theme}>
              <Button aria-describedby={id} variant="outlined" color="primary" onClick={handleClick} startIcon={<AddCircleOutlineIcon />}>
              Adicionar Filtro
              </Button>
              <div className="filter-search">
              {searchParams && searchParams &&
              searchParams.map((item, index) => (
                  <div key={index} className='filter-search-item'>
                    <span>{item.title}</span>
                    <span>{item.value}</span>
                  </div>
              ))
            }
            {searchParams && searchParams.length > 0 &&
            <Button onClick={resetSearch} color="error"><CloseIcon /></Button>
            }
            </div>
            <Popover
            id={id}
            open={openFilter}
            anchorEl={anchorEl}
            className="filter"
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            PaperProps={{ style: { overflow: 'visible' } }}
            >
              {!viewPopover && !viewPopover ? 
              <div className="filter-box">
                <p className="filter-title">FILTROS</p>
                <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('atividade')}}>Atividade<KeyboardArrowRightIcon /></div>
                <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('data')}}>Data<KeyboardArrowRightIcon /></div>
                <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('empresa')}}>Empresa<KeyboardArrowRightIcon /></div>
                <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('responsável')}}>Responsável<KeyboardArrowRightIcon /></div>
                <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('cidade')}}>Cidade<KeyboardArrowRightIcon /></div>
                {userRef && userRef.cargo === 'Administrador' && 
                  <div className="filter-item" onClick={() => {setviewPopover(true);  setSearchType('consultora')}}>Consultora<KeyboardArrowRightIcon /></div>
                }
              </div> :
              <div className="filter-box2">
                  <div className="filter-header">
                    <IconButton size="small" onClick={() => setviewPopover(false)} >
                      <KeyboardArrowLeftIcon size="small" />
                    </IconButton>
                  <p className="filter-title">{searchType.toUpperCase()}</p>
                  <IconButton size="small" onClick={handleClose}>
                  <CloseIcon size="small" />
                  </IconButton>
                  </div>
                  {searchType && searchType === 'atividade' &&
                    <><div>É igual a</div>
                    <FormControl margin="normal" fullWidth>
                    <InputLabel id="demo-simple-select-label">Atividade</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={searchValue}
                      label="Atividade"
                      onChange={(e) => setSearchValue(e.target.value)}
                    >
                      <MenuItem value='Email'>Email</MenuItem>
                      <MenuItem value='Ligação'>Ligação</MenuItem>
                      <MenuItem value='WhatsApp'>WhatsApp</MenuItem>
                    </Select>
                    </FormControl></>
                  }
                  {searchType && searchType === 'data' &&
                    <><div>É entre</div>
                    <DateRangePicker 
                    onChange={(value) => setSearchValue(value)} 
                    value={searchValue}
                     />
                    </>
                  }
                  {searchType && (searchType === 'empresa' || searchType === 'responsável' || searchType === 'cidade') &&
                    <><div>É igual a</div>
                    <TextField
                  margin="dense"
                  label="Pesquisar"
                  type="text"
                  size="small"
                  fullWidth
                  value={searchValue}
                  variant="outlined"
                  onChange={(e) => setSearchValue(e.target.value)}
                  /> </>
                  }
                  {searchType && searchType === 'consultora' &&
                    <><div>É igual a</div>
                    <FormControl margin="normal" fullWidth>
                    <InputLabel id="demo-simple-select-label">Consultora</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={searchValue}
                      label="Consultora"
                      onChange={(e) => setSearchValue(e.target.value)}
                    >
                      {sellers.map((seller) => (
                        <MenuItem value={seller.nome}>{seller.nome}</MenuItem>
                      ))
                      }
                    </Select>
                    </FormControl></>
                  }
                  <Button variant="contained" onClick={() => search(searchType)}>Aplicar</Button>
                </div>
            }
            </Popover>
            </ThemeProvider>   
            </div> */}
            <Filter tableData={activityUser} 
            dataFull={activity} 
            sellers={sellers} 
            userRef={userRef} 
            changeFilter={changeFilter}
            type={'Activity'}
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
