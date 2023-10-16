import { useState, memo } from "react";
import { dataBase } from "../../firebase/database";
import Header from "../../components/Header/Index";
import {updateDoc, doc} from "firebase/firestore";

// Css
// import "cooltipz-css";
import styles from "./style.module.scss";
// import '../../styles/_filter.scss';

import { ReactComponent as ReportIcon } from '../../images/icons/Report.svg';

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


const Report = ({ user, userRef, alerts, reports}) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  console.log(reports)

  // useEffect(() => {
  //   if(userRef && userRef.cargo === 'Vendedor(a)' && reports) {
  //     setReportUser(reports.filter((act) => act.consultora_uid === user.id))
  //   } else if(userRef && userRef.cargo !== 'Vendedor(a)') {
  //     setReportUser(reports);
  //   }
  //   localStorage.setItem('reports', reports && reports.length);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[reports,userRef])

  const handleToggle = async (id) => {
    if(reports.length - userRef.relatorio !== 0) {
      await updateDoc(doc(dataBase,"Membros", userRef.id), {
        relatorio: (reports.length - userRef.relatorio) + userRef.relatorio 
      })
    }
    setOpen((prevState) => ({[id]: !prevState[id] }));
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
  

  return (
    <div className={styles.container_panel}>
        {/* {loading && loading &&
          <Box className="loading">
              <CircularProgress />
          </Box>
        } */}
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className={styles.title_panel}>
        <ReportIcon className={styles.prospecction_icon}/>
        <h2>Relatório</h2>
          {/* <Dashboard schedule={activity} type={'prospeccao'} /> */}
      </div>
      <div className={styles.content_panel}>
        <div className={styles.box_panel}>
            {/* <Filter tableData={leadsUser} 
            dataFull={leads} 
            sellers={sellersOrder} 
            userRef={userRef} 
            changeFilter={changeFilter}
            type={'prospeccao'}
            /> */}
          <div className={styles.box_activity}>
          <TableContainer className={styles.table_center} component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Data de Criação</TableCell>
                  <TableCell align="center">Setor</TableCell>
                  <TableCell align="center">Titulo</TableCell>
                  <TableCell align="center">Consultora</TableCell>
                  <TableCell align="center">Responsável</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              {reports && reports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((data, index) => (
              <TableBody>
                <TableRow
                  key={index}
                  hover
                  className={`list-visit`}
                  // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                  <TableCell align="center">{data.data.replace('/', 'de').replace('/','de').replace('-', 'às')}</TableCell>
                  <TableCell align="center">{data.setor}</TableCell>
                  <TableCell align="center">Relátorio {data.consultora} - {data.data_inicio} - {data.data_final}</TableCell>
                  <TableCell align="center">{data.consultora}</TableCell>
                  <TableCell align="center">{data.responsavel}</TableCell>
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
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0, height: 0 }} colSpan={6}>
                      <Collapse in={open[data.id]} timeout="auto" unmountOnExit colSpan={6}>
                      <Box className={styles.info_anotacao} margin={3}>
                      <div className={styles.anotacao}>{data.anotacao}
                      <h4 className={styles.anotacao_title}>Relátorio Comercial - {data && data.data_inicio} até {data && data.data_final}</h4>
                        <div className={styles.anotacao_item}>
                        <h4>Visitas</h4>
                          <ul>
                            <li>
                            Foram agendadas <b>{data && data.visitas} visitas</b> ao longo da semana.
                          </li>
                            <li>
                            Destas, <b>{data && data.visitas_confirmada} visitas</b> foram confirmadas e <b>{data && data.visitas_naoConfirmada} visitas</b> não foram confirmadas.
                          </li>
                            <li>
                            A meta de visitas para a semana era de <b>{data && data.visitas_meta}</b>, e você antigiu <b>{data && data.visitas_metaR}%</b>.
                          </li>
                          </ul>
                        </div>
                        <div className={styles.anotacao_item}>
                        <h4>Vendas</h4>
                          <ul>
                          {data && data.visitas ? 
                            <li>
                            Não foram registradas vendas, resultando em <b>0%</b> da meta de vendas alcançada.
                            </li> :
                            <li>
                            Foi registrado <b>{data && data.vendas} venda(s)</b>, resultando em <b>{data && data.vendas_metaR}%</b> da meta de vendas alcançada.
                            </li> 
                        }
                            <li>
                            A meta de vendas para a semana era de <b>{data && data.vendas_meta}</b>.
                          </li>
                          </ul>
                        </div>
                        <div className={styles.anotacao_item}>
                        <h4>Leads</h4>
                          <ul>
                            <li>
                            Foram gerados <b>{data && data.leads} leads</b> durante a semana.
                          </li>
                            <li>
                            <b>{data && data.leadsSheet_robo}</b> vieram do Robô, <b>{data && data.leadsSheet_meetime}</b> da Meetime e <b>{data && data.leadsSheet_ganho}</b> de Prospecção.
                          </li>
                          </ul>
                        </div>
                        <div className={styles.anotacao_item}>
                        <h4>Prospecção</h4>
                          <ul>
                            <li>
                            Você possui <b>{data && data.prospeccao ? data.prospeccao : 0} leads ativos</b>.
                          </li>
                            <li>
                            Durante o periodo, <b>{data && data.prospeccao_ganho} novo(s) lead(s)</b> foi adquirido, enquanto <b>{data && data.prospeccao_perdido} leads</b> foram perdidos.
                          </li>
                          </ul>
                        </div>
                        <div className={styles.anotacao_item}>
                        <h4>Atividades Realizadas</h4>
                          <ul>
                            <li>
                            Um total de <b>{data && data.atividades}</b> atividades foram realizadas.
                          </li>
                            <li>
                            A distribuição das atividades foi a seguinte:
                            <ul>
                              <li>Email: <b>{data && data.atividades_email}</b> atividades</li>
                              <li>Ligação: <b>{data && data.atividades_ligacao}</b> atividades</li>
                              <li>WhatsApp: <b>{data && data.atividades_whats}</b> atividade</li>
                            </ul>
                          </li>
                          <li>Você alcançou <b>{data && data.atividades_metaR}%</b> da meta de atividades, com uma meta estabelecida de <b>{data && data.atividades_meta} atividades.</b></li>
                          </ul>
                        </div>
                        <div className={styles.anotacao_item}>
                        <h4>Feedback</h4>
                        <p>{data && data.feedback}</p>
                        </div>
                      </div>
                      </Box>
                    </Collapse>
                </TableCell>
              </TableRow>
            </TableBody>
              ))}
            </Table>
            <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Relatório por página"
            component="div"
            count={reports ? reports.length : 0}
            page={!reports || reports.length <= 0 ? 0 : page}
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

export default memo(Report);
