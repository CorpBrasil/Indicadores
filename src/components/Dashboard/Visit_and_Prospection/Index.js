import { memo, useRef } from 'react';
import { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { ReactComponent as ScheduleIcon2 } from "../../../images/icons/Schedule2.svg";
import { ReactComponent as CheckIcon } from "../../../images/icons/Check.svg";
import { ReactComponent as BlockIcon } from "../../../images/icons/Block.svg";
import { ReactComponent as ProspectionIcon } from '../../../images/icons/Prospection.svg';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda
import PersonIcon from '@mui/icons-material/Person'; // Ativo
import HowToRegIcon from '@mui/icons-material/HowToReg'; // Ganho
import PersonOffIcon from '@mui/icons-material/PersonOff'; // Perdido
import ContactPageIcon from '@mui/icons-material/ContactPage'; // Orçamento
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'; // Apresentação

const Dashboard = ({ data, monthSelect, type, total, sellers }) => {
  // const [dataChart, setdataChart] = useState();
  const [data1, setData1] = useState();
  const [data2, setData2] = useState();
  const [data3, setData3] = useState();
  const [ganho, setGanho] = useState();
  const [perdido, setPerdido] = useState();
  const [confirmar, setConfirmar] = useState();
  const [nconfirmar, setNconfirmar] = useState();
  const [mes, setMes] = useState();
  const totalValue = useRef();

  useEffect(() => {
    if (data && monthSelect && type !== 'prospeccao') {
          setData1(data.filter((vis) => vis.categoria === 'comercial').length);
          setData2(data.filter((vis) => vis.categoria === 'comercial_tecnica').length);
          setData3(data.filter((vis) => vis.categoria === 'pos_venda').length);
          setConfirmar(data.filter((vis) => vis.confirmar === true).length);
          setNconfirmar(data.filter((vis) => vis.confirmar === false).length);
          totalValue.current = data.filter((ref) => ref.tecnico && ref.tecnico !== 'Nenhum' && ref.tecnico !== 'Bruna' && ref.tecnico !== 'Lia' && ref.consultora !== 'Pós-Venda').length * 20;
          switch(monthSelect) {
              case '01':
                setMes('Janeiro');
                break;
              case '02':
                setMes('Fevereiro');
                break;
              case '03':
                setMes('Março');
                break;
              case '04':
                setMes('Abril');
                break;
              case '05':
                setMes('Maio');
                break;
              case '06':
                setMes('Junho');
                break;
              case '07':
                setMes('Julho');
                break;
              case '08':
                setMes('Agosto');
                break;
              case '09':
                setMes('Setembro');
                break;
              case '10':
                setMes('Outubro');
                break;
              case '11':
                setMes('Novembro');
                break;
              case '12':
                setMes('Dezembro');
                break;
              default:
                break;
            }
      }
    if(data && type === 'prospeccao') {
      setGanho(data.filter((vis) => vis.status === 'Ganho').length)
      setPerdido(data.filter((vis) => vis.status === 'Perdido').length)
      setData1(data.filter((vis) => vis.status === 'Ativo').length);
      setData2(data.filter((vis) => vis.status === 'Orçamento' || vis.status === 'Aguardando Apresentação').length);
      setData3(data.filter((vis) => vis.status === 'Apresentação').length);
    }
  }, [monthSelect, data, type]);


  // useEffect(() => {
  //   if(data) {
  //     if(type === 'visit') {
  //       setdataChart([
  //         {
  //           name: 'Ana',
  //           Visitas: data.filter((con) => con.consultora === 'Ana').length,
  //           fill: '#F28500'
  //         },
  //         {
  //           name: 'Bruna',
  //           Visitas: data.filter((con) => con.consultora === 'Bruna').length,
  //           fill: '#44BF2B'
  //         },
  //         {
  //           name: 'Lia',
  //           Visitas: data.filter((con) => con.consultora === 'Lia').length,
  //           fill: '#E892DD'
  //         }
  //       ])
  //     }
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[data])

  console.log(total)

  return (
    <div className="dashboard">
          <h2 className="dashboard-title">Visão Geral</h2>
          <div className="dashboard__content">
          <div className="dashboard__box1">
            {type === 'prospeccao' ? 
            <div className="dashboard__box1-info">
              <h1>{data && data.length}</h1>
              <h2>Leads</h2>
            </div> :
            <div className="dashboard__box1-info">
              <h1>{data && data.length}</h1>
              <h2>Visitas em {mes}</h2>
            </div> 
          }
            {type === 'financeiro' &&
            <div className="dashboard__box1-info">
              <h1>{totalValue.current && totalValue.current.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h1>
              <h2>Comissão em {mes}</h2>
            </div>
            }
            {type === 'visit' && 
              <div className="dashboard__box1-info">
                <div>
                  <CheckIcon />
                  <h1>{confirmar}</h1>
                  <p>Confirmada(s)</p>
                </div>
                <div>
                  <BlockIcon />
                  <h1>{nconfirmar}</h1>
                  <p>Não Confirmada(s)</p>
                </div>
              </div>
            }
            {type === 'prospeccao' && 
              <div className="dashboard__box1-info">
              <div>
                <HowToRegIcon sx={{ fill: 'green' }} />
                <h1>{ganho ? ganho : 0}</h1>
                <p>Ganho(s)</p>
              </div>
              <div>
                <PersonOffIcon sx={{ fill: 'red' }} />
                <h1>{perdido ? perdido : 0}</h1>
                <p>Perdido(s)</p>
              </div>
            </div>
            }
          </div>
          {type === 'prospeccao' ? 
          <div className="dashboard__box2">
            <div className="dashboard__box2-icon">
              <ProspectionIcon />
            </div>
            <h2>Leads</h2>
            <ul className="dashboard__box2-visits">
              <li>
                <div className="dashboard__box2-visits-info">
                  <span className="visit-icon ativo"><PersonIcon /></span>
                  <p>Ativo</p>
                </div>
              <h3>{data1}</h3>
              </li>
              <li>
                <div className="dashboard__box2-visits-info">
                  <span className="visit-icon orcamento"><ContactPageIcon /></span>
                  <p>Orçamento</p>
                </div>
              <h3>{data2}</h3>
              </li>
              <li>
                <div className="dashboard__box2-visits-info">
                  <span className="visit-icon apresentacao"><AssignmentIndIcon /></span>
                  <p>Apresentação</p>
                </div>
              <h3>{data3}</h3>
              </li>
            </ul>
          </div> :
          <div className="dashboard__box2">
          <div className="dashboard__box2-icon">
            <ScheduleIcon2 />
          </div>
          <h2>Visitas</h2>
          <ul className="dashboard__box2-visits">
            <li>
              <div className="dashboard__box2-visits-info">
                <span className="visit-icon comercial"><RequestQuoteIcon /></span>
                <p>Comercial</p>
              </div>
            <h3>{data1}</h3>
            </li>
            <li>
              <div className="dashboard__box2-visits-info">
                <span className="visit-icon comercial_tec"><PeopleIcon /></span>
                <p>Comercial + Téc.</p>
              </div>
            <h3>{data2}</h3>
            </li>
            <li>
              <div className="dashboard__box2-visits-info">
                <span className="visit-icon pos_venda"><EngineeringIcon /></span>
                <p>Pós-Venda</p>
              </div>
            <h3>{data3}</h3>
            </li>
          </ul>
        </div>
        }
          <div className="dashboard__box3">
            {type === 'visit' ? 
              <h2>Visitas por Indicador</h2> :
              <h2>Ranking de Indicadores</h2>
            }
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Nome</TableCell>
                    <TableCell align="center">Cidade</TableCell>
                    {type !== 'prospeccao' && 
                      <TableCell align="center">Visitas</TableCell>
                    }
                    {type === 'prospeccao' &&
                      <><TableCell align="center">Leads</TableCell>
                      <TableCell align="center">Orçamento</TableCell></>
                    }
                  </TableRow>
                </TableHead>
                {sellers && sellers.map((seller, index) => (
                <TableBody>
                  <TableRow
                    key={index}
                    hover
                    className={`list-visit`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="center">{seller.nome} ({seller.id_user})</TableCell>
                    <TableCell align="center">{seller.cidade.cidade}</TableCell>
                    {type === 'financeiro' &&
                      <TableCell align="center">{data && data.filter((item) => item.indicadorUID === seller.id).length}</TableCell>
                    }
                    {type === 'visit' &&
                      <TableCell align="center">{data && data.filter((item) => item.uid === seller.id).length}</TableCell>
                    }
                    {type === 'prospeccao' &&
                      <><TableCell align="center" aria-label={`Ganho: ${data && data.filter((item) => item.uid === seller.id && item.status === 'Ganho').length} Perdido: ${data && data.filter((item) => item.uid === seller.id && item.status === 'Perdido').length}`} data-cooltipz-dir="top">{data && data.filter((item) => item.uid === seller.id).length}</TableCell>
                      <TableCell align="center">{data && data.filter((item) => item.uid === seller.id &&
                       item.status !== 'Orçamento Cancelado' && item.status !== 'Ativo' && item.status !== 'Perdido').length}</TableCell></>
                    }
                  </TableRow>
              </TableBody>
                ))}
              </Table>
            </TableContainer>
          </div>
        {/* <div className="dashboard__box3"> 
        //   <h2>Visitas por Consultoras</h2>
        //   <ResponsiveContainer width="90%" height="80%">
        //   <BarChart
        //     width='100%'
        //     height='100%'
        //     data={dataChart}
        //     margin={{
        //       top: 5,
        //       right: 30,
        //       bottom: 5,
        //     }}
        //   >
        //     <CartesianGrid strokeDasharray="3 3" />
        //     <XAxis dataKey="name" />
        //     <YAxis />
        //     <Tooltip />
        //     <Bar dataKey="Visitas" fill="#8884d8" />
        //   </BarChart>
        //   </ResponsiveContainer>
                  // </div>*/}
          </div>
        </div>
  )
}

export default memo(Dashboard);