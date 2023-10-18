import { setDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2"; // cria alertas personalizado
import { auth } from "../../../../firebase/database";
import { dataBase } from "../../../../firebase/database";
import { Company } from "../../../../data/Data";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import "../../_modal.scss";

import Dialog from "@mui/material/Dialog";
import { PatternFormat } from "react-number-format";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { theme } from '../../../../data/theme';
import { ThemeProvider } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import styles from "./styles.module.scss";

const CreateAdmin = ({ members, open, close, openBox}) => {
  // const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState("Indicador");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [idCRM, setIdCRM] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [idCidade, setidCidade] = useState("");
  const [cidade, setCidade] = useState({ code: '01', cidade: 'Tietê' });
  const [checkID, setCheckID] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [checkCidade, setCheckCidade] = useState(false);

  const listCidades = [
    { code: '01', cidade: 'Tietê' },
    { code: '02', cidade: 'Jumirim' },
    { code: '03', cidade: 'Cerquilho' },
    { code: '04', cidade: 'Laranjal Paulista' },
    { code: '05', cidade: 'Porto Feliz' },
    { code: '06', cidade: 'Boituva' },
    { code: '07', cidade: 'Tatuí' },
    { code: '08', cidade: 'Cesário Lange' },
    { code: '09', cidade: 'Pereiras' },
    { code: '10', cidade: 'Conchas' },
    { code: '11', cidade: 'Porangaba' },
    { code: '12', cidade: 'Quadra' },
    { code: '13', cidade: 'Bofete' },
    { code: '14', cidade: 'Pardinho' },
    { code: '15', cidade: 'Anhembi' },
    { code: '16', cidade: 'Itatinga' },
    { code: '11', cidade: 'Botucatu' },
    { code: '18', cidade: 'Avaré' },
    { code: '19', cidade: 'Torre de Pedra' },
    { code: '20', cidade: 'Guareí' },
    { code: '21', cidade: 'Itapetininga' },
    { code: '22', cidade: 'Alambari' },
    { code: '23', cidade: 'São Miguel Arcanjo' },
    { code: '24', cidade: 'Pilar do Sul' },
    { code: '25', cidade: 'Sarapuí' },
    { code: '26', cidade: 'Piedade' },
    { code: '27', cidade: 'Salto de Pirapora' },
    { code: '28', cidade: 'Araçoiaba da Serra' },
    { code: '29', cidade: 'Capela do Alto' },
    { code: '30', cidade: 'Iperó' },
    { code: '31', cidade: 'Sorocaba' },
    { code: '32', cidade: 'Votorantim' },
    { code: '33', cidade: 'Mairinque' },
    { code: '34', cidade: 'Itu' },
    { code: '35', cidade: 'Aluminio' },
    { code: '36', cidade: 'São Roque' },
    { code: '37', cidade: 'Araçariguama' },
    { code: '38', cidade: 'Cabreuva' },
    { code: '39', cidade: 'Salto' },
    { code: '40', cidade: 'Indaiatuba' },
    { code: '41', cidade: 'Itupeva' },
    { code: '42', cidade: 'Elias Fausto' },
    { code: '43', cidade: 'Jundiaí' },
    { code: '44', cidade: 'Louveira' },
    { code: '45', cidade: 'Vinhedo' },
    { code: '46', cidade: 'Valinhos' },
    { code: '47', cidade: 'Itatiba' },
    { code: '48', cidade: 'Campinas' },
    { code: '49', cidade: 'Monte Mor' },
    { code: '50', cidade: 'Hortolândia' },
    { code: '51', cidade: 'Rafard' },
    { code: '52', cidade: 'Capivari' },
    { code: '53', cidade: 'Mombuca' },
    { code: '54', cidade: 'Sumaré' },
    { code: '55', cidade: 'Nova Odessa' },
    { code: '56', cidade: 'Paulínia' },
    { code: '57', cidade: 'Americana' },
    { code: '58', cidade: 'Rio das Pedras' },
    { code: '59', cidade: 'Saltinho' },
    { code: '60', cidade: 'Piracicaba' },
    { code: '61', cidade: "Santa Bárbara d'Oeste" },
    { code: '62', cidade: 'Iracemápolis' },
    { code: '63', cidade: 'Limeira' },
    { code: '64', cidade: 'Cosmópolis' },
    { code: '65', cidade: 'Holambra' },
    { code: '66', cidade: 'Jaguariúna' },
    { code: '67', cidade: 'Santo Antônio de Posse' },
    { code: '68', cidade: 'Artur Nogueira' },
    { code: '69', cidade: 'Engenheiro Coelho' },
    { code: '70', cidade: 'Mogi-mirim' },
    { code: '71', cidade: 'Conchal' },
    { code: '72', cidade: 'Araras' },
    { code: '73', cidade: 'Cordeirópolis' },
    { code: '74', cidade: 'Santa Gertrudes' },
    { code: '75', cidade: 'Rio Claro' },
    { code: '76', cidade: 'Leme' },
    { code: '77', cidade: 'Santa Cruz da Conceição' },
    { code: '78', cidade: 'Corumbataí' },
    { code: '79', cidade: 'Analândia' },
    { code: '80', cidade: 'São Carlos' },
    { code: '81', cidade: 'Brotas' },
    { code: '82', cidade: 'Itirapina' },
    { code: '83', cidade: 'Torrinha' },
    { code: '84', cidade: 'Ipeúna' },
    { code: '85', cidade: 'Charqueada' },
    { code: '86', cidade: 'São Pedro' },
    { code: '87', cidade: 'Águas de São Pedro' },
    { code: '88', cidade: 'Santa Maria da Serra' }
]

useEffect(() => {
  if(idCidade) {
    if(members && members.find((data) => data.id_user === cidade.code + ' - ' + idCidade)) {
      setCheckID(true);
    } else {
      setCheckID(false);
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
},[idCidade])

useEffect(() => {
    if(cidade === null) {
        setCheckCidade(true);
    } else {
        setCheckCidade(false);
      }
  
// eslint-disable-next-line react-hooks/exhaustive-deps
},[cidade])

useEffect(() => {
  if(email) {
    if(members && members.find((data) => data.email === email)) {
      setCheckEmail(true);
    } else {
      setCheckEmail(false);
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
},[email])


  const onSubmit = async (e) => {
    e.preventDefault();
    if(checkID || checkEmail || checkCidade){
      return null
    } else {
      close();
      try {
        Swal.fire({
          title: Company,
          text: `Você deseja cadastrar um novo Colaborador(a)?`,
          icon: "question",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await createUserWithEmailAndPassword(
              auth,
              email,
              senha
            )
              .then((userCredential) => {
                // Signed in
                updateProfile(auth.currentUser, {
                  displayName: nome,
                })
                  .then(() => {})
                  .catch((error) => {
                    // console.error(error);
                  });
                const user = userCredential.user;
                let data;
                switch(cargo) {
                  case 'Indicador':
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      cidade: cidade,
                      id_user: cidade.code + ' - ' + idCidade,
                      telefone: telefone
                    }
                  break
                  case 'Assistente de Vendas':
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      cidade: cidade,
                      id_crm: idCidade,
                      telefone: telefone
                    }
                  break
                  case 'Closer':
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      veiculo: veiculo,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      telefone: telefone
                    }
                  break
                  default: 
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      telefone: telefone
                    }
                }
                setDoc(doc(dataBase, "Membros", user.uid), data);
                // console.log(user);
                // ...
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                // ..
              });
            navigate("/");
            Swal.fire({
              title: Company,
              html: `O Colaborador(a) <b> ${nome}</b> foi cadastrado com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload(true); // Recarrega a pagina
              }
            });
          } else {
            openBox('create')
          }
        });
      } catch (error) {
        // console.log(error);
      }
    }
    // const findEmail = members.find((member) => member.email === email);
    // if (findEmail) {
    //   Swal.fire({
    //     title: Company,
    //     html: `O email <b>${email}</b> já está cadastrado no sistema.`,
    //     icon: "warning",
    //     showConfirmButton: true,
    //     showCloseButton: true,
    //     confirmButtonColor: "#F39200",
    //   });
    //   return openBox('create');
    // } else {
    // }
  };

  console.log(cidade)

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
      <DialogTitle align="center">Cadastrar Colaborador(a)</DialogTitle>
      <DialogContent>
        {/* <DialogContentText sx={{ textAlign: "center" }}>
          Preencha os campos abaixo para agendar a <b>Visita</b>.
        </DialogContentText> */}
        <form onSubmit={onSubmit}>
        <ThemeProvider theme={theme}>
          <div className={styles.label_content}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nome"
              type="text"
              value={nome ? nome : ''}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              autoFocus
              margin="dense"
              id="name"
              helperText={checkEmail ? 'Este email já está cadastrado' : ''}
              error={checkEmail}
              label="Email"
              type="email"
              value={email ? email : ''}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          </div>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Senha"
          type="text"
          value={senha ? senha : ''}
          onChange={(e) => setSenha(e.target.value)}
          fullWidth
          required
          variant="outlined"
        />
          <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
            <InputLabel id="simple-select-label">Cargo</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              sx={{ margin: '0.3rem 0' }}
              value={cargo ? cargo : ''}
              label="Cargo"
              onChange={(e) => setCargo(e.target.value)}
              required
            >
              <MenuItem value="Indicador">Indicador</MenuItem>
              <MenuItem value="Assistente de Vendas">Assistente de Vendas</MenuItem>
              <MenuItem value="Closer">Especialista em Apresentação e Fechamento</MenuItem>
              <MenuItem value="Gestor">Gestor</MenuItem>
            </Select>
          </FormControl>
          <div className={styles.label_content}>

          {cargo && cargo === 'Indicador' && 
            <><Autocomplete
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
                <TextField
                  label="ID"
                  helperText={checkID ? 'Já existe um indicador com esse ID' : ''}
                  error={checkID}
                  fullWidth
                  required
                  margin="dense"
                  id="outlined-start-adornment"
                  onChange={(e) => setidCidade(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{cidade && cidade.code} - </InputAdornment>,
                  }}
                />
                  </>
          }
          {cargo && cargo === 'Assistente de Vendas' && 
            <TextField
            margin="dense"
            id="name"
            label="ID do CRM"
            type="number"
            value={idCRM ? idCRM : ''}
            onChange={(e) => setIdCRM(e.target.value)}
            fullWidth
            required
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
            required
            variant="outlined"
          />}
          </div>
        <div className={styles.label_content}>
          <div className={styles.input_telefone}>
            <span>Telefone</span>
            <PatternFormat
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
             <p className={styles.name_color}>{nome && nome}</p>
          </div> */}
        </div>
          </ThemeProvider>
          <ThemeProvider theme={theme}>
          <DialogActions sx={{ justifyContent: 'center', marginTop: '1rem' }}>
          <Button type="submit">Confirmar</Button>
          <Button onClick={() => close()}>Cancelar</Button>
        </DialogActions>
          </ThemeProvider>
        </form>
      </DialogContent>
    </Dialog>
    // <div className="modal-visit">
    //   <div className="modal-box-visit">
    //     <div className="modal-box-visit__close">
    //       <button onClick={returnAdmin} className="btn-close" />
    //     </div>
    //     <h4>Cadastrar novo Colaborador</h4>
    //     <form className="form-visit" onSubmit={handleSubmit(onSubmit)}>
    //       <label className="form-visit__label">
    //         <input
    //           className="form-visit__text"
    //           type="text"
    //           placeholder="Digite o nome"
    //           autoComplete="off"
    //           onBlur={(e) => setNome(e.target.value)}
    //           required
    //           minLength={3}
    //         />
    //       </label>
    //       <label className="form-visit__label">
    //         <input
    //           className="form-visit__text"
    //           type="email"
    //           placeholder="Digite o email"
    //           autoComplete="off"
    //           {...register("email")}
    //           required
    //         />
    //       </label>
    //       <div className="form-visit__double">
    //         <label className="form-visit__label">
    //           <input
    //             className="form-visit__text"
    //             type="text"
    //             placeholder="Digite a senha"
    //             autoComplete="off"
    //             {...register("senha")}
    //             required
    //             minLength={6}
    //           />
    //         </label>
    //         <select
    //           value={cargo}
    //           name="cargo"
    //           onChange={(e) => setCargo(e.target.value)}
    //         >
    //           <option value="Vendedor(a)">Vendedor(a)</option>
    //           <option value="Técnico">Técnico</option>
    //           <option value="Administrador">Administrador</option>
    //         </select>
    //       </div>
    //       {cargo === "Vendedor(a)" || cargo === "Administrador" ? (
    //         <>
    //           <div className="form-visit__color">
    //             <p>Escolha uma cor de destaque</p>
    //             <input
    //               type="color"
    //               autoComplete="off"
    //               value={cor}
    //               onChange={(e) => setCor(e.target.value)}
    //               required
    //             />
    //           </div>
    //           {nome && (
    //             <div className="form-visit__exemple">
    //               <h3>Resultado:</h3>
    //               <p
    //                 style={
    //                   cor && {
    //                     backgroundColor: cor,
    //                     borderBottom: "1px solid" + cor,
    //                     borderRight: "1px solid" + cor,
    //                     borderLeft: "1px solid" + cor,
    //                     color: "#fff",
    //                     textShadow: "#5a5a5a -1px 0px 5px",
    //                   }
    //                 }
    //               >
    //                 {nome}
    //               </p>
    //             </div>
    //           )}
    //         </>
    //       ) : (
    //         <label className="form-visit__label">
    //           <input
    //             className="form-visit__text"
    //             type="number"
    //             placeholder="Digite o número do veículo"
    //             autoComplete="off"
    //             onInput={(e) => (e.target.value = e.target.value.slice(0, 3))}
    //             {...register("veiculo")}
    //             required
    //           />
    //         </label>
    //       )}
    //       <input className="form-visit__btn" type="submit" value="CRIAR" />
    //     </form>
    //   </div>
    // </div>
  );
};

export default CreateAdmin;
