export const step = [
  {
     title: 'Notificação',
     target: '#notificação',
     disableBeacon: true,
     content: <p>Essa área é responsável por <b>exibir as atualizações sobre apresentação, orçamento e entre outros.</b> Quando você receber uma nova notificação, um circulo vermelho será exibido
      com a quantidade de notificação. <b>Basta clicar no sino para visualizar a notificação</b>.</p>
  },
  {
     title: 'Sair',
     target: '#sair',
     disableBeacon: true,
     content: <p>Para sair da sua conta, basta <b>clicar nesse botão</b> e você será deslogado.</p>
  },
 {
    title: 'Cache',
    target: '.cache',
    disableBeacon: true,
    content: <p>Caso você tenha algum problema com o Sistema, clique nesse botão para realizar uma <b>limpeza de cache</b></p>
 },
 {
   title: 'Prospecção',
   target: '.prospecção',
   disableBeacon: true,
   placement: 'bottom',
   content: <p>Esse botão levará você a página de <b>Prospecção</b>, aonde você irá cadastrar os seus clientes e solicitar orçamento. <b>Clique no botão para continuar</b></p>
},
 {
   title: 'Página de Prospecção',
   target: '#titulo',
   disableBeacon: true,
   hideBackButton: true,
   content: <p>Seja bem vindo a página de <b>Prospecção!</b></p>
},
 {
   title: 'Cadastro de Cliente',
   target: '#cadastrar',
   disableBeacon: true,
   content: <p>Para cadastrar um cliente, basta clicar no botão <b>Cadastrar Cliente</b>.</p>
},
 {
   title: 'Cadastro de Cliente',
   target: '#aviso',
   disableBeacon: true,
   content: <p>Fique atento com os campos obrigátorios. <b>O cliente só pode ser cadastrado caso os campos obrigatórios estejam preenchidos.</b></p>
},
 {
   title: 'Anotação',
   target: '#anotação',
   disableBeacon: true,
   placement: 'top',
   content: <p>Caso você queira deixar alguma observação sobre o cliente, basta inserir nesse campo.</p>
},
 {
   title: 'Cadastro de Cliente',
   target: '#criar',
   placement: 'top',
   disableBeacon: true,
   content: <p>Após todos os campos obrigatório preenchido, basta clicar em <b>CADASTRAR</b> para cadastrar o cliente.</p>
},
 {
   title: 'Lista de Clientes',
   target: '#lista',
   placement: 'top',
   disableBeacon: true,
   content: <p>Nessa área estará todos os clientes que você já cadastrou.</p>
},
 {
   title: 'Situação',
   target: '#ativo',
   placement: 'top',
   disableBeacon: true,
   content: <p>Aqui mostra a situação do lead, que vai desde <b>Ativo</b> até <b>Finalizado.</b></p>
},
 {
   title: 'Aviso sobre o Cliente',
   target: '#status',
   placement: 'top',
   disableBeacon: true,
   content: <p>Essa área é responsável por mostrar avisos referente a situação do cliente, desde um pedido de orçamento até a apresentação.
   A data acima mostra quando que o aviso surgiu.</p>
},
 {
   title: 'Etapa de situação',
   target: '#etapa',
   placement: 'top',
   disableBeacon: true,
   content: <p>Aqui mostra todo o processo que o cliente irá percorrer para ser efetivado pela empresa. 
    O circulo em azul identifica em qual processo o cliente está.</p>
},
 {
   title: 'Alterar dados',
   target: '#alterarDados',
   placement: 'top',
   disableBeacon: true,
   content: <p>Caso precise alterar ou adicionar algum dado do cliente, clique no botão 
    O circulo em azul identifica em qual processo o cliente está.</p>
},
 {
   title: 'Alterar dados',
   target: '#nome',
   placement: 'bottom',
   disableBeacon: true,
   content: <p> Basta clicar no campo escolhido para alterar o dado associado.</p>
},
 {
   title: 'Confirmar ou Cancelar alteração',
   target: '.button-edit',
   placement: 'top',
   disableBeacon: true,
   content: <p> Após alterar o dado escolhido, clique em <b>Confirmar</b> para concluir a alteração.</p>
},
 {
   title: 'Solicitar Orçamento',
   target: '#botaoOrçamento',
   placement: 'top',
   disableBeacon: true,
   content: <p> Para pedir um orçamento para o cliente, clique em <b>GERAR ORÇAMENTO</b>.</p>
},
 {
   title: 'Atenção',
   target: '#avisoOrçamento',
   placement: 'bottom',
   disableBeacon: true,
   disableScrolling: true,
   hideBackButton: true,
   content: <p> Para solicitar o orçamento, é necessario <b>preencher todos os campos e enviar uma foto da fatura de energia</b> do cliente.</p>
},
 {
   title: 'Envio de Fatura',
   target: '#enviarFatura',
   placement: 'top',
   disableBeacon: true,
   disableScrolling: true,
   content: <p> Para enviar a fatura, clique em <b>ENVIAR FATURA</b> e escolha foto da fatura</p>
},
 {
   title: 'Envio de Fatura',
   target: '#botãoProximo',
   placement: 'top',
   disableBeacon: true,
   disableScrolling: true,
   content: <p> Após ter preenchido todos os campos e enviado a fatura, clique em <b>PROXIMO</b> para escolher o <b>data de apresentação do orçamento.</b></p>
},
 {
   title: 'Data de Apresentação',
   target: '#escolherData',
   placement: 'bottom',
   disableBeacon: true,
   hideBackButton: true,
   content: <p> Após preencher o endereço, escolha o <b>dia e o horário</b> para a <b>Especialista em Orçamento</b> apresentar o orçamento.</p>
},
 {
   title: 'Apresentações Marcadas',
   target: '#listaVisitas',
   placement: 'top',
   disableBeacon: true,
   content: <p> Caso já tenha outras apresentações marcadas, seram exibidas nessa tabela.</p>
},
 {
   title: 'Previsão de Apresentação',
   target: '#previsão',
   placement: 'top',
   disableBeacon: true,
   content: <p> Aqui mostra o tempo que o especialista levará com a apresentação. Caso o <b>tempo exceda de uma apresentação já existente</b>, a caixa ficará vermelha
    e você terá que <b>alterar o horário ou a data da apresentação.</b>
   </p>
},
 {
   title: 'Apresentação',
   target: '#botoesApresentação',
   placement: 'top',
   disableBeacon: true,
   content: <p>Após estar tudo certo com a data de apresentação, clique em <b>SOLICITAR</b> para enviar o pedido de orçamento.</p>
},
];

export default step;