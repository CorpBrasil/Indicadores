import { updateDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import Swal from "sweetalert2"; // cria alertas personalizado
import { dataBase } from '../../../../firebase/database';
import { Company } from '../../../../data/Data'

import styles from "./styles.module.scss";

import Dialog from "@mui/material/Dialog";
import { PatternFormat } from "react-number-format";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { theme } from '../../../../data/theme';
import { ThemeProvider } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from "@mui/material/Autocomplete";
import { listCidades } from "../../../../data/Data";


const EditAdmin = ({members, memberRef, open, close, openBox }) => {

  const [cor, setCor] = useState();
  const [telefone, setTelefone] = useState();
  const [idCRM, setIdCRM] = useState();
  const [veiculo, setVeiculo] = useState();
  const [cargo, setCargo] = useState();
  const [cidade, setCidade] = useState();
  const [checkID, setCheckID] = useState(false);
  const [idCidade, setidCidade] = useState();
  const [checkCidade, setCheckCidade] = useState(false);
  const [indicadores, setIndicadores] = useState([]);
  const [orcamentistaRef, setOrcamentistaRef] = useState([]);
  const [orcamentista, setOrcamentista] = useState([]);

  console.log(idCidade)

  // useLayoutEffect(() => {
  //   // faz a solicitação do servidor assíncrono e preenche o formulário
  //   setTimeout(() => {
  //     reset({
  //       nome: memberRef.nome,
  //       veiculo: memberRef.veiculo,
  //     });
  //   }, 0);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [memberRef]);

  // useEffect(() => {
  //   if(idCidade !== cidade.code && memberRef.cargo === 'Indicador') {
  //     if(members && members.find((data) => data.id_user === cidade.code + ' - ' + idCidade)) {
  //       setCheckID(true);
  //     } else {
  //       setCheckID(false);
  //     }
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[idCidade])

  useEffect(() => {
    const fethData = () => {
      setIndicadores(members && members.filter((data) => data.cargo === 'Indicador'))
      setOrcamentistaRef(members && members.filter((data) => data.cargo === 'Orçamentista'))
    }
    fethData();
  },[members])
  
  
  
  useEffect(() => {
    if(open && memberRef.cargo === "Indicador") {
      if(cidade === null) {
          setCheckCidade(true);
        } else {
          setCheckCidade(false);
          if(cidade && cidade.code !== memberRef.cidade.code) {
            setTimeout(() => {
              setidCidade(indicadores && indicadores.find((data) => data.cidade.code === cidade.code) ? String(indicadores.filter((data) => data.cidade.code === cidade.code).length + 100) : '100')
            }, 100);
          } else if(memberRef && memberRef.cargo === 'Indicador') {
            setidCidade(memberRef && memberRef.id_user.slice(5,9))
          }
        }
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cidade,indicadores, idCidade, open])

 useEffect(() => {
  if(open) {
    setCor(memberRef && memberRef.cor);
    setTelefone(memberRef && memberRef.telefone);
    setCargo(memberRef && memberRef.cargo);
    if(memberRef && memberRef.cargo === 'Orçamentista') {
      setIdCRM(memberRef && memberRef.id_crm);
    }
    if(memberRef && memberRef.cargo === 'Closer') {
      setVeiculo(memberRef && memberRef.veiculo);
    }
    if(memberRef && memberRef.cargo === 'Indicador') {
      setCidade(memberRef && memberRef.cidade);
      setidCidade(memberRef && memberRef.id_user.slice(5,9));
      setOrcamentista(orcamentistaRef.filter((data) => data.uid === memberRef.orcamentista.uid)[0]);
    }
  }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[open])



  const onSubmit = async (e) => {
        e.preventDefault();
        try {
          close();
          Swal.fire({
            title: Company,
            text: `Você deseja alterar os dados?`,
            icon: "question",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonColor: "#F39200",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
          }).then(async (result) => {
            if (result.isConfirmed) {
              let data;
              switch(cargo) {
                case 'Indicador':
                  data = {
                    cargo: cargo,
                    cidade: cidade,
                    id_user: cidade.code + ' - ' + idCidade,
                    telefone: telefone,
                    orcamentista: {
                      nome: orcamentista.nome,
                      uid: orcamentista.uid
                    }
                  }
                break
                case 'Orçamentista':
                  data = {
                    cargo: cargo,
                    id_crm: idCRM,
                    telefone: telefone
                  }
                break
                case 'Closer':
                  data = {
                    veiculo: veiculo,
                    cargo: cargo,
                    telefone: telefone
                  }
                break
                default: 
                  data = {
                    cargo: cargo,
                    telefone: telefone
                  }
              }
              await updateDoc(doc(dataBase,"Membros", memberRef.id), data).then((result) => {
                Swal.fire({
               title: Company,
               html: 'Os dados do Colaborador(a) foi alterado com sucesso.',
               icon: "success",
               showConfirmButton: true,
               showCloseButton: true,
               confirmButtonColor: "#F39200"
             }).then((result) => {
               close();
             })
              })
              } else {
                openBox('edit');
              }   
            })
        } catch (error) {
          // console.log(error);
        }
    }

    console.log(orcamentistaRef)
    console.log(orcamentista)

  return (
    <Dialog
      className={styles.dialog}
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={() => close()}
    >
      <IconButton
          aria-label="close"
          onClick={close}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        ><CloseIcon /></IconButton>
      <DialogTitle align="center">Editar Colaborador(a)</DialogTitle>
      <DialogContent>
        {/* <DialogContentText sx={{ textAlign: "center" }}>
          Preencha os campos abaixo para agendar a <b>Visita</b>.
        </DialogContentText> */}
        <form onSubmit={onSubmit}>
        <ThemeProvider theme={theme}>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nome"
          type="text"
          value={memberRef && memberRef.nome}
          fullWidth
          disabled
          variant="outlined"
        />
          <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
            <InputLabel id="simple-select-label">Cargo</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              value={cargo ? cargo : ''}
              label="Cargo"
              // onChange={(e) => setCargo(e.target.value)}
              disabled
            >
              <MenuItem value="Indicador">Indicador</MenuItem>
              <MenuItem value="Orçamentista">Orçamentista</MenuItem>
              <MenuItem value="Closer">Especialista em Apresentação e Fechamento</MenuItem>
              <MenuItem value="Gestor">Gestor</MenuItem>
              </Select>
            </FormControl>
            {cargo && cargo === 'Indicador' && 
          <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
            <InputLabel id="simple-select-label">Orçamentista</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              displayEmpty
              sx={{ margin: '0.3rem 0' }}
              value={orcamentista ? orcamentista : ''}
              label="Orçament"
              onChange={(e) => setOrcamentista(e.target.value)}
              required
              >
                {orcamentistaRef && orcamentistaRef.map((data) => (
                <MenuItem value={data}>{data.nome}</MenuItem>
                ))}
            </Select>
          </FormControl> 
          }
            {cargo && cargo === 'Indicador' && 
            <><FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
                <Autocomplete
                  disablePortal
                  fullWidth
                  sx={{ margin: '0.3rem 0' }}
                  value={cidade ? cidade : { code: '00', cidade: 'Nenhuma' }}
                  onChange={(event, newValue) => {
                    setCidade(newValue);
                  } }
                  color="primary"
                  clearText='Escolha uma cidade'
                  clearOnEscape={true}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  getOptionLabel={(option) => option.cidade + ' - ' + option.code}
                  options={listCidades ? listCidades : ['']}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cidade"
                      required
                      helperText={checkCidade ? 'Selecione uma cidade' : ''}
                      error={checkCidade}
                      style={{ zindex: 111111 }}
                      color="primary" />
                  )} />
              </FormControl><TextField
                  label="ID"
                  disabled
                  fullWidth
                  required
                  value={idCidade ? idCidade : ''}
                  margin="dense"
                  id="outlined-start-adornment"
                  onChange={(e) => setidCidade(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{cidade && cidade.code} - </InputAdornment>,
                  }} /></>
          }
          {cargo && cargo === 'Orçamentista' && 
            <TextField
            autoFocus
            margin="dense"
            id="name"
            label="ID do CRM"
            type="number"
            value={idCRM ? idCRM : ''}
            onChange={(e) => setIdCRM(e.target.value)}
            fullWidth
            variant="outlined"
          />
          }
          {cargo && cargo === 'Closer' &&
            <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Veiculo"
            type="text"
            value={veiculo ? veiculo : ''}
            onChange={(e) => setVeiculo(e.target.value)}
            fullWidth
            variant="outlined"
          />
          }
        <div className={styles.label_content}>
          <div className={styles.input_telefone}>
            <span>Telefone</span>
            <PatternFormat
              className="label__input"
              onChange={(e) => setTelefone(e.target.value)}
              format="## (##) ##### ####"
              mask="_"
              placeholder="00 (00) 00000 0000"
              value={telefone ? telefone : ''}
              label="Telefone"
              minLength={9}
              variant="outlined"
              color="primary"
              required
            />
          </div>
          {/* <div>
          <span>Cor</span>
          <input type="color"
            className={styles.color}
            value={cor ? cor : ''}
            style={{ backgroundColor: cor }}
            onChange={(e) => setCor(e.target.value)}
            required
          />
             <p className={styles.name_color}>{memberRef && memberRef.nome}</p>
          </div> */}
        </div>
          </ThemeProvider>
          <ThemeProvider theme={theme}>
          <DialogActions sx={{ justifyContent: 'center' }}>
          <Button type="submit">Confirmar</Button>
          <Button onClick={() => close()}>Cancelar</Button>
        </DialogActions>
          </ThemeProvider>
        </form>
      </DialogContent>
    </Dialog>
    // <div className='modal-visit'>
    //    <div className='modal-box-visit'>
    //         <div className='modal-box-visit__close'>
    //             <button onClick={returnAdmin} className='btn-close' />
    //         </div>
    //         <h4>Editar {memberRef.cargo === 'Técnico' ? 'Veículo do Técnico' : 'Cor'}</h4> 
    //     <form className='form-visit' onSubmit={handleSubmit(onSubmit)}>
    //     <label className="form-visit__label">
    //     <p>Colaborador(a)</p>
    //         <input
    //           className="form-visit__text"
    //           type="text"
    //           {...register("nome")}
    //           disabled
    //         />
    //       </label>
           
    //       {memberRef.cargo !== 'Técnico' ? 
    //         (<><div className='form-visit__color' style={{ flexDirection: 'column' }}>
    //           <p>Escolha uma cor de destaque</p>
    //           <input
    //             type="color"
    //             autoComplete="off"
    //             value={cor}
    //             onChange={(e) => setCor(e.target.value)}
    //             required />
    //         </div><div className='form-visit__exemple'>
    //             <h3>Resultado:</h3>
    //             <p style={cor && {
    //               backgroundColor: cor,
    //               borderBottom: '1px solid' + cor,
    //               borderRight: '1px solid' + cor,
    //               borderLeft: '1px solid' + cor,
    //               color: "#fff",
    //               textShadow: '#5a5a5a -1px 0px 5px',
    //             }}>{memberRef.nome}</p>
    //           </div></>) : (<label className="form-visit__label">
    //        <p>Veículo</p>
    //         <input
    //           className="form-visit__text"
    //           type="number"
    //           placeholder="Digite o número do Veículo"
    //           autoComplete="off"
    //           onInput={(e) => e.target.value = e.target.value.slice(0, 3)}
    //           {...register("veiculo")}
    //           required
    //         />
    //       </label>)
    //         }
    //     <input className='form-visit__btn' type="submit" value="CONFIRMAR"/>
    //   </form> 
    //     </div> 
    // </div>
  )
}

export default EditAdmin