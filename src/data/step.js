export const step = [
  {
     title: 'Notificação',
     target: '#notificação',
     disableBeacon: true,
     content: <p>Passo 1: Essa área é responsável por <b>exibir as atualizações sobre apresentação, orçamento e entre outros.</b> Quando você receber uma nova notificação, um circulo vermelho será exibido
      com a quantidade de notificação. <b>Basta clicar no sino para visualizar a notificação</b>.</p>
  },
  {
     title: 'Sair',
     target: '#sair',
     disableBeacon: true,
     content: <p>Passo 2: Para sair da sua conta, basta <b>clicar nesse botão</b> e você será deslogado.</p>
  },
 {
    title: 'Cache',
    target: '.cache',
    disableBeacon: true,
    content: <p>Passo 3: Caso você tenha algum problema com o Sistema, clique nesse botão para realizar uma <b>limpeza de cache</b></p>
 },
 {
   title: 'Prospecção',
   target: '.prospecção',
   disableBeacon: true,
   disableOverlayClose: true,
   hideCloseButton: true,
   hideFooter: true,
   spotlightClicks: true,
   content: <p>Passo 4: Esse botão levará você a página de <b>Prospecção</b>, aonde você irá cadastrar os seus clientes e solicitar orçamento. <b>Clique no botão para continuar</b></p>
},
 {
   title: 'Página de Prospecção',
   target: '#titulo',
   disableBeacon: true,
   content: <p>Passo 5: Seja bem vindo a página de <b>Prospecção!</b></p>
},
 {
   title: 'Cadastro de Cliente',
   target: '#cadastrar',
   disableBeacon: true,
   content: <p>Passo 6: Para cadastrar um cliente, basta clicar no botão <b>Cadastrar Cliente</b>.</p>
},
 {
   title: 'Cadastro de Cliente',
   target: '#aviso',
   disableBeacon: true,
   content: <p>Passo 7: Fique atento com os campos obrigátorios. <b>O cliente só pode ser cadastrado caso os campos obrigatórios estejam preenchidos.</b></p>
},
 {
   title: 'Anotação',
   target: '#anotação',
   disableBeacon: true,
   placement: 'top',
   content: <p>Passo 8: Caso você queira deixar alguma observação sobre o cliente, basta inserir nesse campo.</p>
},
 {
   title: 'Cadastro de Cliente',
   target: '#criar',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 9: Após todos os campos obrigatório preenchido, basta clicar em <b>CADASTRAR</b> para cadastrar o cliente.</p>
},
 {
   title: 'Lista de Clientes',
   target: '#lista',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 10: Nessa área estará todos os clientes que você já cadastrou.</p>
},
 {
   title: 'Aviso sobre o Cliente',
   target: '#status',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 11: Essa área é responsável por mostrar avisos referente a situação do cliente, desde um pedido de orçamento até a apresentação.
   A data acima mostra quando que o aviso surgiu.</p>
},
 {
   title: 'Etapa de situação',
   target: '#etapa',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 12: Aqui mostra todo o processo que o cliente irá percorrer para ser efetivado pela empresa. 
    O circulo em azul identifica em qual processo o cliente está.</p>
},
 {
   title: 'Alterar dados',
   target: '#alterarDados',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 13: Caso precise alterar ou adicionar algum dado do cliente, clique no botão 
    O circulo em azul identifica em qual processo o cliente está.</p>
},
 {
   title: 'Alterar dados',
   target: '#nome',
   placement: 'bottom',
   disableBeacon: true,
   content: <p>Passo 14: Basta clicar no campo escolhido para alterar o dado associado.</p>
},
 {
   title: 'Confirmar ou Cancelar alteração',
   target: '.button-edit',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 15: Após alterar o dado escolhido, clique em <b>Confirmar</b> para concluir a alteração.</p>
},
 {
   title: 'Solicitar Orçamento',
   target: '#botaoOrçamento',
   placement: 'top',
   disableBeacon: true,
   content: <p>Passo 16: Para pedir um orçamento para o cliente, clique em <b>GERAR ORÇAMENTO</b>.</p>
},
 {
   title: 'Atenção',
   target: '#avisoOrçamento',
   placement: 'bottom',
   disableBeacon: true,
   content: <p>Passo 17: Para solicitar o orçamento, é necessario <b>preencher todos os campos e enviar uma foto da fatura de energia</b> do cliente.</p>
},
 {
   title: 'Envio de Fatura',
   target: '#enviarFatura',
   placement: 'bottom',
   disableBeacon: true,
   content: <p>Passo 18: Para enviar a fatura, clique em <b>ENVIAR FATURA</b> e escolha foto da fatura</p>
},
 {
   title: 'Envio de Fatura',
   target: '#botãoProximo',
   placement: 'bottom',
   disableBeacon: true,
   content: <p>Passo 19: Após ter preenchido todos os campos e enviado a fatura, clique em <b>PROXIMO</b> para escolher o <b>dia de apresentação do orçamento.</b></p>
},
];

export default step;