import { useState } from "react";
// import CurrencyInput from "react-currency-input-field";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { theme } from "../../../data/theme";
import { ThemeProvider } from "@mui/material";
import DialogContentText from "@mui/material/DialogContentText";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import styles from "./styles.module.scss";

const Report = ({view, openBox, closeBox, collectData }) => {
  const [feedback, setFeedback] = useState("");

  console.log(collectData)

  const onSubmit = (e) => {
    e.preventDefault();
    closeBox()
      Swal.fire({
        title: 'CORPBRASIL',
        html: `Todos os dados preenchidos estão corretos?`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if(result.isConfirmed) {
          // let telefoneFormatado = telefone.replace(/\D/g, '');
          // collectData({
          //   nome: nome,
          //   telefone: '55' + telefoneFormatado,
          //   dataNouF: data,
          //   simulacao: simulacao,
          //   cpfOuCnpj: cpfCnpj,
          //   pagamento: confirm,
          //   proposta: confirm2,
          //   inversor10kW: confirm3,
          //   link: confirm4
          // })
          setFeedback('');
          // closeBox()
        } else {
          openBox();
        }
      })
  }

  const close = () => {
    closeBox();
    setFeedback('');
  }

  return (
    <Dialog
      open={view}
      fullWidth={true}
      maxWidth="sm"
      size
      onClose={() => closeBox()}
    >
      <DialogTitle align="center">Relatório Comercial - Lia</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: "center" }}>
          Deixe um feedback sobre o desempenho da consultora.
          <div className={styles.result}>
            <h4 className={styles.result_title}>Relátorio Comercial - 01/10/2023 até 07/10/2023</h4>
            <div className={styles.result_item}>
            <h4>Visitas</h4>
              <ul>
                <li>
                Foram agendadas <b>{collectData.visitas} visitas</b> ao longo da semana.
              </li>
                <li>
                Destas, <b>{collectData.visitas_confirmada} visitas</b> foram confirmadas e <b>{collectData.visitas_naoConfirmada} visitas</b> não foram confirmadas.
              </li>
                <li>
                A meta de visitas para a semana era de <b>{collectData.visitas_meta}</b>, e você antigiu <b>{collectData.visitas_metaR}%</b>.
              </li>
              </ul>
            </div>
            <div className={styles.result_item}>
            <h4>Vendas</h4>
              <ul>
              {collectData.visitas ? 
                <li>
                Não foram registradas vendas, resultando em <b>0%</b> da meta de vendas alcançada.
                </li> :
                <li>
                Foi registrado <b>{collectData.vendas} venda(s)</b>, resultando em <b>{collectData.vendas_metaR}%</b> da meta de vendas alcançada.
                </li> 
            }
                <li>
                A meta de vendas para a semana era de <b>{collectData.vendas_meta}</b>.
              </li>
              </ul>
            </div>
            <div className={styles.result_item}>
            <h4>Leads</h4>
              <ul>
                <li>
                Foram gerados <b>{collectData.leads} leads</b> durante a semana.
              </li>
                <li>
                <b>{collectData.leadsSheet_robo}</b> vieram do Robô, <b>{collectData.leadsSheet_meetime}</b> da Meetime e <b>{collectData.leadsSheet_ganho}</b> de Prospecção.
              </li>
              </ul>
            </div>
            <div className={styles.result_item}>
            <h4>Prospecção</h4>
              <ul>
                <li>
                Você possui <b>{collectData.prospecção ? collectData.prospecção : 0} leads ativos</b>.
              </li>
                <li>
                Durante o periodo, <b>{collectData.prospeccao_ganho} novo(s) lead(s)</b> foi adquirido, enquanto <b>{collectData.prospeccao_perdido} leads</b> foram perdidos.
              </li>
              </ul>
            </div>
            <div className={styles.result_item}>
            <h4>Atividades Realizadas</h4>
              <ul>
                <li>
                Um total de <b>{collectData.atividades}</b> atividades foram realizadas.
              </li>
                <li>
                A distribuição das atividades foi a seguinte:
                <ul>
                  <li>Email: {collectData.atividades_email} atividades</li>
                  <li>Ligação: {collectData.atividades_ligacao} atividades</li>
                  <li>WhatsApp: {collectData.atividades_whatsapp} atividade</li>
                </ul>
              </li>
              <li>Você alcançou <b>{collectData.atividades_metaR}%</b> da meta de atividades, com uma meta estabelecida de <b>{collectData.atividades_meta} atividades.</b></li>
              </ul>
            </div>
          </div>
        </DialogContentText>
        <form onSubmit={onSubmit}>
        <ThemeProvider theme={theme}>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Feedback"
          type="text"
          rows={5}
          multiline
          onChange={(e) => setFeedback(e.target.value)}
          value={feedback}
          fullWidth
          required
          variant="outlined"
        />
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
  );
};

export default Report;
