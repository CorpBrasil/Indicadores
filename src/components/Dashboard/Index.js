import React from 'react'
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

import { ReactComponent as ScheduleIcon2 } from "../../images/icons/Schedule2.svg";
import { ReactComponent as CheckIcon } from "../../images/icons/Check.svg";
import { ReactComponent as BlockIcon } from "../../images/icons/Block.svg";
import { ReactComponent as ProspectionIcon } from '../../images/icons/Prospection.svg';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // Visita Comercial
import PeopleIcon from '@mui/icons-material/People'; // Tecnica + Comercial
import EngineeringIcon from '@mui/icons-material/Engineering'; // Pós Venda
import { ReactComponent as Email } from '../../images/icons/Mail.svg';
import { ReactComponent as Phone } from '../../images/icons/Phone.svg';
import { ReactComponent as WhatsApp } from '../../images/icons/WhatsApp.svg';

const Dashboard = ({ schedule, monthSelect, type, total }) => {
  const [dataChart, setdataChart] = useState();
  const [data1, setData1] = useState();
  const [data2, setData2] = useState();
  const [data3, setData3] = useState();
  const [confirmar, setConfirmar] = useState();
  const [nconfirmar, setNconfirmar] = useState();
  const [visitas, setVisitas] = useState();
  const [atividadesHoje, setAtividadesHoje] = useState();
  const [mes, setMes] = useState();

  useEffect(() => {
    if (schedule && monthSelect && type !== 'prospeccao') {
          setData1(schedule.filter((vis) => vis.categoria === 'comercial').length);
          setData2(schedule.filter((vis) => vis.categoria === 'comercial_tecnica').length);
          setData3(schedule.filter((vis) => vis.categoria === 'pos_venda').length);
          setConfirmar(schedule.filter((vis) => vis.confirmar === true).length);
          setNconfirmar(schedule.filter((vis) => vis.confirmar === false).length);
          setVisitas(schedule.filter((vis) => vis.categoria !== 'lunch').length);
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
    if(schedule && type === 'prospeccao') {
      setData1(schedule.filter((vis) => vis.atividade === 'Email').length);
      setData2(schedule.filter((vis) => vis.atividade === 'Ligação').length);
      setData3(schedule.filter((vis) => vis.atividade === 'WhatsApp').length);
      setAtividadesHoje(schedule.filter((act) => act.dataRef === moment(new Date()).format('YYYY-MM-DD')));
    }
  }, [monthSelect, schedule, type]);

  useEffect(() => {
    if(schedule) {
      if(type === 'prospeccao') {
        setdataChart([
          {
            name: 'Ana',
            Atividades: schedule.filter((con) => con.consultora === 'Ana').length,
            fill: '#F28500'
          },
          {
            name: 'Bruna',
            Atividades: schedule.filter((con) => con.consultora === 'Bruna').length,
            fill: '#44BF2B'
          },
          {
            name: 'Lia',
            Atividades: schedule.filter((con) => con.consultora === 'Lia').length,
            fill: '#E892DD'
          },
          {
            name: 'Fernanda',
            Atividades: schedule.filter((con) => con.consultora === 'Fernanda').length,
            fill: '#FFC107'
          },
          {
            name: 'Leticia',
            Atividades: schedule.filter((con) => con.consultora === 'Leticia').length,
            fill: '#B901C6'
          }
        ])
      } else {
        setdataChart([
          {
            name: 'Ana',
            Visitas: schedule.filter((con) => con.consultora === 'Ana').length,
            fill: '#F28500'
          },
          {
            name: 'Bruna',
            Visitas: schedule.filter((con) => con.consultora === 'Bruna').length,
            fill: '#44BF2B'
          },
          {
            name: 'Lia',
            Visitas: schedule.filter((con) => con.consultora === 'Lia').length,
            fill: '#E892DD'
          },
          {
            name: 'Fernanda',
            Visitas: schedule.filter((con) => con.consultora === 'Fernanda').length,
            fill: '#FFC107'
          },
          {
            name: 'Leticia',
            Visitas: schedule.filter((con) => con.consultora === 'Leticia').length,
            fill: '#B901C6'
          }
        ])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[schedule])

  return (
    <div className="dashboard">
          <h2 className="dashboard-title">Visão Geral</h2>
          <div className="dashboard__content">
          <div className="dashboard__box1">
            {type === 'prospeccao' ? 
            <div className="dashboard__box1-info">
              <h1>{schedule && schedule.length}</h1>
              <h2>Atividades Totais</h2>
            </div> :
            <div className="dashboard__box1-info">
              <h1>{visitas}</h1>
              <h2>Visitas em {mes}</h2>
            </div> 
          }
            {type === 'financeiro' &&
            <div className="dashboard__box1-info">
              <h1>{total && total.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</h1>
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
              <h1>{atividadesHoje && atividadesHoje.length}</h1>
              <h2>Atividades Hoje</h2>
            </div>
            }
          </div>
          {type === 'prospeccao' ? 
          <div className="dashboard__box2">
            <div className="dashboard__box2-icon">
              <ProspectionIcon />
            </div>
            <h2>Atividades</h2>
            <ul className="dashboard__box2-visits">
              <li>
                <div className="dashboard__box2-visits-info">
                  <span className="visit-icon mail"><Email /></span>
                  <p>Email</p>
                </div>
              <h3>{data1}</h3>
              </li>
              <li>
                <div className="dashboard__box2-visits-info">
                  <span className="visit-icon phone"><Phone /></span>
                  <p>Ligação</p>
                </div>
              <h3>{data2}</h3>
              </li>
              <li>
                <div className="dashboard__box2-visits-info">
                  <span className="visit-icon whatsapp"><WhatsApp /></span>
                  <p>WhatsApp</p>
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
          {type === 'prospeccao' ?
          <div className="dashboard__box3">
            <h2>Atividades por Consultoras</h2>
            <ResponsiveContainer width="90%" height="80%">
            <BarChart
              width='100%'
              height='100%'
              data={dataChart}
              margin={{
                top: 5,
                right: 30,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {type === 'prospeccao' ? 
              <Bar dataKey="Atividades" fill="#8884d8" /> :
              <Bar dataKey="Visitas" fill="#8884d8" />
            }
            </BarChart>
            </ResponsiveContainer>
          </div> :
          <div className="dashboard__box3">
          <h2>Visitas por Consultoras</h2>
          <ResponsiveContainer width="90%" height="80%">
          <BarChart
            width='100%'
            height='100%'
            data={dataChart}
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Visitas" fill="#8884d8" />
          </BarChart>
          </ResponsiveContainer>
        </div>
        }
          </div>
        </div>
  )
}

export default Dashboard;