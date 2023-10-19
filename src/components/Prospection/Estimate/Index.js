// import { updateDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import CurrencyInput from "react-currency-input-field";
// import Swal from "sweetalert2"; // cria alertas personalizado
// import { dataBase } from '../../../firebase/database';
// import { Company } from '../../../data/Data'
import { styled } from '@mui/material/styles';
import styles from "./styles.module.scss";

import Dialog from "@mui/material/Dialog";
import useMediaQuery from '@mui/material/useMediaQuery';
import { PatternFormat } from "react-number-format";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { theme } from '../../../data/theme';
import { ThemeProvider } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';


const Estimate = ({data, openEstimate, close}) => {

  const [telefone, setTelefone] = useState();
  const [cpf, setCpf] = useState();
  const [dataNascimento, setDataNascimento] = useState();
  const [consumo, setConsumo] = useState();
  const [endereco, setEndereco] = useState();
  const [bairro, setBairro] = useState();
  const [cidade, setCidade] = useState();
  const [fatura, setFatura] = useState();
  const [anotacao, setAnotacao] = useState();
  // eslint-disable-next-line no-unused-vars
  const [rawValue ,setRawValue] = useState("");
  const [openFatura, setOpenFatura] = useState(false);
  const [viewVisit, setviewVisit] = useState(false);
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));


  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  })

  console.log(data);

  const handleOnValueChange = (value) => {
    setRawValue(value === undefined ? "undefined" : value || " ");
    setConsumo(value);
  };

  useEffect(() => {
    if(openEstimate) {
      setCidade(data && data.cidade);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[openEstimate])

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

  // useEffect(() => {
  //   const fethData = () => {
  //     setIndicadores(members && members.filter((data) => data.cargo === 'Indicador'))
  //     setOrcamentistaRef(members && members.filter((data) => data.cargo === 'Orçamentista'))
  //   }
  //   fethData();
  // },[members])
  
  
  
  // useEffect(() => {
  //   if(open && memberRef.cargo === "Indicador") {
  //     if(cidade === null) {
  //         setCheckCidade(true);
  //       } else {
  //         setCheckCidade(false);
  //         if(cidade && cidade.code !== memberRef.cidade.code) {
  //           setTimeout(() => {
  //             setidCidade(indicadores && indicadores.find((data) => data.cidade.code === cidade.code) ? String(indicadores.filter((data) => data.cidade.code === cidade.code).length + 100) : '100')
  //           }, 100);
  //         } else if(memberRef && memberRef.cargo === 'Indicador') {
  //           setidCidade(memberRef && memberRef.id_user.slice(5,9))
  //         }
  //       }
  //   }
    
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[cidade,indicadores, idCidade, open])

  const onVisit = (e) => {
    e.preventDefault();
    setviewVisit(true);
  }

  // const onSubmit = async (e) => {
  //       e.preventDefault();
  //       try {
  //         close();
  //         Swal.fire({
  //           title: Company,
  //           text: `Você deseja alterar os dados?`,
  //           icon: "question",
  //           showCancelButton: true,
  //           showCloseButton: true,
  //           confirmButtonColor: "#F39200",
  //           cancelButtonColor: "#d33",
  //           confirmButtonText: "Sim",
  //           cancelButtonText: "Não",
  //         }).then(async (result) => {
  //           if (result.isConfirmed) {
  //             let data;
  //             // switch(cargo) {
  //             //   case 'Indicador':
  //             //     data = {
  //             //       cargo: cargo,
  //             //       cidade: cidade,
  //             //       id_user: cidade.code + ' - ' + idCidade,
  //             //       telefone: telefone,
  //             //       orcamentista: {
  //             //         nome: orcamentista.nome,
  //             //         uid: orcamentista.uid
  //             //       }
  //             //     }
  //             //   break
  //             //   case 'Orçamentista':
  //             //     data = {
  //             //       cargo: cargo,
  //             //       id_crm: idCRM,
  //             //       telefone: telefone
  //             //     }
  //             //   break
  //             //   case 'Closer':
  //             //     data = {
  //             //       veiculo: veiculo,
  //             //       cargo: cargo,
  //             //       telefone: telefone
  //             //     }
  //             //   break
  //             //   default: 
  //             //     data = {
  //             //       cargo: cargo,
  //             //       telefone: telefone
  //             //     }
  //             // }
  //             await updateDoc(doc(dataBase,"Leads", data.id), data).then((result) => {
  //               Swal.fire({
  //              title: Company,
  //              html: 'Os dados do Colaborador(a) foi alterado com sucesso.',
  //              icon: "success",
  //              showConfirmButton: true,
  //              showCloseButton: true,
  //              confirmButtonColor: "#F39200"
  //            }).then((result) => {
  //              close();
  //            })
  //             })
  //             } else {
  //               close();
  //             }   
  //           })
  //       } catch (error) {
  //         // console.log(error);
  //       }
  //   }

    // console.log(openEstimate)
    console.log(fatura)

  return (
    <><Dialog
      className={styles.dialog}
      open={openEstimate}
      fullScreen={fullScreen}
      maxWidth="md"
      onClose={() => close()}
    >
      <IconButton
        aria-label="close"
        onClick={() => close()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      ><CloseIcon /></IconButton>
      <DialogTitle align="center">Solicitar Orçamento</DialogTitle>
      {viewVisit && viewVisit ? 
        <DialogContent>

        </DialogContent>
      : 
      <DialogContent>
        <DialogContentText sx={{ textAlign: "center" }}>
          Preencha os campos abaixo para solicitar um <b>Orçamento</b>.
        </DialogContentText>
        <form onSubmit={onVisit}>
          <ThemeProvider theme={theme}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nome Completo"
              type="text"
              value={data && data.nome}
              fullWidth
              required
              variant="outlined" />
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
                  required />
              </div>
              <div className={styles.input_telefone}>
                <span>CPF</span>
                <PatternFormat
                  className="label__input"
                  onChange={(e) => setCpf(e.target.value)}
                  format="###.###.###-##"
                  mask="_"
                  placeholder="000.000.000-00"
                  value={cpf ? cpf : ''}
                  label="Telefone"
                  minLength={9}
                  variant="outlined"
                  color="primary"
                  required />
              </div>
            </div>
            <div className={styles.label_content}>
              <div className={styles.input_telefone}>
                <span>Data de Nascimento</span>
                <PatternFormat
                  className="label__input"
                  onChange={(e) => setDataNascimento(e.target.value)}
                  format="##/##/####"
                  mask="_"
                  placeholder="00/00/0000"
                  value={dataNascimento ? dataNascimento : ''}
                  label="Data de Nascimento"
                  minLength={9}
                  variant="outlined"
                  color="primary"
                  required />
              </div>
              <div className={styles.input_telefone}>
                <span>Gasto com Energia</span>
                <CurrencyInput
                  fullWidth
                  // customInput={TextField}
                  className="label__text"
                  label="Consumo Médio de Energia"
                  placeholder="R$ 00"
                  intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                  onValueChange={handleOnValueChange}
                  fixedDecimalLength={0}
                  value={consumo || ''}
                  min={50}
                  required
                  color="primary" />
              </div>
            </div>
            <FormControl margin='dense' fullWidth>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Rua & Número"
                type="text"
                required
                value={endereco ? endereco : ''}
                onChange={(e) => setEndereco(e.target.value)}
                variant="outlined" />
            </FormControl>
            <div className={styles.label_content}>
              <div className={styles.input_endereco}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Bairro"
                  type="text"
                  value={bairro ? bairro : ''}
                  onChange={(e) => setBairro(e.target.value)}
                  fullWidth
                  required
                  variant="outlined" /> </div>
              <div className={styles.input_endereco}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Cidade"
                  type="text"
                  value={cidade ? cidade : ''}
                  onChange={(e) => setCidade(e.target.value)}
                  fullWidth
                  required
                  variant="outlined" />
              </div>
            </div>
            <div className={styles.label_last}>
            <p>Cliente pretende adquirir equipamento elétrico de alto consumo após a instalação do sistema FV?</p>
            <TextField
                  margin="dense"
                  id="name"
                  type="text"
                  rows={2}
                  label="Resposta"
                  multiline
                  value={anotacao ? anotacao : ''}
                  onChange={(e) => setAnotacao(e.target.value)}
                  fullWidth
                  required
                  variant="outlined" />
            </div>
            <div className={styles.input_file}>
              <Button component="label" variant="contained" onChange={(e) => setFatura({ file: URL.createObjectURL(e.target.files[0]) })} startIcon={<CloudUploadIcon />}>
                Enviar Fatura
                <VisuallyHiddenInput type="file" />
              </Button>
              {fatura &&
                <Button variant='outlined' color='success' onClick={() => setOpenFatura(true)} endIcon={<CheckIcon />}>Visualizar</Button>}
              <div className={styles.input_file_icon}></div>
            </div>
          </ThemeProvider>
          <ThemeProvider theme={theme}>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button variant='outlined' type="submit">Proximo</Button>
              <Button variant='outlined' color="error" onClick={() => close()}>Cancelar</Button>
            </DialogActions>
          </ThemeProvider>
        </form>
      </DialogContent>
      }
    </Dialog>
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
        <img src={fatura && fatura.file} alt='' />
      </div>
      <ThemeProvider theme={theme}>
      <DialogActions className={styles.fatura_buttons} sx={{ justifyContent: 'center' }}>
              <Button variant='contained' onClick={() => setOpenFatura(false)}>FECHAR</Button>
            </DialogActions>
      </ThemeProvider>
      </Dialog></>
  )
}

export default Estimate