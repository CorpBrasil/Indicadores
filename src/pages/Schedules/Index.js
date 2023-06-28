import { useEffect, useState } from 'react';
import moment from "moment";
import Geocode from "react-geocode";
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom'; // import do hook
import { dataBase } from '../../firebase/database';
import CurrencyInput from "react-currency-input-field";
import { doc, onSnapshot, collection, deleteDoc } from "firebase/firestore";
import CreateSchedule from '../../components/Modal/CreateSchedule/Index';
// import Swal from 'sweetalert2';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import useAuth from '../../hooks/useAuth';
import Header from '../../components/Header/Index';
import { Users, Company, KeyMaps } from '../../data/Data';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PeopleIcon from '@mui/icons-material/People';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

import './_style.scss';

const Schedules = ({ userRef, alerts }) => {
  Geocode.setLanguage("pt-BR");
  Geocode.setRegion("br");
  Geocode.setApiKey(KeyMaps);
  Geocode.setLocationType("ROOFTOP");

    const { user } = useAuth();
    const [schedules, setSchedules] = useState();
    const [posto, setPosto] = useState();
    const [km, setKm] = useState();
    const [litro, setLitro] = useState();
    const [total, setTotal] = useState();
    const [cidade, setCidade] = useState(undefined);
    const [lng, setLng] = useState();
    const [lat, setLat] = useState();
    // eslint-disable-next-line no-unused-vars
    const [rawValue, setRawValue] = useState(" ");
    const [open, setOpen] = useState(false);
    const [financeSchedules, setFinanceSchedules] = useState();
    const navigate = useNavigate(); //chamado do hook
    const [createSchedule, setCreateSchedule] = useState(undefined);
    const schedulesCollectionRef = collection(dataBase, "Agendas");
    const FinanceSchedulesCollectionRef = collection(dataBase, "Financeiro");

    useEffect(() => {
        if(collection) { 
            // const q = query(membersCollectionRef); // Pega aos chats pela ordem descrescente do 'Created'
            const unsub = () => {
              onSnapshot(schedulesCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let docSchedule = [];
              schedules.forEach(doc => {
                docSchedule.push({ ...doc.data(), id: doc.id })
              })
              setSchedules(docSchedule); // puxa a coleção 'Agendas' para o state
            });

              onSnapshot(FinanceSchedulesCollectionRef, (schedules) => { // Atualiza os dados em tempo real
              let docFinance = [];
              schedules.forEach(doc => {
                docFinance.push({ ...doc.data(), id: doc.id })
              })
              setFinanceSchedules(docFinance); // puxa a coleção 'Agendas' para o state
          })
        }
            unsub();
          };
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collection]);

  const returnSchedule = () => {
    setCreateSchedule(false);
  }

  const goToSchedule = (type, year) => {
      navigate(type + year);
  }

  const deleteSchedule = async (id) => {
    try {
      Swal.fire({
        title: Company,
        html: `Você deseja deletar essa <b>Agenda</b>?`,
        icon: "warning",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteDoc(doc(dataBase, "Agendas", id));
          await deleteDoc(doc(dataBase, "Financeiro", id));
          Swal.fire({
            title: Company,
            html: `A Agenda <b>${id}</b> foi deletada com sucesso.`,
            icon: "success",
            showConfirmButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200"
          })
        }
      })
    } catch {

    }
  }

  const handleClickOpen = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
      })
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOnValueChange = (value) => {
    setRawValue(value === undefined ? "undefined" : value || " ");
    setLitro(value);
  };

  const handleOnValueChange2 = (value) => {
    setRawValue(value === undefined ? "undefined" : value || " ");
    setTotal(value);
  };

  useEffect( () => {
    if(!cidade && lng) {
      Geocode.fromLatLng(lat,lng).then(
        async (response) => {
          console.log(response)
         let cityRef = response.results[0].address_components;
        //  const city = cityRef.find((ref) => ref.types[0] === 'administrative_area_level_2');
          setCidade(cityRef.find((ref) => ref.types[0] === 'administrative_area_level_2'));
         // for (let i = 0; i < response.results[0].address_components.length; i++) {
         //   for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
         //     switch (response.results[0].address_components[i].types[j]) {
         //       case "locality":
         //         setCidade(response.results[0].address_components[i].long_name)
         //         break;
         //         default:
         //     }
         //   }
         // }
         //setCidade(response.results[0].address_components.find(ref => ref.types[0] === 'administrative_area_level_2'));
         //setEndereco(response.results[0].formatted_address);
         console.log(cidade)
       },
       (error) => {
         console.log(error);
       })
    }
  },[cidade,lat,lng, open])

  const sendData = (e) => {
    e.preventDefault();
    if(cidade) {
      const totalFormat = total.replace(',',".");
      const litroFormat = litro.replace(',',".");
      const litros = (totalFormat/litroFormat).toFixed(2);
      setOpen(false);
        Swal.fire({
          title: 'Atenção',
          html: `Verifique os dados abaixo para confirmar o <b>Abastecimento.</b> </br></br>` +
          `Nome do Posto: <b>${posto}</b> </br>` +
          `Quilometragem: <b>${km}</b> </br>` +
          `Preço por Litro: <b>R$ ${litro}</b> </br>` +
          `Preço Total: <b>R$ ${total}</b>`,
          icon: "warning",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if(result.isConfirmed) {
            axios.post('https://hook.us1.make.com/7158so5nvctf4a2wkpnfc2s59h9acpnk', {
              data: moment(new Date()).format('DD/MM/YYYY HH:mm'),
              nome: posto,
              km: km,
              litro: litro,
              QtdeLitro: litros,
              total: total,
              lat: lat,
              lng: lng,
              cidade: cidade.long_name,
              endereco: `https://maps.google.com/?q=${lat},${lng}`,
              responsavel: userRef.nome,
              telefone: '5515991573088'
            })
            Swal.fire({
              position: 'top-center',
              icon: 'success',
              title: 'Abastecimento confirmado com Sucesso!',
              showConfirmButton: false,
              timer: 2000
            })
          } else {
            setOpen(true);
          }
      });
    } else {
      setOpen(false);
      Swal.fire({
        title: 'GPS Desativado',
        html: `Ative o <b>GPS</b> para confirmar o abastecimento.`,
        icon: "error",
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        confirmButtonText: "Ok",
      })
    }
  }
  

  return (
    <div className='container-schedules'>
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className='title-schedule'>
        <h2>Agendas</h2>
      </div>
       <div className='content-schedule'>
       {(user.email !== Users[1].email) &&
        <div className='box-schedule'>
          {schedules && schedules.map((schedule, index) => (
            <li key={index} className='schedule'>
              {userRef && (user.email === Users[0].email || userRef.cargo === "Administrador") &&
              <div className='schedule__button'>
                <button onClick={() => deleteSchedule(schedule.id)}></button>
              </div>
              }
              <div className='schedule__content' onClick={() => goToSchedule('/agenda/', schedule.id)}>
              <div className='schedule__text'>
                <p>Agenda</p>
                <p>Visita</p>
                <p>{schedule.id}</p>
              </div>
              <div className='schedule__icon'></div>
              </div>
            </li>
          ))}
       </div>
        }
       {userRef && (user.email === Users[0].email || user.email === Users[1].email || userRef.cargo === "Técnico" || userRef.cargo === "Administrador") &&
        <><div className='box-schedule'>
            {financeSchedules && financeSchedules.map((schedule, index) => (
              <li key={index} className='schedule'>
                {userRef && (user.email === Users[0].email || userRef.cargo === "Administrador") &&
                  <div className='schedule__button'>
                    <button onClick={() => deleteSchedule(schedule.id)}></button>
                  </div>}
                <div className='schedule__content' onClick={() => goToSchedule('/financeiro/', schedule.id)}>
                  <div className='schedule__text'>
                    <p>Agenda</p>
                    <p>Financeiro</p>
                    <p>{schedule.id}</p>
                  </div>
                  <div className='schedule__icon'></div>
                </div>
              </li>
            ))}
          </div></>
      }
       {userRef && (user.email === Users[0].email || userRef.cargo === "Vendedor(a)" || userRef.cargo === "Administrador") &&
        <>
        <div className='box-schedule'>
             <li className='card alert'>
                <Link className='card__content' to="/leads">
                  <div className='card__text'>
                    <p>Confirmar</p>
                    <p>Leads</p>
                  <PeopleIcon />
                  </div>
                </Link>
              </li>
          </div>
          </>
      }
       {userRef && (user.email === Users[0].email || userRef.cargo === "Administrador") &&
        <>
        <div className='box-schedule'>
             <li className='card fuel'>
                <Link className='card__content' onClick={() => handleClickOpen()}>
                  <div className='card__text'>
                    <p>Confirmar</p>
                    <p>Combustivel</p>
                  <LocalGasStationIcon />
                  </div>
                </Link>
              </li>
          </div>
          </>
      }
      {user.email === Users[0].email &&   
      <div className='add-schedule'>
              <button onClick={() => setCreateSchedule(true)} className='add-schedule__btn'></button>
      </div>
      }
      </div>
      {createSchedule && <CreateSchedule returnSchedule={returnSchedule} schedules={schedules}></CreateSchedule>} 
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ fontSize: '1.4rem' }}>Confirmar Combustivel</DialogTitle>
          <form onSubmit={sendData}>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: "1rem" }}>
            Preencha os campos abaixo para confirmar o abastecimento do veículo.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nome do Posto"
            type="text"
            onChange={(e) => setPosto(e.target.value)}
            value={posto || ''}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            margin="dense"
            id="name"
            label="Quilometragem do Veiculo"
            type="number"
            onChange={(e) => setKm(e.target.value)}
            value={km  || ''}
            fullWidth
            required
            variant="outlined"
          />
          <CurrencyInput
          customInput={TextField}
          style={{ margin: '0.7rem 0rem 0.3rem 0' }}
          className="label__text"
          label="Preço por Litro"
          placeholder="R$ 00"
          intlConfig={{ locale: "pt-BR", currency: "BRL" }}
          onValueChange={handleOnValueChange}
          decimalsLimit={2}
          value={litro || ''}
          required
          fullWidth
          />
          <CurrencyInput
          customInput={TextField}
          style={{ margin: '0.3rem 0rem 0.3rem 0' }}
          className="label__text"
          label="Preço Total"
          placeholder="R$ 00"
          intlConfig={{ locale: "pt-BR", currency: "BRL" }}
          onValueChange={handleOnValueChange2}
          decimalsLimit={2}
          value={total || ''}
          required
          fullWidth
          />
          <TextField
            margin="dense"
            id="name"
            label="Veiculo"
            type="number"
            value="004"
            disabled
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button type='submit'>Confirmar</Button>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
          </form>
      </Dialog>
    </div>

  )
}

export default Schedules